import {
  test,
} from "@japa/runner";
import {
  Die,
} from "App/Game/Yachtzee/Die";

test.group("Yachtzee / Die", () => {
  test("can be initialized with a value", ({ assert }) => {
    assert.strictEqual(new Die(1).getValue(), 1);
    assert.strictEqual(new Die(2).getValue(), 2);
    assert.strictEqual(new Die(3).getValue(), 3);
    assert.strictEqual(new Die(4).getValue(), 4);
    assert.strictEqual(new Die(5).getValue(), 5);
    assert.strictEqual(new Die(6).getValue(), 6);
  });

  test("has a random value on init if not explicitly provided", ({ assert, sinon }) => {
    const Math$random = sinon.stub(Math, "random");

    Math$random.returns(0);
    assert.strictEqual(new Die().getValue(), 1);

    Math$random.returns(0.5 - Number.EPSILON);
    assert.strictEqual(new Die().getValue(), 3);

    Math$random.returns(0.5);
    assert.strictEqual(new Die().getValue(), 4);

    Math$random.returns(1 - Number.EPSILON);
    assert.strictEqual(new Die().getValue(), 6);
  });

  test("rolled value is between 1 and 6", ({ assert, sinon }) => {
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

    assert.isFalse(die.isHeld());
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

    assert.isTrue(die.isHeld());
  });

  test("can be released", ({ assert }) => {
    const die = new Die();

    die.hold();

    assert.isTrue(die.isHeld());

    die.release();

    assert.isFalse(die.isHeld());
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

  test("can be made readonly", ({ assert, sinon }) => {
    const Math$random = sinon.stub(Math, "random");

    Math$random.returns(0);

    const die = new Die();
    const readonly = die.asReadonly();

    const initialValue = die.getValue();

    Math$random.returns(1 - Number.EPSILON);

    readonly.roll();

    assert.strictEqual(die.getValue(), initialValue);
    assert.strictEqual(readonly.getValue(), initialValue);
    assert.strictEqual(die.getValue(), readonly.getValue());
  });

  test("readonly die mirrors original value", ({ assert }) => {
    const die = new Die();
    const readonly = die.asReadonly();

    die.roll();

    assert.strictEqual(die.getValue(), readonly.getValue());
  });

  test("readonly die mirrors original held status", ({ assert }) => {
    const die = new Die();
    const readonly = die.asReadonly();

    die.hold();

    assert.strictEqual(die.isHeld(), readonly.isHeld());
  });
});
