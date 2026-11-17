import Activity from '../Rules/Activity';
import { Game } from '@civ-clone/core-game';
import PendingEffect from '@civ-clone/core-pending-effect/PendingEffect';
import { cRand } from '@civ-clone/civ2-science/lib/pickResearch';
import { levelOf } from '@civ-clone/civ2-difficulty/level';

export type ActivityGame = Pick<
  Game,
  'difficulty' | 'pendingEffects' | 'rng' | 'rules'
>;

/** The level with no `Activity` rule registered, and the choice's default: the second level up. */
export const DEFAULT_ACTIVITY = 2;

/**
 * The `PendingEffect` handler name a drawn level is kept under. Nothing discharges it: it's a record, kept in the
 *  game's pending effects because they are saved, so the level drawn stays the game's level after a load.
 */
export const ACTIVITY_STATE = 'civ2-barbarians:activity';

/**
 * The level drawn for "random" (OpenCiv2 `game_setup.cpp` 1686-1700), from C's `rand()`: below Prince, the difficulty
 *  level or one more (Chieftain 0–1, Warlord 1–2); Prince to Emperor, 1 to 3; Deity, 2 or 3.
 */
export const randomActivity = (level: number, rand: () => number): number => {
  if (level < 2) {
    return (rand() % 2) + level;
  }

  if (level < 5) {
    return (rand() % 3) + 1;
  }

  return (rand() % 2) + 2;
};

const recordOf = (game: Pick<ActivityGame, 'pendingEffects'>) =>
  game.pendingEffects.getByHandler(ACTIVITY_STATE)[0] ?? null;

/**
 * How active the barbarians are in `game`, 0 to 3 (OpenCiv2 `game.barbarian_activity`): the level its `ACTIVITY`
 *  choice gives, or for "random" the level drawn the first time anyone asks, kept with the game. Nothing is drawn
 *  unless "random" is chosen. A game with no `Activity` rule plays at `DEFAULT_ACTIVITY`.
 */
export const activityLevel = (game: ActivityGame): number => {
  const [choice] = game.rules
    .process(Activity)
    .filter((answer): boolean => answer !== undefined);

  if (choice === undefined) {
    return DEFAULT_ACTIVITY;
  }

  if (choice !== 'random') {
    return choice;
  }

  const record = recordOf(game),
    saved = record === null ? NaN : Number(record.data().level);

  if (Number.isInteger(saved) && saved >= 0 && saved <= 3) {
    return saved;
  }

  const level = randomActivity(levelOf(game.difficulty), () => cRand(game.rng));

  if (record !== null) {
    record.setData({ level: String(level) });
  } else {
    game.pendingEffects.register(
      new PendingEffect(ACTIVITY_STATE, null, { level: String(level) })
    );
  }

  return level;
};

export default activityLevel;
