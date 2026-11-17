"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.nearEdge = exports.EDGE_ROWS = void 0;
const Effect_1 = require("@civ-clone/core-rule/Effect");
const LeadsGroup_1 = require("@civ-clone/base-barbarians/Rules/LeadsGroup");
const LeavesMap_1 = require("@civ-clone/base-barbarians/Rules/LeavesMap");
const RuleIds_1 = require("../RuleIds");
const units_1 = require("../lib/units");
/** A barbarian within this many rows of the top or bottom edge leaves the map (`ai.cpp` 2183-2186: `y < 2`). */
exports.EDGE_ROWS = 2;
/** Whether `tile` is within `EDGE_ROWS` of the top or bottom edge, whatever the map's height. */
const nearEdge = (tile) => tile.y() < exports.EDGE_ROWS || tile.y() >= tile.map().height() - exports.EDGE_ROWS;
exports.nearEdge = nearEdge;
/**
 * What the barbarians' client asks the rule set (base-barbarians): the leader is a unit of a role above 4
 *  (`LeadsGroup`), and a barbarian leaves the map, and isn't landed, within 2 rows of the top or bottom edge
 *  (`LeavesMap`), counted in rows rather than scaled, as Civilization II does.
 */
const getRules = () => [
    new LeadsGroup_1.default(RuleIds_1.LEADS_GROUP_RULE, new Effect_1.default((unit) => (0, units_1.isLeader)(unit))),
    new LeavesMap_1.default(RuleIds_1.LEAVES_MAP_RULE, new Effect_1.default((tile) => (0, exports.nearEdge)(tile))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=client.js.map