"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.knownBy = exports.personKnows = exports.anyoneKnows = void 0;
const anyoneHas_1 = require("@civ-clone/base-barbarians/lib/anyoneHas");
const isHuman_1 = require("@civ-clone/civ2-difficulty/isHuman");
/** Whether anyone knows `AdvanceType` (`game.advance_known_by[advance] != 0`). */
const anyoneKnows = ({ playerResearch }, AdvanceType) => (0, anyoneHas_1.default)(playerResearch, AdvanceType);
exports.anyoneKnows = anyoneKnows;
/**
 * Whether a person knows `AdvanceType` (`game.human_players & game.advance_known_by[advance]`): any player a person
 *  plays, in the game or gone.
 */
const personKnows = ({ clients, playerResearch }, AdvanceType) => playerResearch.some((research) => research.completed(AdvanceType) && (0, isHuman_1.isHuman)(research.player(), clients));
exports.personKnows = personKnows;
/** How many players know `AdvanceType` (`bits_count8(game.advance_known_by[advance])`). */
const knownBy = ({ playerResearch }, AdvanceType) => playerResearch.filter((research) => research.completed(AdvanceType)).length;
exports.knownBy = knownBy;
//# sourceMappingURL=knows.js.map