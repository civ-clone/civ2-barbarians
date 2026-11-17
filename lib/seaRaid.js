"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seaRaid = exports.raidSite = exports.raidUnits = exports.raidEscort = exports.raidShip = exports.known = exports.raidHorde = exports.RAID_EDGE_ROWS = exports.RAID_TRIES = exports.RAID_WATER_BODY = void 0;
const Units_1 = require("@civ-clone/civ2-unit/Units");
const Advances_1 = require("@civ-clone/civ2-science/Advances");
const knows_1 = require("./knows");
const barbarianPlayer_1 = require("./barbarianPlayer");
const spawnUnits_1 = require("@civ-clone/base-barbarians/lib/spawnUnits");
const Veteran_1 = require("@civ-clone/base-unit-improvement-veteran/UnitImprovements/Veteran");
const pickResearch_1 = require("@civ-clone/civ2-science/lib/pickResearch");
const grid_1 = require("./grid");
const waterBody_1 = require("@civ-clone/base-barbarians/lib/waterBody");
/** How many squares a raiding ship's sea must have (`water_body_size < 0x10` rejects it). */
exports.RAID_WATER_BODY = 16;
/** How many squares the search draws before it gives up, and the uprising is skipped that turn. */
exports.RAID_TRIES = 1000;
/** The rows a raiding ship may appear on: 3 from the top to 4 from the bottom (`rand % (height − 6) + 3`). */
exports.RAID_EDGE_ROWS = 3;
/**
 * How many barbarians a raid brings, the leader among them (`barbarians_sea_raid`, `game.cpp` 1497-1501):
 *  n = clamp(turn ÷ (250 − 50a) + 1, 1, 5), then n + 1, or n + 2 at a = 3.
 */
const raidHorde = (activity, turn) => {
    const n = Math.min(Math.max(Math.trunc(turn / (250 - 50 * activity)) + 1, 1), 5);
    return activity === 3 ? n + 2 : n + 1;
};
exports.raidHorde = raidHorde;
const known = (game) => ({
    anyone: (AdvanceType) => (0, knows_1.anyoneKnows)(game, AdvanceType),
    person: (AdvanceType) => (0, knows_1.personKnows)(game, AdvanceType),
});
exports.known = known;
/** The ship: a Trireme, a Caravel once anyone knows Navigation, a Frigate once anyone knows Magnetism. */
const raidShip = (knows) => {
    if (knows.anyone(Advances_1.Magnetism)) {
        return Units_1.Frigate;
    }
    if (knows.anyone(Advances_1.Navigation)) {
        return Units_1.Sail;
    }
    return Units_1.Trireme;
};
exports.raidShip = raidShip;
/**
 * The escorts' type (`game.cpp` 1508-1523, the full roster): Archers; the Legion once a person knows Iron Working;
 *  Knights once anyone knows Metallurgy, or Chivalry at a = 3, and Crusaders instead on an odd row (the original's odd
 *  x); Dragoons once a person knows Tactics.
 */
const raidEscort = (knows, activity, oddRow) => {
    let Escort = Units_1.Archer;
    if (knows.person(Advances_1.IronWorking)) {
        Escort = Units_1.Swordman;
    }
    if (knows.anyone(Advances_1.Metallurgy) || (activity === 3 && knows.anyone(Advances_1.Chivalry))) {
        Escort = oddRow ? Units_1.Crusader : Units_1.Knight;
    }
    if (knows.person(Advances_1.Tactics)) {
        Escort = Units_1.Dragoon;
    }
    return Escort;
};
exports.raidEscort = raidEscort;
/** The horde aboard, in the order the original makes it: the leader first when there is more than one, then escorts. */
const raidUnits = (count, Escort) => new Array(count)
    .fill(null)
    .map((_, index) => count > 1 && index === 0 ? Units_1.Diplomat : Escort);
exports.raidUnits = raidUnits;
/**
 * The square a raiding ship appears on (`barbarians_sea_raid`, `game.cpp` 1468-1495): up to `RAID_TRIES` squares drawn
 *  in the original's coordinates, on rows 3 to height − 4, each an empty square of a sea of at least 16. `null` when
 *  none is found: the draw after the last is made and not looked at, as in the original.
 */
const raidSite = (world, rand, empty) => {
    const width = world.width() * 2, height = world.height();
    // As the original: a square is drawn, then counted, then given up on past `RAID_TRIES`, so the last draw is never
    //  looked at.
    for (let tries = 1;; tries++) {
        let x = width <= 1 ? 0 : rand() % width;
        const y = (height <= 7 ? 0 : rand() % (height - 6)) + exports.RAID_EDGE_ROWS;
        if ((x & 1) !== 0) {
            x--;
        }
        if ((y & 1) !== 0) {
            x++;
        }
        if (tries > exports.RAID_TRIES) {
            return null;
        }
        const tile = (0, grid_1.tileAt)(world, x, y);
        if (tile !== null &&
            tile.isWater() &&
            empty(tile) &&
            (0, waterBody_1.default)(tile, exports.RAID_WATER_BODY)) {
            return tile;
        }
    }
};
exports.raidSite = raidSite;
/**
 * A raid from the sea (`barbarians_sea_raid`): a ship on `raidSite`'s square with `raidHorde` barbarians aboard, the
 *  ship a veteran on an even draw. Emits `barbarians:raiders-at-sea` (player, ship, tile). Returns `false` when no
 *  square was found, so the turn's uprising is skipped, as the original returns from `game_spawn_barbarians` then.
 */
const seaRaid = (game, world, activity, turn) => {
    const rand = () => (0, pickResearch_1.cRand)(game.rng), tile = (0, exports.raidSite)(world, rand, (tile) => game.units.getByTile(tile).length === 0);
    if (tile === null) {
        return false;
    }
    const knows = (0, exports.known)(game), player = (0, barbarianPlayer_1.default)(game, world), ship = (0, spawnUnits_1.createUnit)((0, exports.raidShip)(knows), player, tile, game.rules);
    (0, spawnUnits_1.default)(player, tile, (0, exports.raidUnits)((0, exports.raidHorde)(activity, turn), (0, exports.raidEscort)(knows, activity, (tile.y() & 1) === 1)), game.rules, ship);
    if ((rand() & 1) === 0) {
        game.unitImprovements.register(new Veteran_1.default(ship));
    }
    game.engine.emit('barbarians:raiders-at-sea', player, ship, tile);
    return true;
};
exports.seaRaid = seaRaid;
exports.default = exports.seaRaid;
//# sourceMappingURL=seaRaid.js.map