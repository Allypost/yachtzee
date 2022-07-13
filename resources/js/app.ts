import "../css/app.scss";

import type {
  Socket,
} from "socket.io-client";
import {
  io,
} from "socket.io-client";
import type {
  ClientToServerEvents,
  LobbyInfo,
  ServerToClientEvents,
} from "App/Game/Yahtzee/Server/Socket";
import type {
  LobbyName,
} from "App/Game/Yahtzee/Lobby";
import type {
  Die as TDie,
} from "App/Game/Yahtzee/Die";
import {
  toPairs,
} from "rambdax/immutable";
import type {
  ScoreSection,
} from "App/Game/Yahtzee/Scorer";

type Maybe<T> = T | null | undefined;
type Player = LobbyInfo["clients"][0];

const getName =
  () => {
    const p = () => window.prompt("What is your name?");
    const queryParams = new URLSearchParams(window.location.search);

    let name: string | null =
      queryParams.get("name")
      ?? localStorage.getItem("name")
      ?? ""
    ;

    if (!name) {
      name = p();
    }

    while (3 > (name || "").length) {
      alert("Name must be at least 3 characters long");
      name = p();
    }

    return name;
  }
;

const q =
  <T extends ParentNode | Document>(element: T) =>
    <R extends HTMLElement>(selector: string) =>
      element.querySelector(selector)! as R
;

const template =
  (selector: string) =>
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    q(document)<HTMLTemplateElement>(`template${ selector }`)
      .content
      .cloneNode(true) as Element
;

const __Templates = <T extends Record<string, () => Element>>(x: T) => x;
const Templates = __Templates({
  LobbyListItem: () => template("#template__lobby-list-item"),
  LobbyInfo: () => template("#template__lobby-info"),
  GameInfo: () => template("#template__game-info"),
});

(() => {
  const name = getName();

  if (!name) {
    // eslint-disable-next-line no-console
    console.error("No name given");
    return;
  }

  const $lobbyList = q(document)("#lobby-list");
  const $lobbyInfo = q(document)("#lobby-info");
  const $gameInfo = q(document)("#game-info");
  const $connectionStatus = q(document)("#connection-status .status-text");

  const queryParams = new URLSearchParams(window.location.search);

  const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io({
    query: {
      name,
      lobby: queryParams.get("lobby") ?? "",
    },
  });
  (window as any).socket = socket;

  let currentLobby: Maybe<LobbyInfo> = null;
  let currentPlayer: Maybe<LobbyInfo["clients"][0]> = null;

  const lobbyLink =
    (lobby: LobbyInfo) => {
      const link = new URL(window.location.href);
      link.searchParams.delete("name");
      link.searchParams.set("lobby", lobby.id);
      return link.toString();
    }
  ;

  const LobbyListItem =
    (lobby: LobbyInfo) => {
      const $template = Templates.LobbyListItem();
      const $ = q($template);

      $(".lobby-name").textContent = lobby.name;

      const $playerList = $(".lobby-player-list");

      $<HTMLAnchorElement>(".lobby-link").href = lobbyLink(lobby);

      const PlayerItem =
        (player: Player) => {
          const $playerItem = $(".lobby-player-item").cloneNode(true) as Element;

          q($playerItem)(".lobby-player-item-name").textContent = player.name;

          return $playerItem;
        }
      ;

      $playerList.replaceChildren(...lobby.clients.map(PlayerItem));

      if (currentLobby?.id === lobby.id) {
        $(".join-btn").remove();
      } else {
        const $joinBtn = $(".join-btn");
        $joinBtn.addEventListener("click", () => {
          socket.emit("lobby:join", { id: lobby.id });
        });
        const $playerItem = $(".lobby-player-item").cloneNode(true) as Element;
        $playerItem.replaceChildren($joinBtn);
        $playerList.appendChild($playerItem);
      }

      return $template;
    }
  ;

  const LobbyList =
    (lobbies: LobbyInfo[]) => {
      const $div = document.createElement("div");

      {
        const $strong = document.createElement("strong");
        $strong.textContent = "Lobbies:";

        $div.appendChild($strong);
      }

      const $ul = document.createElement("ul");
      $ul.classList.add("lobby-list-items");
      $div.appendChild($ul);

      {
        const $createLobbyButton = document.createElement("button");
        $createLobbyButton.textContent = "Create new Lobby";
        $createLobbyButton.addEventListener("click", () => {
          let name: Maybe<string>;
          do {
            name = window.prompt("Enter lobby name");
          } while (3 > (name ?? "").length);

          socket.emit("lobby:create", name as LobbyName);
        });

        const $p = document.createElement("p");
        $p.appendChild($createLobbyButton);

        $div.appendChild($p);
      }

      const shownLobbies = lobbies.filter((lobby) => lobby.id !== currentLobby?.id);

      if (!shownLobbies.length) {
        const $em = document.createElement("em");
        $em.textContent = "No lobbies";

        const $li = document.createElement("li");
        $li.appendChild($em);
        $ul.appendChild($li);

        return $div;
      }

      for (const lobby of shownLobbies) {
        const $li = document.createElement("li");
        const $lobby = LobbyListItem(lobby);

        $li.appendChild($lobby);

        $ul.appendChild($li);
      }

      return $div;
    }
  ;

  const LobbyInfo =
    (lobby: Maybe<LobbyInfo>) => {
      if (!lobby) {
        const $em = document.createElement("em");
        $em.textContent = "No lobby selected";

        return $em;
      }

      const $template = Templates.LobbyInfo();
      const $ = q($template);

      $(".lobby-name").textContent = lobby.name;

      const $playerList = $(".lobby-player-list");

      const $joinLink = $<HTMLAnchorElement>(".lobby-link");

      const PlayerItem =
        (player: Player) => {
          const $playerItem = $(".lobby-player-item").cloneNode(true) as Element;
          const $removeAiButton = q($playerItem)(".lobby-player-ai-remove");

          q($playerItem)(".lobby-player-item-name").textContent = player.name;

          $playerItem.setAttribute("data-id", player.id);

          const $playerPoints = q($playerItem)(".lobby-player-item-points");
          if (lobby.game) {
            $playerPoints.innerText = String(player.scoreSheet.points);
            if (player.id === lobby.game.players[lobby.game.nowPlaying]?.id) {
              $playerItem.classList.add("playing");
            }
          } else {
            $playerPoints.remove();
          }

          if ((player as any).isAi && !lobby.game && currentPlayer?.id === lobby.clients[0].id) {
            $removeAiButton.addEventListener("click", () => {
              socket.emit("lobby:ai-player:remove", player.id);
            });
          } else {
            $removeAiButton.remove();
          }

          return $playerItem;
        }
      ;

      $playerList.replaceChildren(...lobby.clients.map(PlayerItem));

      const $lobbyActions = $(".lobby-actions-container");
      const $nowPlaying = $(".now-playing-container");

      if (lobby.game) {
        $lobbyActions.remove();
        $joinLink.remove();

        const nowPlaying = lobby.game.players[lobby.game.nowPlaying];

        q($nowPlaying)(".now-playing-name").textContent = nowPlaying.name;
        q($nowPlaying)(".now-playing-rolls").textContent = String(nowPlaying.cup.rolls);
        q($nowPlaying)(".now-playing-rolls-max").textContent = String(nowPlaying.cup.maxRolls);
      } else {
        const $leaveBtn = $(".leave-btn");
        const $startBtn = $(".start-btn");
        const $addBotBtn = $(".add-bot-btn");

        $joinLink.href = lobbyLink(lobby);

        if (currentPlayer?.id === lobby.clients[0].id) {
          $startBtn.addEventListener("click", () => {
            socket.emit("game:start");
          });

          $addBotBtn.addEventListener("click", () => {
            socket.emit("lobby:ai-player:add");
          });
        } else {
          $startBtn.remove();
          $addBotBtn.remove();
        }

        $leaveBtn.addEventListener("click", () => {
          socket.emit("lobby:leave");
        });

        $nowPlaying.remove();
      }

      return $template;
    }
  ;

  const GameInfo =
    (lobby: LobbyInfo) => {
      const game = lobby.game!;
      const nowPlaying = game.players[game.nowPlaying];
      const currentPlayerNowPlaying = currentPlayer?.id === nowPlaying.id;

      const $template = Templates.GameInfo();
      const $ = q($template);

      const $dice = $(".dice");

      const Die =
        (die: ReturnType<TDie["serialize"]>) => {
          const $die = q($dice)(".die").cloneNode(true) as HTMLElement;
          const $holdBtn = q($die)(".die-hold-btn");

          $die.setAttribute("data-value", String(die.value));

          if (die.held) {
            $holdBtn.textContent = "Release";
            $holdBtn.addEventListener("click", () => {
              socket.emit("game:do:release die", nowPlaying.cup.dice.indexOf(die));
            });
          } else {
            $holdBtn.textContent = "Hold";
            $holdBtn.addEventListener("click", () => {
              socket.emit("game:do:hold die", nowPlaying.cup.dice.indexOf(die));
            });
          }

          if (!currentPlayerNowPlaying) {
            $holdBtn.remove();
          }

          return $die;
        }
      ;

      const ScoreRow =
        (section: ScoreSection, name: string, score: number, used: boolean) => {
          const $template = $(".score-row").cloneNode(true) as HTMLElement;

          $template.classList.add(section);
          q($template)(".score-row-category").textContent = name;
          q($template)(".score-row-score").textContent = String(score);

          const $pickBtn = q($template)(".score-row-action-pick-btn");

          if (used) {
            $pickBtn.setAttribute("disabled", "disabled");
          } else {
            $pickBtn.addEventListener("click", () => {
              socket.emit("game:do:pick score", section, name);
            });
          }

          if (!currentPlayerNowPlaying) {
            $pickBtn.remove();
          }

          return $template;
        }
      ;

      $dice.replaceChildren(...nowPlaying.cup.dice.map(Die));
      {
        const $container = $(".score-row-container");
        const {
          scores,
          usedScores,
        } = nowPlaying.scoreSheet;

        $container.replaceChildren(...toPairs(scores).map(([ section, scores ]) => toPairs(scores).map(([ name, score ]) => {
          const usedScore = usedScores[section][name] as Maybe<number>;

          return ScoreRow(section as ScoreSection, name, usedScore ?? score, usedScore !== undefined);
        })).flat());
      }

      const $actions = $(".actions");

      if (!currentPlayerNowPlaying) {
        $actions.remove();
      } else {
        const $rollBtn = q($actions)(".action-roll");

        if (nowPlaying.cup.rolls < nowPlaying.cup.maxRolls) {
          $rollBtn.addEventListener("click", () => {
            socket.emit("game:do:roll");
          });
        } else {
          $rollBtn.setAttribute("disabled", "disabled");
        }
      }

      return $template;
    }
  ;

  socket.on("connect", () => {
    $connectionStatus.classList.add("connected");
  });

  socket.on("disconnect", (reason, description) => {
    $connectionStatus.classList.remove("connected");
    // eslint-disable-next-line no-console
    console.error("Disconnect", { reason, description });
  });

  socket.on("lobby:list", (lobbyList) => {
    $lobbyList.replaceChildren(LobbyList(lobbyList));
  });

  socket.on("lobby:update", (lobbyInfo) => {
    currentLobby = lobbyInfo;

    if (currentLobby) {
      const playerId = currentLobby.clientToPlayer[socket.id];

      currentPlayer = currentLobby.clients.find((player) => player.id === playerId)!;
    }

    if (currentLobby?.game) {
      $lobbyList.parentElement!.style.display = "none";
      $gameInfo.style.display = "initial";
      $gameInfo.replaceChildren(GameInfo(currentLobby));
    } else {
      $lobbyList.parentElement!.style.display = "initial";
      $gameInfo.style.display = "none";
    }

    $lobbyInfo.replaceChildren(LobbyInfo(currentLobby));
  });

  socket.on("game:over", (winner) => {
    alert(`${ winner.name } won!`);

    window.location.reload();
  });
})();
