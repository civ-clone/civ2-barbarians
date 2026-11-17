import City from '@civ-clone/core-city/City';
import Tile from '@civ-clone/core-world/Tile';
import World from '@civ-clone/core-world/World';
/** The eight directions, `[dx, dy]` in half columns and rows, from the north-east clockwise (`dir_dx_table`). */
export declare const DIRECTIONS: [number, number][];
/** `tile` in the original's coordinates, `[x, y]`. */
export declare const civ2Coordinates: (tile: Tile) => [number, number];
/**
 * The square at the original's `(x, y)`: `x` wraps (`map_wrap_x`), and `null` off the top or bottom (`map_in_bounds`)
 *  or on a half column that names no square (`x` and `y` of different parity).
 */
export declare const tileAt: (
  world: World,
  x: number,
  y: number
) => Tile | null;
/** The square one step from `tile` in direction `direction` (0 to 7), or `null` off the map. */
export declare const step: (tile: Tile, direction: number) => Tile | null;
/** Civilization II's distance between two squares (`map_distance_diag`). */
export declare const distance: (from: Tile, to: Tile) => number;
/**
 * The city nearest `tile` among `cities` and how far it is (`city_find_nearest`): the last of those equally near, as the
 *  original keeps a tie's later city (`<=`). `null` with none.
 */
export declare const nearestCity: (
  tile: Tile,
  cities: City[]
) => {
  city: City;
  distance: number;
} | null;
