/**
 * How active the barbarians are: a choice of five, 0 (only huts release barbarians) to 3, or one drawn by the
 *  difficulty level as the game starts. The second level up, 2, to start with.
 */
export declare const ACTIVITY = 'civ2-barbarians:activity';
/** Each member of `ACTIVITY`, by level: an `Activity` rule each. */
export declare const ACTIVITY_LEVELS: string[];
/** The member of `ACTIVITY` that draws the level by the difficulty level. */
export declare const ACTIVITY_RANDOM: string;
/** The member chosen to start with. */
export declare const ACTIVITY_DEFAULT: string;
