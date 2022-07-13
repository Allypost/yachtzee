import type {
  Player,
} from "App/Game/Yahtzee/Player";
import {
  Eventable,
} from "App/Meta/Eventable";
import type {
  Cup,
} from "App/Game/Yahtzee/Cup";
import type {
  ScoreSheet,
} from "App/Game/Yahtzee/ScoreSheet";
import type {
  Serializable,
} from "App/Meta/Serializable";
import {
  serialize,
} from "App/Meta/Serializable";
import type {
  Promisable,
} from "type-fest";

type TypeOfClassMethod<T, M extends keyof T> = T[M] extends ((...args: any[]) => any) ? T[M] : never;
type ClassMethodParams<T, M extends keyof T> = Parameters<TypeOfClassMethod<T, M>>;

export type GameActions = {
  "roll": ClassMethodParams<Cup, "roll">;
  "hold die": ClassMethodParams<Cup, "hold">;
  "release die": ClassMethodParams<Cup, "release">;
  "pick score": ClassMethodParams<ScoreSheet, "useScore">;
};

type GameEvents = {
  "after turn": () => Promisable<void>,
  "next player turn": (player: Player) => Promisable<void>,
  "action": <Action extends keyof GameActions>(player: Player, action: Action, args: GameActions[Action]) => Promisable<void>;
  "after action": <Action extends keyof GameActions>(player: Player, action: Action, args: GameActions[Action]) => Promisable<void>;
  "game over": (game: Game, winner: Player) => Promisable<void>,
}

type GameHistoryAction<Action extends keyof GameActions> = {
  action: Action;
  by: Player["id"];
  args: GameActions[Action];
};

export type GameHistory = {
  players: Player[];
  actions: GameHistoryAction<keyof GameActions>[];
}

export class GameNoPlayersError extends Error {
}

export class GameUnknownActionError extends Error {
}

export class Game extends Eventable<GameEvents> implements Serializable {
  private readonly players: Player[];

  private nowPlaying = 0;

  private turn = 0;

  private readonly history: GameHistory;

  constructor(players: Player[]) {
    if (0 === players.length) {
      throw new GameNoPlayersError();
    }

    super();
    this.players = players;
    this.history = {
      players,
      actions: [],
    };
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

  public isGameOver() {
    return this.players.every((player) => !player.scoreSheet.canPlay());
  }

  public getHistory() {
    return this.history;
  }

  public async do<Action extends keyof GameActions>(action: Action, ...args: GameActions[Action]) {
    const player = this.getNowPlayingPlayer();

    await this.publish("action", player, action, args);

    this.history.actions.push({
      action,
      by: player.id,
      args,
    });

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
        try {
          await this.endPlayerTurn();
          this.getNowPlayingPlayer().cup.resetRolls();
          await this.getNowPlayingPlayer().cup.roll();
        } catch {
        }
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
      over: this.isGameOver(),
    });
  }

  private async endPlayerTurn() {
    for (let i = 0; i < this.players.length; i++) {
      this.nowPlaying = (this.nowPlaying + 1) % this.players.length;

      if (0 === this.nowPlaying) {
        await this.endTurn();
      }

      if (this.getNowPlayingPlayer().scoreSheet.canPlay()) {
        break;
      }
    }

    if (this.isGameOver()) {
      await this.publish("game over", this, this.players.slice().sort((sm, lg) => lg.scoreSheet.getTotalScore() - sm.scoreSheet.getTotalScore()).shift()!);
    } else {
      await this.publish("next player turn", this.getNowPlayingPlayer());
    }
  }

  private async endTurn() {
    this.turn += 1;
    await this.publish("after turn");
  }
}
