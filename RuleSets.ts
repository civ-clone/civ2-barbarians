// The ids of the rule sets this package registers, for whatever switches them.

/**
 * How active the barbarians are: a choice of five, 0 (only huts release barbarians) to 3, or one drawn by the
 *  difficulty level as the game starts. The second level up, 2, to start with.
 */
export const ACTIVITY = 'civ2-barbarians:activity';

/** Each member of `ACTIVITY`, by level: an `Activity` rule each. */
export const ACTIVITY_LEVELS: string[] = [0, 1, 2, 3].map(
  (level: number): string => `${ACTIVITY}/${level}`
);

/** The member of `ACTIVITY` that draws the level by the difficulty level. */
export const ACTIVITY_RANDOM = `${ACTIVITY}/random`;

/** The member chosen to start with. */
export const ACTIVITY_DEFAULT = ACTIVITY_LEVELS[2];
