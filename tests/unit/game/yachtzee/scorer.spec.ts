import {
  test,
} from "@japa/runner";
import {
  Scorer,
} from "App/Game/Yachtzee/Scorer";
import {
  always,
  clamp,
  piped,
} from "rambdax/immutable";
import {
  Cup,
} from "App/Game/Yachtzee/Cup";
import {
  without,
} from "rambdax";

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

const moduloDie = modBetween(1, 6);

const generateRollWithNumOfValue =
  (n: number, val: number) =>
    [
      ...Array.from({ length: n }, always(val)),
      ...Array.from({ length: Cup.N_DICE - n }, always(moduloDie(val + 1, Cup.N_DICE + 1))),
    ]
;

test.group("Yachtzee / Scorer / Default / Upper", () => {
  test("Aces", ({ assert }) => {
    const scorer = new Scorer();
    const val = 1;

    for (let n = 0; n <= Cup.N_DICE; n++) {
      const dice = generateRollWithNumOfValue(n, val);
      const scores = scorer.score(dice);
      assert.strictEqual(scores.Aces, val * n);
    }
  });

  test("Twos", ({ assert }) => {
    const scorer = new Scorer();
    const val = 2;

    for (let n = 0; n <= Cup.N_DICE; n++) {
      const dice = generateRollWithNumOfValue(n, val);
      const scores = scorer.score(dice);
      assert.strictEqual(scores.Twos, val * n);
    }
  });

  test("Threes", ({ assert }) => {
    const scorer = new Scorer();
    const val = 3;

    for (let n = 0; n <= Cup.N_DICE; n++) {
      const dice = generateRollWithNumOfValue(n, val);
      const scores = scorer.score(dice);
      assert.strictEqual(scores.Threes, val * n);
    }
  });

  test("Fours", ({ assert }) => {
    const scorer = new Scorer();
    const val = 4;

    for (let n = 0; n <= Cup.N_DICE; n++) {
      const dice = generateRollWithNumOfValue(n, val);
      const scores = scorer.score(dice);
      assert.strictEqual(scores.Fours, val * n);
    }
  });

  test("Fives", ({ assert }) => {
    const scorer = new Scorer();
    const val = 5;

    for (let n = 0; n <= Cup.N_DICE; n++) {
      const dice = generateRollWithNumOfValue(n, val);
      const scores = scorer.score(dice);
      assert.strictEqual(scores.Fives, val * n);
    }
  });

  test("Sixes", ({ assert }) => {
    const scorer = new Scorer();
    const val = 6;

    for (let n = 0; n <= Cup.N_DICE; n++) {
      const dice = generateRollWithNumOfValue(n, val);
      const scores = scorer.score(dice);
      assert.strictEqual(scores.Sixes, val * n);
    }
  });
});

test.group("Yachtzee / Scorer / Default / Lower", () => {
  test("Happy - Three of a Kind", ({ assert }) => {
    const scorer = new Scorer();

    {
      const scores = scorer.score([ 1, 1, 1, 2, 3 ]);
      assert.strictEqual(scores["Three of a Kind"], 8);
    }
  });

  test("Happy - Four of a Kind", ({ assert }) => {
    const scorer = new Scorer();

    {
      const dice = [ 1, 1, 1, 1, 3 ];
      const scores = scorer.score(dice);
      assert.strictEqual(scores["Four of a Kind"], 7);
    }
  });

  test("Happy - Yahtzee", ({ assert }) => {
    const scorer = new Scorer();

    {
      const dice = [ 1, 1, 1, 1, 1 ];
      const scores = scorer.score(dice);
      assert.strictEqual(scores.Yahtzee, 50);
    }
  });

  test("Happy - Chance", ({ assert }) => {
    const scorer = new Scorer();

    {
      const dice = [ 1, 1, 1, 1, 1 ];
      const scores = scorer.score(dice);
      assert.strictEqual(scores.Chance, 5);
    }
  });

  test("Happy - Full House", ({ assert }) => {
    const scorer = new Scorer();

    {
      const dice = [ 1, 1, 1, 2, 2 ];
      const scores = scorer.score(dice);
      assert.strictEqual(scores["Full House"], 25);
    }
  });

  test("Happy - Small Straight", ({ assert }) => {
    const scorer = new Scorer();

    {
      const dice = [ 1, 2, 3, 4, 6 ];
      const scores = scorer.score(dice);
      assert.strictEqual(scores["Small Straight"], 30);
    }

    {
      const dice = [ 2, 3, 4, 5, 1 ];
      const scores = scorer.score(dice);
      assert.strictEqual(scores["Small Straight"], 30);
    }

    {
      const dice = [ 3, 4, 5, 6, 1 ];
      const scores = scorer.score(dice);
      assert.strictEqual(scores["Small Straight"], 30);
    }
  });

  test("Happy - Large Straight", ({ assert }) => {
    const scorer = new Scorer();

    {
      const dice = [ 1, 2, 3, 4, 5 ];
      const scores = scorer.score(dice);
      assert.strictEqual(scores["Large Straight"], 40);
    }

    {
      const dice = [ 2, 3, 4, 5, 6 ];
      const scores = scorer.score(dice);
      assert.strictEqual(scores["Large Straight"], 40);
    }
  });
});

test.group("Yachtzee / Scorer", () => {
  test("can add custom scorer", ({ assert }) => {
    const scorer = new Scorer();

    const SCORER_NAME = `test scorer ${ Math.random().toString(36).substring(2) }`;

    scorer.addScorer(SCORER_NAME, always(0));
    assert.isTrue(scorer.scorerNames().includes(SCORER_NAME));
  });

  test("custom scorers score correctly", ({ assert }) => {
    const scorer = new Scorer();

    scorer.addScorer("test sum", (dice) => dice.map((die) => die.getValue()).reduce((a, b) => a + b, 0));
    scorer.addScorer("test 0", always(0));

    {
      const scores = scorer.score([ 2, 2, 2, 2, 2 ]);
      assert.strictEqual(scores["test sum"], 10);
      assert.strictEqual(scores["test 0"], 0);
    }
  });

  test("can score with subset of scorers", ({ assert }) => {
    const scorer = new Scorer();

    const N_SCORERS = 15;
    const SCORER_NAMES = Array.from({ length: N_SCORERS }, (_, i) => `test scorer ${ i } ${ randStr() }`);
    const PICKED_SCORER_NAMES = SCORER_NAMES.slice(1, N_SCORERS - 1);
    const NOT_PICKED_SCORER_NAMES = without(PICKED_SCORER_NAMES, SCORER_NAMES);
    const DICE = Array.from({ length: Cup.N_DICE }, (_, i) => i + 1);

    SCORER_NAMES.forEach((name, i) => {
      scorer.addScorer(name, always(i));
    });

    const scores = scorer.scoreFor(PICKED_SCORER_NAMES, DICE);
    for (const scorerName of PICKED_SCORER_NAMES) {
      assert.strictEqual(scores[scorerName], SCORER_NAMES.indexOf(scorerName));
    }
    for (const scorerName of NOT_PICKED_SCORER_NAMES) {
      assert.isUndefined(scores[scorerName]);
    }
  });

  test("score of subset of scorers is calculated correctly", ({ assert }) => {
    const scorer = new Scorer();

    const N_SCORERS = Cup.N_DICE;
    const SCORER_NAMES = Array.from({ length: N_SCORERS }, (_, i) => `test scorer ${ i } ${ randStr() }`);
    const PICKED_SCORER_NAMES = SCORER_NAMES.slice(1, N_SCORERS - 1);
    const DICE = Array.from({ length: Cup.N_DICE }, (_, i) => i + 1);

    PICKED_SCORER_NAMES.forEach((name, i) => {
      scorer.addScorer(name, (dice) => dice[i].getValue());
    });

    const scores = scorer.scoreFor(PICKED_SCORER_NAMES, DICE);

    PICKED_SCORER_NAMES.forEach((scorerName, i) => {
      assert.strictEqual(scores[scorerName], DICE[i]);
    });
  });
});
