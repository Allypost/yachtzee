import {
  test,
} from "@japa/runner";
import {
  Die,
} from "App/Game/Yachtzee/Die";

test.group("Yachtzee / Die", () => {
  test("has a value on init", ({ assert }) => {
    const die = new Die();

    assert.isAtLeast(die.getValue(), 1);
    assert.isAtMost(die.getValue(), 6);
  });

  test("value is between 1 and 6", ({ assert, sinon }) => {
    const Math$random = sinon.stub(Math, "random");

    const die = new Die();

    Math$random.returns(0);
    die.roll();
    assert.isAtLeast(die.getValue(), 1);
    assert.isAtMost(die.getValue(), 6);

    Math$random.returns(1 - Number.EPSILON);
    die.roll();
    assert.isAtLeast(die.getValue(), 1);
    assert.isAtMost(die.getValue(), 6);
  });

  test("is not held on init", ({ assert }) => {
    const die = new Die();

    assert.strictEqual(die.isHeld(), false);
  });

  test("can be rerolled", ({ assert, sinon }) => {
    const Math$random = sinon.stub(Math, "random");

    Math$random.returns(0);

    const die = new Die();
    const initialValue = die.getValue();

    Math$random.returns(1 - Number.EPSILON);

    die.roll();

    Math$random.restore();

    assert.notStrictEqual(initialValue, die.getValue());
  });

  test("can be held", ({ assert }) => {
    const die = new Die();
    die.hold();

    assert.strictEqual(die.isHeld(), true);
  });

  test("can be released", ({ assert }) => {
    const die = new Die();

    die.hold();

    assert.strictEqual(die.isHeld(), true);

    die.release();

    assert.strictEqual(die.isHeld(), false);
  });

  test("will not roll when held", ({ assert, sinon }) => {
    const Math$random = sinon.stub(Math, "random");

    Math$random.returns(0);

    const die = new Die();

    const initialValue = die.getValue();

    die.hold();

    Math$random.returns(1 - Number.EPSILON);

    die.roll();

    assert.strictEqual(die.getValue(), initialValue);
  });
});
