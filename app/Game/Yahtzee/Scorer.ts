import {
  fromPairs,
  pick,
  toPairs,
} from "rambdax/immutable";
import type {
  Die,
} from "App/Game/Yahtzee/Die";
import type {
  DieLike,
} from "App/Game/Yahtzee/Scorer/helpers";
import {
  toDice,
} from "App/Game/Yahtzee/Scorer/helpers";
import {
  BASE_SCORERS,
} from "App/Game/Yahtzee/Scorer/scorers/default";
import type {
  Serializable,
} from "App/Meta/Serializable";

export type ScoreHandler = (dice: readonly Die[]) => number;

export enum ScoreSection {
  upper = "upper",
  lower = "lower",
}

export type ScoreHandlers = Record<string, { section: ScoreSection, handler: ScoreHandler }>;

export class Scorer implements Serializable {
  private scorers: ScoreHandlers = BASE_SCORERS;

  public addScorer(name: string, section: ScoreSection, handler: ScoreHandler) {
    this.scorers[name] = { section, handler };
  }

  public score(dice: readonly DieLike[]) {
    return this.scoreForScorers(this.scorers, dice);
  }

  public scorerNames() {
    return Object.keys(this.scorers);
  }

  public scoreFor(names: string[], dice: readonly DieLike[]) {
    const scorers = pick(names, this.scorers);

    return this.scoreForScorers(scorers, dice);
  }

  public serialize() {
    return null;
  }

  private scoreForScorers(scorers: ScoreHandlers, dice: readonly DieLike[]) {
    const entries = toPairs(scorers);
    const fixedDice = Object.freeze(toDice(dice));
    const scores = entries.map(([ name, { section, handler } ]) => [ name, { section, value: handler(fixedDice) } ] as const);

    return Object.freeze(fromPairs(scores));
  }
}
