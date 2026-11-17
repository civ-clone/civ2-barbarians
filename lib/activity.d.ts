import { Game } from '@civ-clone/core-game';
export type ActivityGame = Pick<
  Game,
  'difficulty' | 'pendingEffects' | 'rng' | 'rules'
>;
/** The level with no `Activity` rule registered, and the choice's default: the second level up. */
export declare const DEFAULT_ACTIVITY = 2;
/**
 * The `PendingEffect` handler name a drawn level is kept under. Nothing discharges it: it's a record, kept in the
 *  game's pending effects because they are saved, so the level drawn stays the game's level after a load.
 */
export declare const ACTIVITY_STATE = 'civ2-barbarians:activity';
/**
 * The level drawn for "random" (OpenCiv2 `game_setup.cpp` 1686-1700), from C's `rand()`: below Prince, the difficulty
 *  level or one more (Chieftain 0–1, Warlord 1–2); Prince to Emperor, 1 to 3; Deity, 2 or 3.
 */
export declare const randomActivity: (
  level: number,
  rand: () => number
) => number;
/**
 * How active the barbarians are in `game`, 0 to 3 (OpenCiv2 `game.barbarian_activity`): the level its `ACTIVITY`
 *  choice gives, or for "random" the level drawn the first time anyone asks, kept with the game. Nothing is drawn
 *  unless "random" is chosen. A game with no `Activity` rule plays at `DEFAULT_ACTIVITY`.
 */
export declare const activityLevel: (game: ActivityGame) => number;
export default activityLevel;
