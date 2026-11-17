import Rule from '@civ-clone/core-rule/Rule';
/**
 * How active the barbarians are, 0 to 3, or `'random'` for a level drawn by the difficulty level (`lib/activity`).
 *  One is registered for each choice, and the `ACTIVITY` rule set leaves one on.
 */
export declare class Activity extends Rule<[], number | 'random'> {}
export default Activity;
