import Turn from '@civ-clone/core-turn-based-game/Turn';

/**
 * The original's turn for a `Start` rule on `turn`: `game_spawn_barbarians` runs as the game moves from turn T to
 *  T + 1, before the count goes up (`game.cpp` `game_advance_turn` 1673-1676), and `turn.value()` is Civ2's
 *  `game.turn`, so the turn it tests is the one just played, T = `turn.value()` − 1. It never runs at T = 0.
 */
export const spawnTurn = (turn: Turn): number => turn.value() - 1;

/**
 * The first turn barbarians may appear (`game.cpp` `game_spawn_barbarians` 1566-1580): below Deity
 *  ((3 − a) × 3 + 30) × (5 − d), on Deity (3 − a) × 3 + 15. At a = 0 they never do: `Infinity`.
 */
export const onsetTurn = (activity: number, level: number): number => {
  if (activity === 0) {
    return Infinity;
  }

  if (level < 5) {
    return ((3 - activity) * 3 + 30) * (5 - level);
  }

  return (3 - activity) * 3 + 15;
};

/** Whether barbarians may appear as turn `turn` (the original's) ends. */
export const spawns = (
  activity: number,
  level: number,
  turn: number
): boolean => turn !== 0 && turn >= onsetTurn(activity, level);

/** The sea raids' mask (`freq_mask`): 15 at a = 1, 7 at 2 and 3. */
export const raidMask = (activity: number): number => (activity === 1 ? 15 : 7);

/** Whether a sea raid is tried as turn `turn` ends: `(turn + 1) & mask == 0`, every 16th or 8th turn. */
export const raidTurn = (activity: number, turn: number): boolean =>
  ((turn + 1) & raidMask(activity)) === 0;

export default onsetTurn;
