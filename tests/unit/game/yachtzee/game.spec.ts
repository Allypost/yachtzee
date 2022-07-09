import {
  test,
} from "@japa/runner";
import {
  Player,
} from "App/Game/Yachtzee/Player";
import {
  Cup,
} from "App/Game/Yachtzee/Cup";
import {
  Game,
} from "App/Game/Yachtzee/Game";
import {
  ScoreSection,
} from "App/Game/Yachtzee/Scorer";

type NonEmptyArray<T> = [ T, ...T[] ];

const generatePlayers =
  <N extends number>(count: N) =>
    Array.from({ length: count }, (_, i) => new Player(`Tester ${ i + 1 }`, new Cup())) as NonEmptyArray<Player>
;

/*
 console.log(game);
 console.log(game.getNowPlaying());

 game.on("after action", (player, action, args) => {
 console.log();
 console.log("=".repeat(action.length + 6));
 console.log(`== ${ action.toLocaleUpperCase() } ==`);
 console.log("=".repeat(action.length + 6));
 console.log("Player:", player.name);
 console.log("Args:", args);
 console.log("Dice:", player.cup.diceValues());
 console.log("Score:", player.scoreSheet.getScores());
 console.log("Used:", player.scoreSheet.getUsedScores());
 console.log();
 });

 await game.do("roll");

 await game.do("roll");

 await game.do("pick score", ScoreSection.upper, "Aces");

 await game.do("roll");

 await game.do("roll");

 console.log(game.getPlayers().map((p) => [ p.name, p.scoreSheet.getTotalScore() ]));
 */

test.group("Yachtzee / Game", () => {
  test("throws error when no players are provided", ({ assert }) => {
    const players = [] as Player[];
    assert.throws(() => new Game(players));
  });

  test("remembers player list", ({ assert }) => {
    const players = generatePlayers(3);
    const game = new Game(players);

    assert.deepEqual(game.getPlayers(), players);
  });

  test("starts on turn 1", ({ assert }) => {
    const players = generatePlayers(3);
    const game = new Game(players);

    assert.strictEqual(game.getTurn(), 1);
  });

  test("knows the current turn's player", ({ assert }) => {
    const players = generatePlayers(3);
    const game = new Game(players);

    assert.deepEqual(game.getNowPlayingPlayer(), players[0]);
  });

  test("action:'roll' rolls dice for currently playing user", async ({ assert, sinon }) => {
    const Math$random = sinon.stub(Math, "random");
    Math$random.returns(0);

    const players = generatePlayers(3);
    const game = new Game(players);

    const currentPlayer = game.getNowPlayingPlayer();
    const currentPlayerDice = currentPlayer.cup.diceValues();

    Math$random.returns(1 - Number.EPSILON);
    await game.do("roll");

    assert.notDeepEqual(currentPlayer.cup.diceValues(), currentPlayerDice);
  });

  test("action:'hold die' holds the die specified by index", async ({ assert }) => {
    const players = generatePlayers(3);
    const game = new Game(players);

    const currentPlayer = game.getNowPlayingPlayer();
    const currentPlayerDice = currentPlayer.cup.getDice();
    const dieIndex = Cup.N_DICE - 2;

    assert.isFalse(currentPlayerDice[dieIndex].isHeld());

    await game.do("hold die", dieIndex);

    assert.isTrue(currentPlayerDice[dieIndex].isHeld());
  });

  test("action:'hold die' does not change held status of held die", async ({ assert }) => {
    const players = generatePlayers(3);
    const game = new Game(players);

    const currentPlayer = game.getNowPlayingPlayer();
    const currentPlayerDice = currentPlayer.cup.getDice();
    const dieIndex = Cup.N_DICE - 2;

    currentPlayerDice[dieIndex].hold();

    assert.isTrue(currentPlayerDice[dieIndex].isHeld());

    await game.do("hold die", dieIndex);

    assert.isTrue(currentPlayerDice[dieIndex].isHeld());
  });

  test("action:'release die' does not change held status of non-held die", async ({ assert }) => {
    const players = generatePlayers(3);
    const game = new Game(players);

    const currentPlayer = game.getNowPlayingPlayer();
    const currentPlayerDice = currentPlayer.cup.getDice();
    const dieIndex = Cup.N_DICE - 2;

    assert.isFalse(currentPlayerDice[dieIndex].isHeld());

    await game.do("release die", dieIndex);

    assert.isFalse(currentPlayerDice[dieIndex].isHeld());
  });

  test("action:'release die' releases the die specified by index", async ({ assert }) => {
    const players = generatePlayers(3);
    const game = new Game(players);

    const currentPlayer = game.getNowPlayingPlayer();
    const currentPlayerDice = currentPlayer.cup.getDice();
    const dieIndex = Cup.N_DICE - 2;

    currentPlayerDice[dieIndex].hold();

    assert.isTrue(currentPlayerDice[dieIndex].isHeld());

    await game.do("release die", dieIndex);

    assert.isFalse(currentPlayerDice[dieIndex].isHeld());
  });

  test("action:'pick score' throws if the dice haven't been rolled beforehand", async ({ assert }) => {
    const players = generatePlayers(3);
    const game = new Game(players);

    await assert.rejects(async () => await game.do("pick score", ScoreSection.upper, "Aces"));
  });

  test("action:'pick score' ends players turn", async ({ assert }) => {
    const players = generatePlayers(3);
    const game = new Game(players);

    const currentPlayer = game.getNowPlayingPlayer();

    await game.do("roll");
    await game.do("pick score", ScoreSection.upper, "Aces");

    assert.notStrictEqual(game.getNowPlayingPlayer(), currentPlayer);
  });

  test("action:'pick score' adds picked score to list", async ({ assert }) => {
    const players = generatePlayers(3);
    const game = new Game(players);

    const currentPlayer = game.getNowPlayingPlayer();
    const section = ScoreSection.upper;
    const score = "Aces";

    await game.do("roll");
    await game.do("pick score", section, score);

    assert.isTrue(currentPlayer.scoreSheet.getUsedScores().get(section)!.has(score));
  });

  test("action:'pick score' throws if score is already picked", async ({ assert }) => {
    const players = generatePlayers(3);
    const game = new Game(players);

    const section = ScoreSection.upper;
    const score = "Aces";

    await game.do("roll");
    await game.do("pick score", section, score);
    await assert.rejects(async () => await game.do("pick score", section, score));
  });

  test("game turn is not incremented non-last player picks score", async ({ assert }) => {
    const players = generatePlayers(2);
    const game = new Game(players);

    assert.strictEqual(game.getTurn(), 1);

    await game.do("roll");
    await game.do("pick score", ScoreSection.upper, "Aces");

    assert.strictEqual(game.getTurn(), 1);
  });

  test("game turn is incremented after last player chooses score", async ({ assert }) => {
    const players = generatePlayers(2);
    const game = new Game(players);

    assert.strictEqual(game.getTurn(), 1);

    await game.do("roll");
    await game.do("pick score", ScoreSection.upper, "Aces");

    await game.do("roll");
    await game.do("pick score", ScoreSection.upper, "Aces");

    assert.strictEqual(game.getTurn(), 2);
  });
});
