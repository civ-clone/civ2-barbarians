"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.barbarianBuild = exports.upgradeOf = exports.firstUnit = exports.lastBuilt = void 0;
const knows_1 = require("./knows");
const Units_1 = require("@civ-clone/civ2-unit/Units");
const unitTable_1 = require("@civ-clone/civ2-unit/lib/unitTable");
const units_1 = require("./units");
const Advances_1 = require("@civ-clone/civ2-science/Advances");
const level_1 = require("@civ-clone/civ2-difficulty/level");
const units_2 = require("@civ-clone/civ2-unit/data/units");
/** The unit a barbarian city last built or is building, as the original's `building` keeps it, or `null`. */
const lastBuilt = (game, city) => {
    var _a, _b;
    const cityBuild = game.cityBuilds.getByCity(city), building = cityBuild.building();
    if (building !== null) {
        return building.item();
    }
    return (_b = (_a = cityBuild.cleared()) === null || _a === void 0 ? void 0 : _a.item) !== null && _b !== void 0 ? _b : null;
};
exports.lastBuilt = lastBuilt;
/**
 * What a barbarian city starts building when it isn't building a unit (`city_production.cpp` 307-312): Knights once
 *  anyone knows Explosives, the Legion before.
 */
const firstUnit = (game) => (0, knows_1.anyoneKnows)(game, Advances_1.Explosives) ? Units_1.Knight : Units_1.Swordman;
exports.firstUnit = firstUnit;
/**
 * The unit that replaces `UnitType` in a barbarian city (`city_production.cpp` 313-338): the first unit of the same role
 *  whose advance is the one that makes `UnitType` obsolete, once at least two players know that advance and a person
 *  knows it (or at Emperor or Deity); never at Chieftain. `UnitType` itself otherwise.
 */
const upgradeOf = (game, UnitType) => {
    const row = (0, units_1.rowOf)(UnitType);
    if (row === undefined || row[0] < 0) {
        return UnitType;
    }
    const level = (0, level_1.levelOf)(game.difficulty), Obsoleting = (0, unitTable_1.advanceType)(row[0]);
    if (level === 0 ||
        (0, knows_1.knownBy)(game, Obsoleting) < 2 ||
        (!(0, knows_1.personKnows)(game, Obsoleting) && level < 4)) {
        return UnitType;
    }
    const upgrade = units_2.units.findIndex(([, , , , , , , , , , role, prerequisite]) => prerequisite === row[0] && role === row[10]);
    return upgrade === -1 ? UnitType : unitTable_1.unitTypes[upgrade];
};
exports.upgradeOf = upgradeOf;
/**
 * What a barbarian city builds (`city_choose_production_barbarian`): `firstUnit` while it isn't building a unit (the
 *  Settlers, row 0, count as none, as `building < 1` has it), otherwise the unit it builds, or `upgradeOf` it.
 *  Never an improvement or a Wonder.
 */
const barbarianBuild = (game, city) => {
    const last = (0, exports.lastBuilt)(game, city);
    if (last === null || (0, units_1.indexOf)(last) < 1 || last === Units_1.Settlers) {
        return (0, exports.firstUnit)(game);
    }
    return (0, exports.upgradeOf)(game, last);
};
exports.barbarianBuild = barbarianBuild;
exports.default = exports.barbarianBuild;
//# sourceMappingURL=cityBuild.js.map