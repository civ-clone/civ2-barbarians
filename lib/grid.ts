import City from '@civ-clone/core-city/City';
import Tile from '@civ-clone/core-world/Tile';
import World from '@civ-clone/core-world/World';
import { civ2Distance } from '@civ-clone/civ2-player/lib/startBalance';

// Civilization II's map coordinates: a column is two "half" columns wide, so a square at (x, y) is at (2x + (y & 1), y)
//  there, and the eight directions are steps of 1 or 2 half columns (`dir_dx_table`, `dir_dy_table`, `gamedata.cpp`
//  3372-3373). The original's searches are written in these, so they're followed here and the square found mapped back.

/** The eight directions, `[dx, dy]` in half columns and rows, from the north-east clockwise (`dir_dx_table`). */
export const DIRECTIONS: [number, number][] = [
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
export const civ2Coordinates = (tile: Tile): [number, number] => [
  2 * tile.x() + (tile.y() & 1),
  tile.y(),
];

/**
 * The square at the original's `(x, y)`: `x` wraps (`map_wrap_x`), and `null` off the top or bottom (`map_in_bounds`)
 *  or on a half column that names no square (`x` and `y` of different parity).
 */
export const tileAt = (world: World, x: number, y: number): Tile | null => {
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

/** The square one step from `tile` in direction `direction` (0 to 7), or `null` off the map. */
export const step = (tile: Tile, direction: number): Tile | null => {
  const [x, y] = civ2Coordinates(tile),
    [dx, dy] = DIRECTIONS[direction & 7];

  return tileAt(tile.map(), x + dx, y + dy);
};

/** Civilization II's distance between two squares (`map_distance_diag`). */
export const distance = (from: Tile, to: Tile): number =>
  civ2Distance(from.x(), from.y(), to.x(), to.y(), from.map().width());

/**
 * The city nearest `tile` among `cities` and how far it is (`city_find_nearest`): the last of those equally near, as the
 *  original keeps a tie's later city (`<=`). `null` with none.
 */
export const nearestCity = (
  tile: Tile,
  cities: City[]
): { city: City; distance: number } | null =>
  cities.reduce(
    (
      nearest: { city: City; distance: number } | null,
      city: City
    ): { city: City; distance: number } | null => {
      const cityDistance = distance(tile, city.tile());

      return nearest === null || cityDistance <= nearest.distance
        ? { city, distance: cityDistance }
        : nearest;
    },
    null
  );
