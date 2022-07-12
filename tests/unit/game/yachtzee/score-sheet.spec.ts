import {
  test,
} from "@japa/runner";
import {
  ScoreSheet,
} from "App/Game/Yachtzee/ScoreSheet";
import {
  Cup,
} from "App/Game/Yachtzee/Cup";
import {
  ScoreSection,
} from "App/Game/Yachtzee/Scorer";

test.group("Yachtzee / ScoreSheet", () => {
  test("scores are divided into sections on init", ({ assert }) => {
    const cup = new Cup();
    const scoreSheet = new ScoreSheet(cup);

    const scores = scoreSheet.getScores();

    for (const section of Object.values(ScoreSection)) {
      assert.isTrue(scores.has(section));
    }
  });

  test("scores are scored on init", ({ assert }) => {
    const cup = new Cup();
    const scoreSheet = new ScoreSheet(cup);

    const scores = scoreSheet.getScores();

    for (const section of Object.values(ScoreSection)) {
      const sectionScores = Array.from(scores.get(section)!.values());
      assert.isAtLeast(sectionScores.length, 1);
    }
  });
});
