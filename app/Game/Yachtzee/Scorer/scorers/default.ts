import {
  dieValue as v,
  hasNConsecutiveValues,
  nOfAKind,
  sumDiceOfValue,
} from "App/Game/Yachtzee/Scorer/helpers";
import {
  groupBy,
  mapObject,
  sum,
  values,
} from "rambdax/immutable";
import type {
  ScoreHandler,
  ScoreHandlers,
} from "App/Game/Yachtzee/Scorer";
import type {
 ScoreSection,
} from "App/Game/Yachtzee/Scorer";

const UPPER_SCORERS: Record<string, ScoreHandler> = {
  "Aces": sumDiceOfValue(1),
  "Twos": sumDiceOfValue(2),
  "Threes": sumDiceOfValue(3),
  "Fours": sumDiceOfValue(4),
  "Fives": sumDiceOfValue(5),
  "Sixes": sumDiceOfValue(6),
};

const LOWER_SCORERS: Record<string, ScoreHandler> = {
  "Three of a Kind": nOfAKind(3),

  "Four of a Kind": nOfAKind(4),

  "Yahtzee": (dice) => dice.every((die) => v(die) === v(dice[0])) ? 50 : 0,

  "Chance": (dice) => sum(dice.map(v)),

  "Full House"(dice) {
    const grouped = groupBy((die) => String(v(die)), dice);
    const groups = values(grouped);

    const someGroupHasLength =
      (n: number) =>
        groups.some((group) => n === group.length)
    ;

    const has = someGroupHasLength(3) && someGroupHasLength(2);

    if (!has) {
      return 0;
    }

    return 25;
  },

  "Small Straight"(dice) {
    const has = hasNConsecutiveValues(4)(dice);

    if (!has) {
      return 0;
    }

    return 30;
  },

  "Large Straight"(dice) {
    const has = hasNConsecutiveValues(5)(dice);

    if (!has) {
      return 0;
    }

    return 40;
  },
};

export const BASE_SCORERS: ScoreHandlers = {
  ...mapObject((handler) => ({ section: "upper" as ScoreSection.upper, handler }), UPPER_SCORERS),
  ...mapObject((handler) => ({ section: "lower" as ScoreSection.lower, handler }), LOWER_SCORERS),
};
