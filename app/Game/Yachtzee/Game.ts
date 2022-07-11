import type {
  Player,
} from "App/Game/Yachtzee/Player";
import {
  Eventable,
} from "App/Meta/Eventable";
import type {
  Cup,
} from "App/Game/Yachtzee/Cup";
import type {
  ScoreSheet,
} from "App/Game/Yachtzee/ScoreSheet";
import type {
  Serializable,
} from "App/Meta/Serializable";
import {
  serialize,
} from "App/Meta/Serializable";

type TypeOfClassMethod<T, M extends keyof T> = T[M] extends ((...args: any[]) => any) ? T[M] : never;
type ClassMethodParams<T, M extends keyof T> = Parameters<TypeOfClassMethod<T, M>>;

type GameActions = {
  "roll": ClassMethodParams<Cup, "roll">;
  "hold die": ClassMethodParams<Cup, "hold">;
  "release die": ClassMethodParams<Cup, "release">;
  "pick score": ClassMethodParams<ScoreSheet, "useScore">;
};

type GameEvents = {
  "after turn": () => void,
  "action": <Action extends keyof GameActions>(player: Player, action: Action, args: GameActions[Action]) => void;
  "after action": <Action extends keyof GameActions>(player: Player, action: Action, args: GameActions[Action]) => void;
}

export class GameNoPlayersError extends Error {
}

export class GameUnknownActionError extends Error {
}

export class Game extends Eventable<GameEvents> implements Serializable {
  private readonly players: Player[];

  private nowPlaying = 0;

  private turn = 0;

  constructor(players: Player[]) {
    if (0 === players.length) {
      throw new GameNoPlayersError();
    }

    super();
    this.players = players;
  }

  public getPlayers() {
    return this.players;
  }

  public getNowPlayingPlayer() {
    return this.players[this.nowPlaying];
  }

  public getTurn() {
    return this.turn + 1;
  }

  public async do<Action extends keyof GameActions>(action: Action, ...args: GameActions[Action]) {
    const player = this.getNowPlayingPlayer();

    await this.publish("action", player, action, args);

    switch (action) {
      case "roll": {
        await player.cup.roll();
        break;
      }
      case "hold die": {
        player.cup.hold(...args as GameActions["hold die"]);
        break;
      }
      case "release die": {
        player.cup.release(...args as GameActions["release die"]);
        break;
      }
      case "pick score": {
        player.scoreSheet.useScore(...args as GameActions["pick score"]);
        await this.endPlayerTurn();
        break;
      }
      default: {
        throw new GameUnknownActionError(`Unknown action: ${ action }`);
      }
    }

    await this.publish("after action", player, action, args);
  }

  public serialize() {
    return serialize({
      players: this.players,
      nowPlaying: this.nowPlaying,
      turn: this.turn,
    });
  }

  private async endPlayerTurn() {
    this.nowPlaying = (this.nowPlaying + 1) % this.players.length;

    if (0 === this.nowPlaying) {
      await this.endTurn();
    }
  }

  private async endTurn() {
    this.turn += 1;
    await this.publish("after turn");
  }
}
