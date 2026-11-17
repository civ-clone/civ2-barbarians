"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hutBarbarians = exports.hutSquares = exports.hutSafe = exports.hutUnit = exports.rough = exports.HUT_SINGLE_ON_A_FLIP_UNTIL = exports.HUT_SINGLE_UNTIL = exports.HUT_SAFE_DISTANCE = exports.HUT_SAFE_ON_A_FLIP_UNTIL = exports.HUT_SAFE_UNTIL = void 0;
const Units_1 = require("@civ-clone/civ2-unit/Units");
const Advances_1 = require("@civ-clone/civ2-science/Advances");
const barbarianPlayer_1 = require("./barbarianPlayer");
const grid_1 = require("./grid");
const knows_1 = require("./knows");
const units_1 = require("./units");
const pickResearch_1 = require("@civ-clone/civ2-science/lib/pickResearch");
const terrainTable_1 = require("@civ-clone/base-terrain-properties/lib/terrainTable");
const terrainProperties_1 = require("@civ-clone/civ2-world/lib/terrainProperties");
const spawnUnits_1 = require("@civ-clone/base-barbarians/lib/spawnUnits");
/** Before this turn, below a = 3, a hut never releases barbarians near a city of the player's own (`turn < 30`). */
exports.HUT_SAFE_UNTIL = 30;
/** Before this turn, below a = 3, a hut doesn't on a coin flip (`turn < 50`). */
exports.HUT_SAFE_ON_A_FLIP_UNTIL = 50;
/** Near means on the hut's land mass, and less than this far from the player's nearest city. */
exports.HUT_SAFE_DISTANCE = 24;
/** Up to this turn, one barbarian only (`turn <= 49`); up to `HUT_SINGLE_ON_A_FLIP_UNTIL`, on a coin flip. */
exports.HUT_SINGLE_UNTIL = 49;
exports.HUT_SINGLE_ON_A_FLIP_UNTIL = 74;
const terrainMovementCost = (0, terrainTable_1.cachedTerrainLookup)(terrainProperties_1.movementCost);
/** Whether `terrain` is rough for a hut's barbarians: a movement cost of 3 or more. */
const rough = (terrain) => { var _a; return ((_a = terrainMovementCost(terrain)) !== null && _a !== void 0 ? _a : 1) >= 3; };
exports.rough = rough;
/**
 * A hut's barbarian for a square (`hut_barbarians`, `retvals.cpp` 1719-1735): on rough ground (a movement cost of 3 or
 *  more) the Legion, Musketeers once anyone knows Metallurgy, Riflemen with Armor's advance, Fanatics with Guerrilla
 *  Warfare; elsewhere Horsemen, Knights, Cavalry or Partisans.
 */
const hutUnit = (knows, isRough) => {
    let Rough = Units_1.Swordman, Flat = Units_1.Horseman;
    if (knows.metallurgy) {
        Rough = Units_1.Musketman;
        Flat = Units_1.Knight;
    }
    if (knows.armorAdvance) {
        Rough = Units_1.Rifleman;
        Flat = Units_1.Cavalry;
    }
    if (knows.guerrillaWarfare) {
        Rough = Units_1.Fanatic;
        Flat = Units_1.Partisan;
    }
    return isRough ? Rough : Flat;
};
exports.hutUnit = hutUnit;
/**
 * Whether the hut is safe (`retvals.cpp` 1680-1693): below a = 3, before turn 30, or before turn 50 on an even draw (the
 *  draw made only then), the player has a city on the hut's land mass and its nearest city is less than 24 away.
 */
const hutSafe = (game, hut, player, activity, turn, rand) => {
    if (activity >= 3 ||
        !(turn < exports.HUT_SAFE_UNTIL ||
            (turn < exports.HUT_SAFE_ON_A_FLIP_UNTIL && (rand() & 1) === 0))) {
        return false;
    }
    const own = game.cities
        .getByPlayer(player)
        .filter((city) => !city.destroyed()), landMass = game.landMasses.getByTile(hut), nearest = (0, grid_1.nearestCity)(hut, own);
    return (own.some((city) => landMass !== null && game.landMasses.getByTile(city.tile()) === landMass) &&
        nearest !== null &&
        nearest.distance < exports.HUT_SAFE_DISTANCE);
};
exports.hutSafe = hutSafe;
/**
 * The squares a hut's barbarians stand on, with their order (`retvals.cpp` 1704-1747): the original's directions from
 *  `turn` mod 8, stepping by clamp(4 − the player's cities, 1, 4) up to 8, each a square on the map with no unit, no
 *  city and no sea. Only the first when `single`.
 */
const hutSquares = (hut, turn, cities, single, free) => {
    const squares = [], stride = Math.min(Math.max(4 - cities, 1), 4);
    for (let index = 0; index <= 7; index += stride) {
        const tile = (0, grid_1.step)(hut, (turn + index) & 7);
        if (tile === null || tile.isWater() || !free(tile)) {
            continue;
        }
        squares.push(tile);
        if (single) {
            break;
        }
    }
    return squares;
};
exports.hutSquares = hutSquares;
/**
 * The barbarians a hut entered by `unit` releases (`hut_barbarians`), whatever the activity level: none when
 *  `hutSafe`; otherwise one up to turn 49, and up to turn 74 on an even draw, else one on each of `hutSquares`. Returns
 *  the units.
 */
const hutBarbarians = (game, hut, unit, activity, turn) => {
    const rand = () => (0, pickResearch_1.cRand)(game.rng), player = unit.player();
    if ((0, exports.hutSafe)(game, hut, player, activity, turn, rand)) {
        return [];
    }
    const single = turn <= exports.HUT_SINGLE_UNTIL ||
        (turn <= exports.HUT_SINGLE_ON_A_FLIP_UNTIL && (rand() & 1) === 0), knows = {
        metallurgy: (0, knows_1.anyoneKnows)(game, Advances_1.Metallurgy),
        armorAdvance: (0, knows_1.anyoneKnows)(game, (0, units_1.armorAdvance)()),
        guerrillaWarfare: (0, knows_1.anyoneKnows)(game, Advances_1.GuerrillaWarfare),
    }, squares = (0, exports.hutSquares)(hut, turn, game.cities
        .getByPlayer(player)
        .filter((city) => !city.destroyed()).length, single, (tile) => game.units.getByTile(tile).length === 0 &&
        game.cities.getByTile(tile) === null);
    if (squares.length === 0) {
        return [];
    }
    const barbarians = (0, barbarianPlayer_1.default)(game, hut.map());
    return squares.flatMap((tile) => (0, spawnUnits_1.default)(barbarians, tile, [(0, exports.hutUnit)(knows, (0, exports.rough)(tile.terrain()))], game.rules));
};
exports.hutBarbarians = hutBarbarians;
exports.default = exports.hutBarbarians;
//# sourceMappingURL=hut.js.map