import {
  ACTIVITY,
  ACTIVITY_DEFAULT,
  ACTIVITY_LEVELS,
  ACTIVITY_RANDOM,
} from '../RuleSets';
import {
  ACTIVITY_STATE,
  DEFAULT_ACTIVITY,
  activityLevel,
  randomActivity,
} from '../lib/activity';
import { Game } from '@civ-clone/core-game';
import { King } from '@civ-clone/civ2-difficulty/Difficulties';
import { expect } from 'chai';
import register from '../registerRules';

// OpenCiv2 `game_setup.cpp` 1681-1700 (richardpenman/civ2@e39fe7b).
describe('activity', (): void => {
  it('draws "random" by the difficulty level: below Prince the level or one more, Prince to Emperor 1–3, Deity 2–3', (): void => {
    const range = (level: number): number[] =>
      [
        ...new Set(
          new Array(12)
            .fill(0)
            .map((_, roll: number): number => randomActivity(level, () => roll))
        ),
      ].sort();

    expect(range(0)).eql([0, 1]);
    expect(range(1)).eql([1, 2]);
    expect(range(2)).eql([1, 2, 3]);
    expect(range(3)).eql([1, 2, 3]);
    expect(range(4)).eql([1, 2, 3]);
    expect(range(5)).eql([2, 3]);
  });

  it('plays at the second level up with nothing chosen, and with no rules registered', (): void => {
    const game = new Game();

    expect(activityLevel(game)).equal(DEFAULT_ACTIVITY).equal(2);

    register(game);

    expect(ACTIVITY_DEFAULT).equal(ACTIVITY_LEVELS[2]);
    expect(activityLevel(game)).equal(2);
  });

  it('plays at the level chosen, drawing nothing', (): void => {
    let draws = 0;

    const game = new Game({
      rng: (() => {
        draws++;

        return 0;
      }) as any,
    });

    register(game);

    ACTIVITY_LEVELS.forEach((id: string, level: number): void => {
      game.ruleSets.choose(ACTIVITY, id);

      expect(activityLevel(game)).equal(level);
    });

    expect(draws).equal(0);
    expect(game.pendingEffects.length).equal(0);
  });

  it('draws "random" once, and keeps the level with the game', (): void => {
    let draws = 0;

    const game = new Game({
      rng: (() => {
        draws++;

        // C's rand() of 2: 2 % 3 + 1 = 3 at King.
        return 2.5 / 32768;
      }) as any,
    });

    register(game);
    game.difficulty.set(King);
    game.ruleSets.choose(ACTIVITY, ACTIVITY_RANDOM);

    expect(activityLevel(game)).equal(3);
    expect(activityLevel(game)).equal(3);
    expect(draws).equal(1);

    const [record] = game.pendingEffects.getByHandler(ACTIVITY_STATE);

    expect(record.data()).eql({ level: '3' });
  });
});
