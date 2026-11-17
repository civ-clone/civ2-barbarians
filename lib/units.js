"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.armorAdvance = exports.isLeader = exports.roleOf = exports.indexOf = exports.rowOf = void 0;
const units_1 = require("@civ-clone/civ2-unit/data/units");
const unitTable_1 = require("@civ-clone/civ2-unit/lib/unitTable");
const Units_1 = require("@civ-clone/civ2-unit/Units");
// Civilization II's unit rows (`@UNITS`), by class, for what the barbarians' rules read from them.
const rows = new Map(units_1.units.map((row, index) => [
    unitTable_1.unitTypes[index],
    row,
]));
/** `UnitType`'s `@UNITS` row, or `undefined` for a type that isn't Civilization II's. */
const rowOf = (UnitType) => rows.get(UnitType);
exports.rowOf = rowOf;
/** `UnitType`'s row index, or -1. */
const indexOf = (UnitType) => unitTable_1.unitTypes.indexOf(UnitType);
exports.indexOf = indexOf;
/** The AI's role of `UnitType` (0 attack, 1 defend, … 5 settle, 6 diplomacy, 7 trade), or -1. */
const roleOf = (UnitType) => { var _a, _b; return (_b = (_a = (0, exports.rowOf)(UnitType)) === null || _a === void 0 ? void 0 : _a[10]) !== null && _b !== void 0 ? _b : -1; };
exports.roleOf = roleOf;
/**
 * Whether `unit` is a barbarian leader: a unit whose role is above 4 (`unit_combat.cpp` 1080: the ransom), which for
 *  the barbarians is the Diplomat each group is raised with.
 */
const isLeader = (unit) => (0, exports.roleOf)(unit.constructor) > 4;
exports.isLeader = isLeader;
/**
 * The advance the Armor unit needs (`unit_types[UNIT_ARMOR].prerequisite`), read from its row: sea raids stop, and
 *  raiders and uprisings change, once anyone knows it.
 */
const armorAdvance = () => (0, unitTable_1.advanceType)((0, exports.rowOf)(Units_1.Tank)[11]);
exports.armorAdvance = armorAdvance;
//# sourceMappingURL=units.js.map