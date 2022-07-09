import {
  Die,
} from "App/Game/Yachtzee/Die";
import {
  toDie,
} from "App/Game/Yachtzee/Scorer/helpers";
import {
  Eventable,
} from "App/Meta/Eventable";
import {
  Serializable,
  serialize,
} from "App/Meta/Serializable";

type CupEvents = {
  roll: (dice: Die[]) => void;
};

export class Cup extends Eventable<CupEvents> implements Serializable {
  public static readonly MAX_ROLLS = 3;

  public static readonly N_DICE = 5;

  private readonly dice: Die[];

  private rolls = 0;

  constructor(dice?: (Die | number)[]) {
    super();

    if (dice && dice.length !== Cup.N_DICE) {
      throw new Error(`Invalid number of dice. Must be exactly ${ Cup.N_DICE }`);
    }

    if (dice) {
      this.dice = Array.from(dice).map(toDie);
    } else {
      this.dice = Array.from({ length: Cup.N_DICE }, () => new Die());
    }
  }

  public getDice() {
    return this.dice.map((die) => die.asReadonly());
  }

  public diceValues() {
    return this.dice.map((die) => die.getValue());
  }

  public getRolls() {
    return this.rolls;
  }

  public async roll() {
    if (!this.canRoll()) {
      return this.rolls;
    }

    for (const die of this.dice) {
      die.roll();
    }

    this.rolls += 1;

    await this.publish("roll", this.dice);

    return this.rolls;
  }

  public hold(...indexes: (number | number[])[]) {
    for (const index of indexes.flat()) {
      this.dice[index].hold();
    }
  }

  public release(...indexes: (number | number[])[]) {
    for (const index of indexes.flat()) {
      this.dice[index].release();
    }
  }

  public resetRolls() {
    this.rolls = 0;
  }

  public asNotResettable() {
    return new Proxy(this, {
      get(target, prop) {
        if ("resetRolls" === prop) {
          return () => {
            // Do nothing
          };
        }

        return target[prop];
      },
    });
  }

  public serialize() {
    return serialize({
      rolls: this.rolls,
      dice: this.dice,
    });
  }

  private canRoll() {
    return this.rolls < Cup.MAX_ROLLS;
  }
}
