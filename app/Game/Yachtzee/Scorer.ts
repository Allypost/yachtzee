import {
  fromPairs,
  pick,
  toPairs,
} from "rambdax/immutable";
import {
  Die,
} from "App/Game/Yachtzee/Die";
import {
  DieLike,
  toDice,
} from "App/Game/Yachtzee/Scorer/helpers";
import {
  BASE_SCORERS,
} from "App/Game/Yachtzee/Scorer/scorers/default";

export type ScoreFn = (dice: readonly Die[]) => number;

export class Scorer {
  private scorers: Record<string, ScoreFn> = BASE_SCORERS;

  public addScorer(name: string, scoreFn: ScoreFn) {
    this.scorers[name] = scoreFn;
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

  private scoreForScorers(scorers: Record<string, ScoreFn>, dice: readonly DieLike[]) {
    const entries = toPairs(scorers);
    const fixedDice = Object.freeze(toDice(dice));
    const scores = entries.map(([ name, scoreFn ]) => [ name, scoreFn(fixedDice) ] as const);

    return fromPairs(scores);
  }
}
