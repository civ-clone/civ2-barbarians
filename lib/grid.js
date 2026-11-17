"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nearestCity = exports.distance = exports.step = exports.tileAt = exports.civ2Coordinates = exports.DIRECTIONS = void 0;
const startBalance_1 = require("@civ-clone/civ2-player/lib/startBalance");
// Civilization II's map coordinates: a column is two "half" columns wide, so a square at (x, y) is at (2x + (y & 1), y)
//  there, and the eight directions are steps of 1 or 2 half columns (`dir_dx_table`, `dir_dy_table`, `gamedata.cpp`
//  3372-3373). The original's searches are written in these, so they're followed here and the square found mapped back.
/** The eight directions, `[dx, dy]` in half columns and rows, from the north-east clockwise (`dir_dx_table`). */
exports.DIRECTIONS = [
    [1, -1],
    [2, 0],
    [1, 1],
    [0, 2],
    [-1, 1],
    [-2, 0],
    [-1, -1],
    [0, -2],
];
/** `tile` in the original's coordinates, `[x, y]`. */
const civ2Coordinates = (tile) => [
    2 * tile.x() + (tile.y() & 1),
    tile.y(),
];
exports.civ2Coordinates = civ2Coordinates;
/**
 * The square at the original's `(x, y)`: `x` wraps (`map_wrap_x`), and `null` off the top or bottom (`map_in_bounds`)
 *  or on a half column that names no square (`x` and `y` of different parity).
 */
const tileAt = (world, x, y) => {
    const width = world.width() * 2;
    if (y < 0 || y >= world.height()) {
        return null;
    }
    const wrapped = ((x % width) + width) % width;
    if ((wrapped & 1) !== (y & 1)) {
        return null;
    }
    return world.get((wrapped - (y & 1)) / 2, y);
};
exports.tileAt = tileAt;
/** The square one step from `tile` in direction `direction` (0 to 7), or `null` off the map. */
const step = (tile, direction) => {
    const [x, y] = (0, exports.civ2Coordinates)(tile), [dx, dy] = exports.DIRECTIONS[direction & 7];
    return (0, exports.tileAt)(tile.map(), x + dx, y + dy);
};
exports.step = step;
/** Civilization II's distance between two squares (`map_distance_diag`). */
const distance = (from, to) => (0, startBalance_1.civ2Distance)(from.x(), from.y(), to.x(), to.y(), from.map().width());
exports.distance = distance;
/**
 * The city nearest `tile` among `cities` and how far it is (`city_find_nearest`): the last of those equally near, as the
 *  original keeps a tie's later city (`<=`). `null` with none.
 */
const nearestCity = (tile, cities) => cities.reduce((nearest, city) => {
    const cityDistance = (0, exports.distance)(tile, city.tile());
    return nearest === null || cityDistance <= nearest.distance
        ? { city, distance: cityDistance }
        : nearest;
}, null);
exports.nearestCity = nearestCity;
//# sourceMappingURL=grid.js.map