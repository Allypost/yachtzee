import {
  Scorer,
  ScoreSection,
} from "App/Game/Yachtzee/Scorer";
import type {
  Cup,
} from "App/Game/Yachtzee/Cup";
import {
  Eventable,
} from "App/Meta/Eventable";
import {
  cond,
  piped,
} from "rambdax";
import {
  always,
  map,
  nth,
  sum,
  toPairs,
  values,
} from "rambdax/immutable";
import type {
  Serializable,
} from "App/Meta/Serializable";
import {
  serialize,
} from "App/Meta/Serializable";
import type {
 DieLike,
} from "App/Game/Yachtzee/Scorer/helpers";

export class ScoreUsedError extends Error {
}

export class ScoreDoesNotExist extends Error {
}

type ScoreSheetEvents = {
  "score used": (name: string, score: number) => void;
};

const emptyScores =
  () =>
    piped(
      ScoreSection,
      values,
      map((section: ScoreSection) => [ section, new Map() ] as const),
      (x) => new Map(x),
    )
;

export class ScoreSheet extends Eventable<ScoreSheetEvents> implements Serializable {
  private readonly scorer: Scorer;

  private readonly usedScores: Map<ScoreSection, Map<string, number>> = emptyScores();

  private readonly scores: Map<ScoreSection, Map<string, number>> = emptyScores();

  constructor(cup: Cup, scorer?: Scorer) {
    super();
    this.scorer = scorer ?? new Scorer();

    cup.on("roll", (dice) => this.score(dice));
  }

  public serialize() {
    return serialize({
      usedScores: this.usedScores,
      scores: this.scores,
    });
  }

  public getScores() {
    return this.scores;
  }

  public getUsedScores() {
    return this.usedScores;
  }

  public getTotalScore() {
    return piped(
      this.scores,
      toPairs,
      // Sum all the scores in each section
      map(([ section, score ]: [ string, Record<string, number> ]) => [ section, sum(values(score)) ] as const),
      // Add bonus if applicable
      map(cond([
        [ ([ section, score ]) => "upper" === section && 63 <= score, ([ _section, score ]) => score + 35 ],
        [ always(true), nth(1) ],
      ])),
      sum,
    );
  }

  public useScore(section: ScoreSection, name: string) {
    if (this.usedScores.get(section)!.has(name)) {
      throw new ScoreUsedError(`Score ${ name } in section '${ section }' has already been used`);
    }

    if (!this.scores.get(section)!.has(name)) {
      throw new ScoreDoesNotExist(`Score ${ name } does not exist in section '${ section }'. Valid names: ${ Array.from(this.scores.get(section)!.keys()).join(", ") }`);
    }

    this.usedScores.get(section)!.set(name, this.scores.get(section)!.get(name)!);
  }

  private score(dice: DieLike[]) {
    const scored = this.scorer.score(dice);

    for (const [ name, score ] of Object.entries(scored)) {
      const { section, value } = score;

      this.scores.get(section)!.set(name, value);
    }

    return this;
  }
}
