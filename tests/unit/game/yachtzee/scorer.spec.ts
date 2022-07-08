import {
  test,
} from "@japa/runner";
import {
  Scorer,
  ScoreSection,
} from "App/Game/Yachtzee/Scorer";
import {
  always,
  clamp,
  piped,
  without,
} from "rambdax/immutable";
import {
  Cup,
} from "App/Game/Yachtzee/Cup";

const randStr = () => Math.random().toString(36).substring(2);

const modBetween =
  (min: number, max: number) =>
    (value: number, mod: number) =>
      piped(
        value,
        (val) => val % mod,
        clamp(min, max),
      )
;

const arrayOfLength =
  <T>(length: number, mapFn: (v: never, k: number) => T) =>
    Array.from({ length }, mapFn)
;

const moduloDie = modBetween(1, 6);

const generateRollWithNumOfValue =
  (n: number, val: number) =>
    [
      ...arrayOfLength(n, always(val)),
      ...arrayOfLength(Cup.N_DICE - n, always(moduloDie(val + 1, Cup.N_DICE + 1))),
    ]
;

test.group("Yachtzee / Scorer / Default / Upper", () => {
  test("Aces", ({ assert }) => {
    const scorer = new Scorer();
    const val = 1;

    for (let n = 0; n <= Cup.N_DICE; n++) {
      const dice = generateRollWithNumOfValue(n, val);
      const scores = scorer.score(dice);
      assert.strictEqual(scores.Aces.value, val * n);
    }
  });

  test("Twos", ({ assert }) => {
    const scorer = new Scorer();
    const val = 2;

    for (let n = 0; n <= Cup.N_DICE; n++) {
      const dice = generateRollWithNumOfValue(n, val);
      const scores = scorer.score(dice);
      assert.strictEqual(scores.Twos.value, val * n);
    }
  });

  test("Threes", ({ assert }) => {
    const scorer = new Scorer();
    const val = 3;

    for (let n = 0; n <= Cup.N_DICE; n++) {
      const dice = generateRollWithNumOfValue(n, val);
      const scores = scorer.score(dice);
      assert.strictEqual(scores.Threes.value, val * n);
    }
  });

  test("Fours", ({ assert }) => {
    const scorer = new Scorer();
    const val = 4;

    for (let n = 0; n <= Cup.N_DICE; n++) {
      const dice = generateRollWithNumOfValue(n, val);
      const scores = scorer.score(dice);
      assert.strictEqual(scores.Fours.value, val * n);
    }
  });

  test("Fives", ({ assert }) => {
    const scorer = new Scorer();
    const val = 5;

    for (let n = 0; n <= Cup.N_DICE; n++) {
      const dice = generateRollWithNumOfValue(n, val);
      const scores = scorer.score(dice);
      assert.strictEqual(scores.Fives.value, val * n);
    }
  });

  test("Sixes", ({ assert }) => {
    const scorer = new Scorer();
    const val = 6;

    for (let n = 0; n <= Cup.N_DICE; n++) {
      const dice = generateRollWithNumOfValue(n, val);
      const scores = scorer.score(dice);
      assert.strictEqual(scores.Sixes.value, val * n);
    }
  });
});

test.group("Yachtzee / Scorer / Default / Lower", () => {
  test("Happy - Three of a Kind", ({ assert }) => {
    const scorer = new Scorer();

    {
      const scores = scorer.score([ 1, 1, 1, 2, 3 ]);
      assert.strictEqual(scores["Three of a Kind"]?.value, 8);
    }
  });

  test("Happy - Four of a Kind", ({ assert }) => {
    const scorer = new Scorer();

    {
      const dice = [ 1, 1, 1, 1, 3 ];
      const scores = scorer.score(dice);
      assert.strictEqual(scores["Four of a Kind"]?.value, 7);
    }
  });

  test("Happy - Yahtzee", ({ assert }) => {
    const scorer = new Scorer();

    {
      const dice = [ 1, 1, 1, 1, 1 ];
      const scores = scorer.score(dice);
      assert.strictEqual(scores.Yahtzee.value, 50);
    }
  });

  test("Happy - Chance", ({ assert }) => {
    const scorer = new Scorer();

    {
      const dice = [ 1, 1, 1, 1, 1 ];
      const scores = scorer.score(dice);
      assert.strictEqual(scores.Chance.value, 5);
    }
  });

  test("Happy - Full House", ({ assert }) => {
    const scorer = new Scorer();

    {
      const dice = [ 1, 1, 1, 2, 2 ];
      const scores = scorer.score(dice);
      assert.strictEqual(scores["Full House"]?.value, 25);
    }
  });

  test("Happy - Small Straight", ({ assert }) => {
    const scorer = new Scorer();

    {
      const dice = [ 1, 2, 3, 4, 6 ];
      const scores = scorer.score(dice);
      assert.strictEqual(scores["Small Straight"]?.value, 30);
    }

    {
      const dice = [ 2, 3, 4, 5, 1 ];
      const scores = scorer.score(dice);
      assert.strictEqual(scores["Small Straight"]?.value, 30);
    }

    {
      const dice = [ 3, 4, 5, 6, 1 ];
      const scores = scorer.score(dice);
      assert.strictEqual(scores["Small Straight"]?.value, 30);
    }
  });

  test("Happy - Large Straight", ({ assert }) => {
    const scorer = new Scorer();

    {
      const dice = [ 1, 2, 3, 4, 5 ];
      const scores = scorer.score(dice);
      assert.strictEqual(scores["Large Straight"]?.value, 40);
    }

    {
      const dice = [ 2, 3, 4, 5, 6 ];
      const scores = scorer.score(dice);
      assert.strictEqual(scores["Large Straight"]?.value, 40);
    }
  });
});

test.group("Yachtzee / Scorer", () => {
  test("can add custom scorer", ({ assert }) => {
    const scorer = new Scorer();

    const SCORER_NAME = `test scorer ${ Math.random().toString(36).substring(2) }`;

    scorer.addScorer(SCORER_NAME, ScoreSection.lower, always(0));
    assert.isTrue(scorer.scorerNames().includes(SCORER_NAME));
  });

  test("custom scorers score correctly", ({ assert }) => {
    const scorer = new Scorer();

    scorer.addScorer("test sum", ScoreSection.lower, (dice) => dice.map((die) => die.getValue()).reduce((a, b) => a + b, 0));
    scorer.addScorer("test 0", ScoreSection.lower, always(0));

    {
      const scores = scorer.score([ 2, 2, 2, 2, 2 ]);
      assert.strictEqual(scores["test sum"]?.value, 10);
      assert.strictEqual(scores["test 0"]?.value, 0);
    }
  });

  test("can score with subset of scorers", ({ assert }) => {
    const scorer = new Scorer();

    const N_SCORERS = 15;
    const SCORER_NAMES = arrayOfLength(N_SCORERS, (_, i) => `test scorer ${ i } ${ randStr() }`);
    const PICKED_SCORER_NAMES = SCORER_NAMES.slice(1, N_SCORERS - 1);
    const NOT_PICKED_SCORER_NAMES = without(PICKED_SCORER_NAMES, SCORER_NAMES);
    const DICE = arrayOfLength(Cup.N_DICE, (_, i) => i + 1);

    SCORER_NAMES.forEach((name, i) => {
      scorer.addScorer(name, ScoreSection.lower, always(i));
    });

    const scores = scorer.scoreFor(PICKED_SCORER_NAMES, DICE);
    for (const scorerName of PICKED_SCORER_NAMES) {
      assert.strictEqual(scores[scorerName]?.value, SCORER_NAMES.indexOf(scorerName));
    }
    for (const scorerName of NOT_PICKED_SCORER_NAMES) {
      assert.isUndefined(scores[scorerName]?.value);
    }
  });

  test("score of subset of scorers is calculated correctly", ({ assert }) => {
    const scorer = new Scorer();

    const N_SCORERS = Cup.N_DICE;
    const SCORER_NAMES = arrayOfLength(N_SCORERS, (_, i) => `test scorer ${ i } ${ randStr() }`);
    const PICKED_SCORER_NAMES = SCORER_NAMES.slice(1, N_SCORERS - 1);
    const DICE = arrayOfLength(Cup.N_DICE, (_, i) => i + 1);

    PICKED_SCORER_NAMES.forEach((name, i) => {
      scorer.addScorer(name, ScoreSection.lower, (dice) => dice[i].getValue());
    });

    const scores = scorer.scoreFor(PICKED_SCORER_NAMES, DICE);

    PICKED_SCORER_NAMES.forEach((scorerName, i) => {
      assert.strictEqual(scores[scorerName]?.value, DICE[i]);
    });
  });
});
