import path from "node:path";
import {
  SocketServer,
} from "App/Services/WebSocket";
import type {
  Opaque,
} from "type-fest";
import {
  serialize,
} from "App/Meta/Serializable";
import {
  filter,
  piped,
} from "rambdax/immutable";
import type {
  LobbyId,
  LobbyName,
} from "App/Game/Yachtzee/Lobby";
import {
  AiPlayer,
  Lobby,
} from "App/Game/Yachtzee/Lobby";
import type {
  ClientToServerEvents,
  InterServerEvents,
  LobbyInfo,
  ServerToClientEvents,
  SocketData,
} from "App/Game/Yachtzee/Server/Socket";
import type {
  GameActions,
} from "App/Game/Yachtzee/Game";
import {
  JsonFileExporter,
} from "App/Exporters/JsonFileExporter";

type Maybe<T> = T | null | undefined;

type SocketId = Opaque<string, "Socket ID">;
type PlayerName = string;

const Lobbies = new Map<LobbyId, Lobby<SocketId>>();

setInterval(() => {
  const toBeRemoved = [] as LobbyId[];

  for (const [ lobbyId, lobby ] of Lobbies.entries()) {
    if (lobby.hasClients()) {
      continue;
    }

    toBeRemoved.push(lobbyId);
  }

  for (const lobbyId of toBeRemoved) {
    Lobbies.delete(lobbyId);
  }
}, 1000);

SocketServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>()
  .boot()
  .io
  .on("connection", async (socket) => {
    const socketId = socket.id as SocketId;
    const playerName = socket.handshake.query.name as PlayerName | null | undefined;
    const lobbyToJoin = socket.handshake.query.lobby as LobbyName | null | undefined;

    if (!playerName) {
      return socket.disconnect();
    }

    const lobbyList =
      () =>
        piped(
          Lobbies.values(),
          Array.from,
          filter((lobby) => !(lobby as Lobby).hasStarted()),
          serialize,
        ) as LobbyInfo[]
    ;

    const currentLobby =
      () =>
        serialize(socket.data.lobby)
    ;

    const sendLobbyUpdate =
      () => {
        socket.emit(
          "lobby:update",
          currentLobby(),
        );

        sendLobbyList();
      }
    ;

    const sendLobbyList =
      () =>
        socket.emit(
          "lobby:list",
          lobbyList(),
        )
    ;

    const broadcastLobbyList =
      () =>
        socket
          .broadcast
          .emit(
            "lobby:list",
            lobbyList(),
          )
    ;

    const broadcastLobbyUpdate =
      (lobbyId: LobbyId) => {
        socket
          .to(lobbyId)
          .emit(
            "lobby:update",
            serialize(Lobbies.get(lobbyId)),
          );

        broadcastLobbyList();
      }
    ;

    const createLobby =
      (lobbyName: LobbyName) => {
        const lobby = new Lobby<SocketId>(lobbyName);

        Lobbies.set(lobby.id, lobby);

        return lobby;
      }
    ;

    const getOrCreateLobby =
      (lobbyId: Maybe<LobbyId>, lobbyName: LobbyName) =>
        Lobbies.get(lobbyId ?? ("" as LobbyId))
        ?? createLobby(lobbyName)
    ;

    const lobbyLeave =
      async () => {
        const oldLobby = socket.data.lobby;
        socket.data.lobby = null;

        if (!oldLobby) {
          return;
        }

        await socket.leave(oldLobby.name);
        oldLobby.removePlayer(socketId);

        if (!oldLobby.hasClients()) {
          Lobbies.delete(oldLobby.id);
        }

        broadcastLobbyUpdate(oldLobby.id);
        sendLobbyUpdate();
      }
    ;

    const lobbyJoin =
      async (lobbyId: Maybe<LobbyId>, lobbyName: LobbyName) => {
        const newLobby = getOrCreateLobby(lobbyId, lobbyName);

        if (newLobby.id === socket.data.lobby?.id) {
          return;
        }

        await lobbyLeave();

        newLobby.addPlayer(socketId, playerName);
        socket.data.lobby = newLobby;
        await socket.join(newLobby.id);

        broadcastLobbyUpdate(newLobby.id);
        sendLobbyUpdate();
      }
    ;

    const lobbyCreate =
      (lobbyName: LobbyName) => {
        const newLobby = createLobby(lobbyName);

        return lobbyJoin(newLobby.id, newLobby.name);
      }
    ;

    const initSocket =
      async () => {
        await socket.join(socketId);

        if (lobbyToJoin) {
          await lobbyJoin(String(lobbyToJoin) as LobbyId, lobbyToJoin);
        }

        sendLobbyUpdate();
      }
    ;

    socket.on("lobby:create", async (lobbyName) => {
      await lobbyCreate(lobbyName);
    });

    socket.on("lobby:join", async (data) => {
      if ("id" in data) {
        return await lobbyJoin(data.id, String(data.id) as LobbyName);
      }

      if ("name" in data) {
        return await lobbyJoin(null, data.name);
      }
    });

    socket.on("lobby:list", () => {
      sendLobbyList();
    });

    socket.on("lobby:info", () => {
      sendLobbyUpdate();
    });

    socket.on("lobby:ai-player:add", () => {
      const { lobby } = socket.data;

      if (!lobby) {
        return;
      }

      lobby.addAiPlayer();
      broadcastLobbyUpdate(lobby.id);
      sendLobbyUpdate();
    });

    socket.on("lobby:ai-player:remove", (playerId) => {
      const { lobby } = socket.data;

      if (!lobby) {
        return;
      }

      const player = lobby.getPlayer(playerId);
      if (!(player instanceof AiPlayer)) {
        return;
      }

      lobby.removePlayer(player.id as SocketId);

      broadcastLobbyUpdate(lobby.id);
      sendLobbyUpdate();
    });

    socket.on("game:start", () => {
      const { lobby } = socket.data;

      if (!lobby) {
        return;
      }

      lobby
        .startGame()
        .on("game over", (game, winner) => {
          socket.emit("game:over", winner.serialize());
          socket.to(lobby.id).emit("game:over", winner.serialize());

          void new JsonFileExporter()
            .export(
              serialize(game.getHistory()),
              path
                .join(
                  __dirname,
                  "..",
                  "exports",
                  "lobby",
                  `${ lobby.id }.${ Date.now() }.json`,
                )
              ,
            )
          ;
        })
      ;
      broadcastLobbyUpdate(lobby.id);
      sendLobbyUpdate();
    });

    socket.on("disconnect", lobbyLeave);
    socket.on("lobby:leave", lobbyLeave);

    const doIfTurn =
      <Action extends keyof GameActions>(
        lobby: Maybe<Lobby>,
        action: Action,
        ...actionArgs: GameActions[Action]
      ) => {
        if (!lobby) {
          return;
        }

        const game = lobby.getGame();

        if (!game) {
          return;
        }

        const currentPlayer = game.getNowPlayingPlayer();

        if (lobby.getPlayer(socket.id)?.id !== currentPlayer.id) {
          return;
        }

        return game.do(action, ...actionArgs);
      };

    socket.on("game:do:hold die", async (index) => {
      const indexes = Array.isArray(index) ? index : [ index ];
      const { lobby } = socket.data;

      if (!lobby) {
        return;
      }

      await doIfTurn(lobby, "hold die", indexes);
      broadcastLobbyUpdate(lobby.id);
      sendLobbyUpdate();
    });

    socket.on("game:do:release die", async (index) => {
      const indexes = Array.isArray(index) ? index : [ index ];
      const { lobby } = socket.data;

      if (!lobby) {
        return;
      }

      await doIfTurn(lobby, "release die", indexes);
      broadcastLobbyUpdate(lobby.id);
      sendLobbyUpdate();
    });

    socket.on("game:do:roll", async () => {
      const { lobby } = socket.data;

      if (!lobby) {
        return;
      }

      await doIfTurn(lobby, "roll");
      broadcastLobbyUpdate(lobby.id);
      sendLobbyUpdate();
    });

    socket.on("game:do:pick score", async (section, name) => {
      const { lobby } = socket.data;

      if (!lobby) {
        return;
      }

      await doIfTurn(lobby, "pick score", section, name);
      broadcastLobbyUpdate(lobby.id);
      sendLobbyUpdate();
    });

    if ("development" === process.env.NODE_ENV) {
      socket.onAny((event: string, ...args: unknown[]) => {
        console.log(`|> ${ socketId } | ${ event }`, ...args);
      });
    }

    await initSocket();
  })
;
