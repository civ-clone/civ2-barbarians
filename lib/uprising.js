"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uprisingCity = exports.landUprising = exports.uprisingKnowledge = exports.uprisingSite = exports.uprisingUnits = exports.uprisingTypes = exports.uprisingHorde = exports.CLASSIC_UPRISING = exports.UPRISING_TRIES = exports.UPRISING_CITY_DISTANCE = void 0;
const Units_1 = require("@civ-clone/civ2-unit/Units");
const Advances_1 = require("@civ-clone/civ2-science/Advances");
const knows_1 = require("./knows");
const ranks_1 = require("./ranks");
const barbarianPlayer_1 = require("./barbarianPlayer");
const grid_1 = require("./grid");
const Governments_1 = require("@civ-clone/civ2-government/Governments");
const Veteran_1 = require("@civ-clone/base-unit-improvement-veteran/UnitImprovements/Veteran");
const units_1 = require("./units");
const cityGold_1 = require("@civ-clone/base-barbarians/lib/cityGold");
const pickResearch_1 = require("@civ-clone/civ2-science/lib/pickResearch");
const isBarbarian_1 = require("@civ-clone/base-civilization-barbarian/isBarbarian");
const isHuman_1 = require("@civ-clone/civ2-difficulty/isHuman");
const spawnUnits_1 = require("@civ-clone/base-barbarians/lib/spawnUnits");
/** An uprising's square is at least this far from the nearest city (`nearest_city_dist < 5` rejects it). */
exports.UPRISING_CITY_DISTANCE = 5;
/** Each activity level gives the search this many tries (`a × 50`). */
exports.UPRISING_TRIES = 50;
exports.CLASSIC_UPRISING = {
    xOffset: (roll) => roll * 2 - 6,
    byRolledCity: false,
    dropped: null,
    strongestHumanGovernment: ranks_1.rankAsNumberGovernment,
};
/**
 * How many barbarians rise besides the leader (`barbarians_city_uprising`, `game.cpp` 1318-1340), from the city's
 *  `size`, drawing from `rand` (C's `rand()`) as the original does: `rand % size` (0 at size 1); at a = 3 after turn
 *  149, one time in 10 − level, size ÷ 2 + `rand % (size ÷ 2)` more; at least 2 and at most 99.
 */
const uprisingHorde = (size, activity, level, turn, rand) => {
    let count = size <= 1 ? 0 : rand() % size;
    if (activity === 3 && turn > 149) {
        const surge = 10 - level <= 1 ? 0 : rand() % (10 - level);
        if (surge === 0) {
            const half = Math.trunc(size / 2), bonus = half <= 1 ? 0 : rand() % half;
            count += bonus + half;
        }
    }
    return Math.min(Math.max(count, 2), 99);
};
exports.uprisingHorde = uprisingHorde;
/**
 * The two types an uprising alternates in fours, `[main, alternate]` (`game.cpp` 1342-1381, the full roster): Chariots
 *  and Horsemen, swapped when `swap` (one time in 3); Archers and Elephants once anyone knows Gunpowder; Cannon and
 *  Musketeers with Industrialization; with Armor's advance as well, Artillery and Riflemen; and with Guerrilla Warfare,
 *  Cavalry and Partisans, or Artillery and Fanatics for a Republic or a Democracy holding the city its owner founded.
 */
const uprisingTypes = (knows, swap) => {
    let main = Units_1.Chariot, alternate = Units_1.Horseman;
    if (swap) {
        [main, alternate] = [alternate, main];
    }
    if (knows.gunpowder) {
        main = Units_1.Archer;
        alternate = Units_1.Elephant;
    }
    if (knows.industrialization) {
        main = Units_1.Cannon;
        alternate = Units_1.Musketman;
        if (knows.armorAdvance) {
            alternate = Units_1.Rifleman;
            main = Units_1.Artillery;
            if (knows.guerrillaWarfare) {
                if (knows.belowRepublic || knows.captured) {
                    main = Units_1.Cavalry;
                    alternate = Units_1.Partisan;
                }
                else {
                    alternate = Units_1.Fanatic;
                }
            }
        }
    }
    return [main, alternate];
};
exports.uprisingTypes = uprisingTypes;
/**
 * The units of an uprising of `horde` (`game.cpp` 1382-1397): `horde` + 1 of them, counted down from `horde`, the first
 *  the leader (a Diplomat), then `main` while the count has its 4 bit set and `alternate` otherwise.
 */
const uprisingUnits = (horde, main, alternate) => {
    const types = [];
    for (let remaining = horde; remaining >= 0; remaining--) {
        types.push(remaining === horde ? Units_1.Diplomat : (remaining & 4) === 0 ? alternate : main);
    }
    return types;
};
exports.uprisingUnits = uprisingUnits;
const standing = (game) => game.cities.entries().filter((city) => !city.destroyed());
// Whether a civilization's unit stands next to `tile` on a square of the same kind, land or sea
//  (`tile_zoc_unit_adjacent(x, y, 0)`): no barbarian is allied to anyone.
const foreignUnitAdjacent = (game, tile) => [0, 1, 2, 3, 4, 5, 6, 7].some((direction) => {
    const neighbour = (0, grid_1.step)(tile, direction);
    return (neighbour !== null &&
        neighbour.isWater() === tile.isWater() &&
        game.units
            .getByTile(neighbour)
            .some((unit) => !(0, isBarbarian_1.default)(unit.player())));
});
/**
 * Where an uprising near `city` breaks out (`game.cpp` 1293-1316), drawing from `rand`: up to `activity` × 50 tries, the
 *  last never looked at, each a square drawn within the original's 13 × 13 box (`options.xOffset` east, −6 to 6
 *  north) round the city, in bounds, at least 5 from the nearest city, with no civilization's unit next to it, on land
 *  with no units, on the same land mass as the city. With `byRolledCity` false each try finds the city nearest it, and
 *  the next is drawn round that city. Returns the square and the city the horde is sized by, or `null`: no square, or
 *  no city at all (which the original gives up on at once).
 */
const uprisingSite = (game, city, activity, rand, options = exports.CLASSIC_UPRISING) => {
    const world = city.tile().map(), cities = standing(game);
    let target = city;
    for (let attempts = 0;;) {
        const [cx, cy] = (0, grid_1.civ2Coordinates)(target.tile());
        let x = cx + options.xOffset(rand() % 13);
        const y = cy + (rand() % 13) - 6;
        if ((x & 1) !== 0) {
            x--;
        }
        if ((y & 1) !== 0) {
            x++;
        }
        const tile = (0, grid_1.tileAt)(world, x, y);
        let nearestDistance = Infinity;
        if (tile !== null) {
            const nearest = (0, grid_1.nearestCity)(tile, cities);
            if (nearest === null) {
                return null;
            }
            nearestDistance = nearest.distance;
            if (!options.byRolledCity) {
                target = nearest.city;
            }
            else {
                nearestDistance = Math.min(nearestDistance, (0, grid_1.distance)(tile, city.tile()));
            }
        }
        attempts++;
        if (attempts >= activity * exports.UPRISING_TRIES) {
            return null;
        }
        if (tile === null ||
            nearestDistance < exports.UPRISING_CITY_DISTANCE ||
            foreignUnitAdjacent(game, tile) ||
            tile.isWater() ||
            game.units.getByTile(tile).length > 0) {
            continue;
        }
        if (game.landMasses.getByTile(target.tile()) ===
            game.landMasses.getByTile(tile)) {
            return { tile, city: target };
        }
    }
};
exports.uprisingSite = uprisingSite;
/**
 * What decides an uprising's units, for `city` (the city the horde is sized by).
 */
const uprisingKnowledge = (game, city, options = exports.CLASSIC_UPRISING) => {
    const guerrillaWarfare = (0, knows_1.anyoneKnows)(game, Advances_1.GuerrillaWarfare), government = guerrillaWarfare
        ? options.strongestHumanGovernment(game)
        : null;
    return {
        gunpowder: (0, knows_1.anyoneKnows)(game, Advances_1.Gunpowder),
        industrialization: (0, knows_1.anyoneKnows)(game, Advances_1.Industrialization),
        armorAdvance: (0, knows_1.anyoneKnows)(game, (0, units_1.armorAdvance)()),
        guerrillaWarfare,
        belowRepublic: government === null ||
            !(government instanceof Governments_1.Republic || government instanceof Governments_1.Democracy),
        captured: city.player() !== city.originalPlayer(),
    };
};
exports.uprisingKnowledge = uprisingKnowledge;
/**
 * An uprising near `city` (`barbarians_city_uprising`, `game.cpp` 1274): with a chance of the city's gold share
 *  (`cityGold`) in 100, a square found by `uprisingSite`, and `uprisingHorde` + 1 barbarians on it, sized by the city
 *  the site went by, Fanatics veterans. Emits `barbarians:uprising` (player, city, tile, industrial). Draws from the
 *  game's generator in the original's order.
 */
const landUprising = (game, city, activity, level, turn, options = exports.CLASSIC_UPRISING) => {
    var _a;
    const rand = () => (0, pickResearch_1.cRand)(game.rng);
    if (rand() % 100 >= (0, cityGold_1.default)(city, game)) {
        return;
    }
    const site = (0, exports.uprisingSite)(game, city, activity, rand, options);
    if (site === null) {
        (_a = options.dropped) === null || _a === void 0 ? void 0 : _a.call(options, city);
        return;
    }
    const { tile, city: sizedBy } = site, horde = (0, exports.uprisingHorde)(game.cityGrowth.getByCity(sizedBy).size(), activity, level, turn, rand), swap = rand() % 3 === 0, knows = (0, exports.uprisingKnowledge)(game, sizedBy, options), [main, alternate] = (0, exports.uprisingTypes)(knows, swap), player = (0, barbarianPlayer_1.default)(game, tile.map()), units = (0, spawnUnits_1.default)(player, tile, (0, exports.uprisingUnits)(horde, main, alternate), game.rules);
    units
        .filter((unit) => unit instanceof Units_1.Fanatic)
        .forEach((unit) => game.unitImprovements.register(new Veteran_1.default(unit)));
    game.engine.emit('barbarians:uprising', player, sizedBy, tile, knows.industrialization);
};
exports.landUprising = landUprising;
/**
 * The city a turn's uprising is drawn for (`game.cpp` 1595-1601): one of the standing cities, `rand % cities` (no draw
 *  for one or none), and only if a person plays its owner. `null` otherwise.
 */
const uprisingCity = (game, rand) => {
    const cities = standing(game), index = cities.length <= 1 ? 0 : rand() % cities.length, city = cities[index];
    if (city === undefined || !(0, isHuman_1.isHuman)(city.player(), game.clients)) {
        return null;
    }
    return city;
};
exports.uprisingCity = uprisingCity;
exports.default = exports.landUprising;
//# sourceMappingURL=uprising.js.map