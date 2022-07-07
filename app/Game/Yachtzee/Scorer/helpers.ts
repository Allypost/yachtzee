import {
  Die,
} from "App/Game/Yachtzee/Die";
import {
  any,
  equals,
  filter,
  groupBy,
  ifElse,
  map,
  piped,
  sum,
  values,
} from "rambdax/immutable";
import {
  always,
} from "rambdax";

export type DieLike = Die | number;

export const dieValue = (die: Die | number) => ("number" === typeof die ? die : die.getValue());

export const nOfAKind =
  (n: number) =>
    (dice: readonly Die[]) =>
      piped(
        dice,
        groupBy((die) => String(dieValue(die))),
        values,
        any((group) => n <= group.length),
        ifElse(
          equals(true),
          () => sum(dice.map(dieValue)),
          always(0),
        ),
      )
;

export const hasNConsecutiveValues =
  (n: number) =>
    (dice: readonly Die[]) =>
      dice
        .map(dieValue)
        .sort((sm, lg) => sm - lg)
        .map((x, i, arr) => x - arr[i - 1])
        .slice(1)
        .join("")
        .includes("1".repeat(n - 1))
;

export const sumDiceOfValue =
  (value: number) =>
    (dice: readonly DieLike[]): number =>
      piped(
        dice,
        map(dieValue),
        filter(equals(value)),
        sum,
      )
;

export const toDie =
  (maybeDie: DieLike) =>
    "number" === typeof maybeDie
      ? new Die(maybeDie)
      : maybeDie
;

export const toDice =
  (dice: readonly DieLike[]) =>
    dice.map(toDie)
;
