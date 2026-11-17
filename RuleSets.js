"use strict";
// The ids of the rule sets this package registers, for whatever switches them.
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACTIVITY_DEFAULT = exports.ACTIVITY_RANDOM = exports.ACTIVITY_LEVELS = exports.ACTIVITY = void 0;
/**
 * How active the barbarians are: a choice of five, 0 (only huts release barbarians) to 3, or one drawn by the
 *  difficulty level as the game starts. The second level up, 2, to start with.
 */
exports.ACTIVITY = 'civ2-barbarians:activity';
/** Each member of `ACTIVITY`, by level: an `Activity` rule each. */
exports.ACTIVITY_LEVELS = [0, 1, 2, 3].map((level) => `${exports.ACTIVITY}/${level}`);
/** The member of `ACTIVITY` that draws the level by the difficulty level. */
exports.ACTIVITY_RANDOM = `${exports.ACTIVITY}/random`;
/** The member chosen to start with. */
exports.ACTIVITY_DEFAULT = exports.ACTIVITY_LEVELS[2];
//# sourceMappingURL=RuleSets.js.map