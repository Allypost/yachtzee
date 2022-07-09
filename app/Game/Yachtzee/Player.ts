import {
  Cup,
} from "App/Game/Yachtzee/Cup";
import {
  ScoreSheet,
} from "App/Game/Yachtzee/ScoreSheet";
import {
  Serializable,
  serialize,
} from "App/Meta/Serializable";

export class Player implements Serializable {
  public readonly name: string;

  public readonly cup: Cup;

  public readonly scoreSheet: ScoreSheet;

  constructor(name: string, cup?: Cup, scoreSheet?: ScoreSheet) {
    this.name = name;
    this.cup = cup ?? new Cup();
    this.scoreSheet = scoreSheet ?? new ScoreSheet(this.cup);
  }

  public serialize() {
    return serialize({
      name: this.name,
      cup: this.cup.serialize(),
      scoreSheet: this.scoreSheet,
    });
  }
}
