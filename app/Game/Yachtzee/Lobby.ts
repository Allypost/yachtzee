import type {
  Serializable,
} from "App/Meta/Serializable";
import {
  serialize,
} from "App/Meta/Serializable";
import {
  Player,
} from "App/Game/Yachtzee/Player";
import {
  Game,
} from "App/Game/Yachtzee/Game";
import type {
  Opaque,
} from "type-fest";
import {
  Eventable,
} from "App/Meta/Eventable";
import {
  fromPairs,
  keys,
  map,
  piped,
} from "rambdax/immutable";
import {
  toPairs,
} from "rambdax";
import type {
  ScoreSection,
} from "App/Game/Yachtzee/Scorer";

const randomString = (prefix: string) => `${ prefix }${ Date.now().toString(36) }-${ Math.random().toString(36).substring(2) }`;

export type LobbyId = Opaque<string, "Lobby ID">;
export type LobbyName = Opaque<string, "Lobby Name">;

export class AiPlayer extends Player {
  async doTurn(game: Game) {
    if (!this.scoreSheet.canPlay()) {
      return;
    }

    const scores = serialize(this.scoreSheet.getScores());
    const usedScores = this.scoreSheet.getUsedScores();

    const availableScores = {} as typeof scores;

    for (const section of keys(scores)) {
      availableScores[section] = {};
      for (const name of keys(scores[section])) {
        if (usedScores.get(section)!.has(name)) {
          continue;
        }

        availableScores[section][name] = scores[section][name];
      }
    }

    const [ section, [ scoreName ] ] =
      toPairs(availableScores)
        .map(
          ([ section, scores ]) =>
            [
              section,
              toPairs(scores)
                .sort(([ _a, a ], [ _b, b ]) => b - a)
                .shift()!,
            ] as const,
        )
        .filter(([ _, candidate ]) => candidate)
        .sort(([ _as, [ _a, a ] ], [ _bs, [ _b, b ] ]) => b - a)
        .shift()!
    ;

    await game.do("pick score", section as ScoreSection, scoreName);
  }

  serialize() {
    return {
      ...super.serialize(),
      isAi: true,
    };
  }
}

export type LobbyEvents = {
  "game start": (game: Game) => void;
}

export class Lobby<ClientId = string, PlayerName extends string = string> extends Eventable<LobbyEvents> implements Serializable {
  public readonly id = randomString("Lobby-") as LobbyId;

  public readonly name: LobbyName;

  private readonly clients: Map<ClientId, Player> = new Map();

  private aiCount = 0;

  private game: Game | null = null;

  constructor(name: string) {
    super();
    this.name = name as LobbyName;
  }

  public addPlayer(clientId: ClientId, playerName: PlayerName) {
    if (this.clients.has(clientId)) {
      return this;
    }

    const player = new Player(playerName);

    this.clients.set(clientId, player);

    return this;
  }

  public addAiPlayer() {
    const player = new AiPlayer(`AI ${ ++this.aiCount }`);

    this.clients.set(player.id as unknown as ClientId, player);

    return this;
  }

  public getPlayer(clientId: ClientId) {
    return this.clients.get(clientId);
  }

  public removePlayer(clientId: ClientId) {
    const player = this.clients.get(clientId);

    if (!player) {
      return this;
    }

    this.clients.delete(clientId);

    return this;
  }

  public startGame() {
    if (this.game) {
      return this.game;
    }

    this.game = new Game(this.getClients());

    this.game.getPlayers().forEach((player) => {
      void player.cup.roll();
    });

    this.game.on("next player turn", async (player) => {
      if (player instanceof AiPlayer) {
        await player.doTurn(this.game!);
      }
    });

    return this.game;
  }

  public getGame() {
    return this.game;
  }

  public getClients() {
    return Array.from(this.clients.values());
  }

  public getClient(id: ClientId) {
    return this.clients.get(id);
  }

  public hasClients() {
    return 0 < this.clients.size;
  }

  public hasStarted() {
    return Boolean(this.game);
  }

  serialize() {
    return serialize({
      id: this.id,
      name: this.name,
      game: this.game,
      clients: Array.from(this.clients.values()),
      clientToPlayer: piped(
        this.clients.entries(),
        Array.from,
        map(([ clientId, player ]) => [ clientId, player.id ] as const),
        fromPairs,
      ),
    });
  }
}
