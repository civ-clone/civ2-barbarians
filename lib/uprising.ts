import {
  Archer,
  Artillery,
  Cannon,
  Cavalry,
  Chariot,
  Diplomat,
  Elephant,
  Fanatic,
  Horseman,
  Musketman,
  Partisan,
  Rifleman,
} from '@civ-clone/civ2-unit/Units';
import {
  GuerrillaWarfare,
  Gunpowder,
  Industrialization,
} from '@civ-clone/civ2-science/Advances';
import { KnowsDependencies, anyoneKnows } from './knows';
import { RanksGame, strongestHumanGovernment } from './ranks';
import barbarianPlayer, { BarbarianPlayerGame } from './barbarianPlayer';
import { civ2Coordinates, nearestCity, step, tileAt } from './grid';
import { Democracy, Republic } from '@civ-clone/civ2-government/Governments';
import City from '@civ-clone/core-city/City';
import { Game } from '@civ-clone/core-game';
import Government from '@civ-clone/core-government/Government';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import Veteran from '@civ-clone/base-unit-improvement-veteran/UnitImprovements/Veteran';
import { armorAdvance } from './units';
import cityGold from '@civ-clone/base-barbarians/lib/cityGold';
import { cRand } from '@civ-clone/civ2-science/lib/pickResearch';
import isBarbarian from '@civ-clone/base-civilization-barbarian/isBarbarian';
import { isHuman } from '@civ-clone/civ2-difficulty/isHuman';
import spawnUnits from '@civ-clone/base-barbarians/lib/spawnUnits';

export type UprisingGame = BarbarianPlayerGame &
  KnowsDependencies &
  RanksGame &
  Pick<
    Game,
    | 'cities'
    | 'cityGrowth'
    | 'engine'
    | 'landMasses'
    | 'playerTreasuries'
    | 'rng'
    | 'rules'
    | 'unitImprovements'
    | 'units'
  >;

/** An uprising's square is at least this far from the nearest city (`nearest_city_dist < 5` rejects it). */
export const UPRISING_CITY_DISTANCE = 5;

/** Each activity level gives the search this many tries (`a × 50`). */
export const UPRISING_TRIES = 50;

/**
 * What an uprising goes by, so that a rule set that corrects the original's choices can pass its own
 *  (`CLASSIC_UPRISING` is the original's):
 * - `xOffset`: the square's offset east, in the original's half columns, from a draw of 0 to 12 (the offset north is
 *   the draw − 6);
 * - `byRolledCity`: `false` as the original, where each try is centred on, the square must share a land mass with, and
 *   the horde is sized and named by, the city nearest the last try (so possibly a computer player's); `true` for the
 *   city that was drawn, every time;
 * - `dropped`: called with the city drawn when no square is found, which the original says nothing about.
 */
export type UprisingOptions = {
  xOffset: (roll: number) => number;
  byRolledCity: boolean;
  dropped: ((city: City) => void) | null;
};

export const CLASSIC_UPRISING: UprisingOptions = {
  xOffset: (roll: number): number => roll * 2 - 6,
  byRolledCity: false,
  dropped: null,
};

/**
 * How many barbarians rise besides the leader (`barbarians_city_uprising`, `game.cpp` 1318-1340), from the city's
 *  `size`, drawing from `rand` (C's `rand()`) as the original does: `rand % size` (0 at size 1); at a = 3 after turn
 *  149, one time in 10 − level, size ÷ 2 + `rand % (size ÷ 2)` more; at least 2 and at most 99.
 */
export const uprisingHorde = (
  size: number,
  activity: number,
  level: number,
  turn: number,
  rand: () => number
): number => {
  let count = size <= 1 ? 0 : rand() % size;

  if (activity === 3 && turn > 149) {
    const surge = 10 - level <= 1 ? 0 : rand() % (10 - level);

    if (surge === 0) {
      const half = Math.trunc(size / 2),
        bonus = half <= 1 ? 0 : rand() % half;

      count += bonus + half;
    }
  }

  return Math.min(Math.max(count, 2), 99);
};

/** What an uprising's units follow: what anyone knows, and who holds the city. */
export type UprisingKnowledge = {
  gunpowder: boolean;
  industrialization: boolean;
  armorAdvance: boolean;
  guerrillaWarfare: boolean;
  // The strongest human's government is below the Republic (Anarchy to Fundamentalism), or there's none.
  belowRepublic: boolean;
  // The city's owner isn't the civilization that founded it.
  captured: boolean;
};

/**
 * The two types an uprising alternates in fours, `[main, alternate]` (`game.cpp` 1342-1381, the full roster): Chariots
 *  and Horsemen, swapped when `swap` (one time in 3); Archers and Elephants once anyone knows Gunpowder; Cannon and
 *  Musketeers with Industrialization; with Armor's advance as well, Artillery and Riflemen; and with Guerrilla Warfare,
 *  Cavalry and Partisans, or Artillery and Fanatics for a Republic or a Democracy holding the city its owner founded.
 */
export const uprisingTypes = (
  knows: UprisingKnowledge,
  swap: boolean
): [typeof Unit, typeof Unit] => {
  let main: typeof Unit = Chariot,
    alternate: typeof Unit = Horseman;

  if (swap) {
    [main, alternate] = [alternate, main];
  }

  if (knows.gunpowder) {
    main = Archer;
    alternate = Elephant;
  }

  if (knows.industrialization) {
    main = Cannon;
    alternate = Musketman;

    if (knows.armorAdvance) {
      alternate = Rifleman;
      main = Artillery;

      if (knows.guerrillaWarfare) {
        if (knows.belowRepublic || knows.captured) {
          main = Cavalry;
          alternate = Partisan;
        } else {
          alternate = Fanatic;
        }
      }
    }
  }

  return [main, alternate];
};

/**
 * The units of an uprising of `horde` (`game.cpp` 1382-1397): `horde` + 1 of them, counted down from `horde`, the first
 *  the leader (a Diplomat), then `main` while the count has its 4 bit set and `alternate` otherwise.
 */
export const uprisingUnits = (
  horde: number,
  main: typeof Unit,
  alternate: typeof Unit
): (typeof Unit)[] => {
  const types: (typeof Unit)[] = [];

  for (let remaining = horde; remaining >= 0; remaining--) {
    types.push(
      remaining === horde ? Diplomat : (remaining & 4) === 0 ? alternate : main
    );
  }

  return types;
};

const standing = (game: Pick<Game, 'cities'>): City[] =>
  game.cities.entries().filter((city: City): boolean => !city.destroyed());

// Whether a civilization's unit stands next to `tile` on a square of the same kind, land or sea
//  (`tile_zoc_unit_adjacent(x, y, 0)`): no barbarian is allied to anyone.
const foreignUnitAdjacent = (game: Pick<Game, 'units'>, tile: Tile): boolean =>
  [0, 1, 2, 3, 4, 5, 6, 7].some((direction: number): boolean => {
    const neighbour = step(tile, direction);

    return (
      neighbour !== null &&
      neighbour.isWater() === tile.isWater() &&
      game.units
        .getByTile(neighbour)
        .some((unit: Unit): boolean => !isBarbarian(unit.player()))
    );
  });

/**
 * Where an uprising near `city` breaks out (`game.cpp` 1293-1316), drawing from `rand`: up to `activity` × 50 tries, the
 *  last never looked at, each a square drawn within the original's 13 × 13 box (`options.xOffset` east, −6 to 6
 *  north) round the city, in bounds, at least 5 from the nearest city, with no civilization's unit next to it, on land
 *  with no units, on the same land mass as the city. With `byRolledCity` false each try finds the city nearest it, and
 *  the next is drawn round that city. Returns the square and the city the horde is sized by, or `null`: no square, or
 *  no city at all (which the original gives up on at once).
 */
export const uprisingSite = (
  game: Pick<Game, 'cities' | 'landMasses' | 'units'>,
  city: City,
  activity: number,
  rand: () => number,
  options: UprisingOptions = CLASSIC_UPRISING
): { tile: Tile; city: City } | null => {
  const world = city.tile().map(),
    cities = standing(game);

  let target = city;

  for (let attempts = 0; ; ) {
    const [cx, cy] = civ2Coordinates(target.tile());

    let x = cx + options.xOffset(rand() % 13);

    const y = cy + (rand() % 13) - 6;

    if ((x & 1) !== 0) {
      x--;
    }

    if ((y & 1) !== 0) {
      x++;
    }

    const tile = tileAt(world, x, y);

    let nearestDistance = Infinity;

    if (tile !== null) {
      const nearest = nearestCity(tile, cities);

      if (nearest === null) {
        return null;
      }

      nearestDistance = nearest.distance;

      if (!options.byRolledCity) {
        target = nearest.city;
      }
    }

    attempts++;

    if (attempts >= activity * UPRISING_TRIES) {
      return null;
    }

    if (
      tile === null ||
      nearestDistance < UPRISING_CITY_DISTANCE ||
      foreignUnitAdjacent(game, tile) ||
      tile.isWater() ||
      game.units.getByTile(tile).length > 0
    ) {
      continue;
    }

    if (
      game.landMasses.getByTile(target.tile()) ===
      game.landMasses.getByTile(tile)
    ) {
      return { tile, city: target };
    }
  }
};

/**
 * What decides an uprising's units, for `city` (the city the horde is sized by). The government is the strongest
 *  human's (`strongestHumanGovernment`; the original reads a power rank as a civilization number there).
 */
export const uprisingKnowledge = (
  game: UprisingGame,
  city: City
): UprisingKnowledge => {
  const guerrillaWarfare = anyoneKnows(game, GuerrillaWarfare),
    government: Government | null = guerrillaWarfare
      ? strongestHumanGovernment(game)
      : null;

  return {
    gunpowder: anyoneKnows(game, Gunpowder),
    industrialization: anyoneKnows(game, Industrialization),
    armorAdvance: anyoneKnows(game, armorAdvance()),
    guerrillaWarfare,
    belowRepublic:
      government === null ||
      !(government instanceof Republic || government instanceof Democracy),
    captured: city.player() !== city.originalPlayer(),
  };
};

/**
 * An uprising near `city` (`barbarians_city_uprising`, `game.cpp` 1274): with a chance of the city's gold share
 *  (`cityGold`) in 100, a square found by `uprisingSite`, and `uprisingHorde` + 1 barbarians on it, sized by the city
 *  the site went by, Fanatics veterans. Emits `barbarians:uprising` (player, city, tile, industrial). Draws from the
 *  game's generator in the original's order.
 */
export const landUprising = (
  game: UprisingGame,
  city: City,
  activity: number,
  level: number,
  turn: number,
  options: UprisingOptions = CLASSIC_UPRISING
): void => {
  const rand = (): number => cRand(game.rng);

  if (rand() % 100 >= cityGold(city, game)) {
    return;
  }

  const site = uprisingSite(game, city, activity, rand, options);

  if (site === null) {
    options.dropped?.(city);

    return;
  }

  const { tile, city: sizedBy } = site,
    horde = uprisingHorde(
      game.cityGrowth.getByCity(sizedBy).size(),
      activity,
      level,
      turn,
      rand
    ),
    swap = rand() % 3 === 0,
    knows = uprisingKnowledge(game, sizedBy),
    [main, alternate] = uprisingTypes(knows, swap),
    player = barbarianPlayer(game, tile.map()),
    units = spawnUnits(
      player,
      tile,
      uprisingUnits(horde, main, alternate),
      game.rules
    );

  units
    .filter((unit: Unit): boolean => unit instanceof Fanatic)
    .forEach((unit: Unit): void =>
      game.unitImprovements.register(new Veteran(unit))
    );

  game.engine.emit(
    'barbarians:uprising',
    player,
    sizedBy,
    tile,
    knows.industrialization
  );
};

/**
 * The city a turn's uprising is drawn for (`game.cpp` 1595-1601): one of the standing cities, `rand % cities` (no draw
 *  for one or none), and only if a person plays its owner. `null` otherwise.
 */
export const uprisingCity = (
  game: Pick<Game, 'cities' | 'clients'>,
  rand: () => number
): City | null => {
  const cities = standing(game),
    index = cities.length <= 1 ? 0 : rand() % cities.length,
    city = cities[index];

  if (city === undefined || !isHuman(city.player(), game.clients)) {
    return null;
  }

  return city;
};

export default landUprising;
