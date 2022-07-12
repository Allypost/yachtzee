import {
  Cup,
} from "App/Game/Yachtzee/Cup";
import {
  ScoreSheet,
} from "App/Game/Yachtzee/ScoreSheet";
import type {
  Serializable,
} from "App/Meta/Serializable";
import {
  serialize,
} from "App/Meta/Serializable";

export class Player implements Serializable {
  public readonly id = `Player-${ Date.now().toString(36) }-${ Math.random().toString(36).substring(2) }`;

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
      id: this.id,
      name: this.name,
      cup: this.cup,
      scoreSheet: this.scoreSheet,
    });
  }
}
