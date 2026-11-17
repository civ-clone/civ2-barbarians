import {
  Archer,
  Crusader,
  Diplomat,
  Dragoon,
  Frigate,
  Knight,
  Sail,
  Swordman,
  Trireme,
} from '@civ-clone/civ2-unit/Units';
import {
  Chivalry,
  IronWorking,
  Magnetism,
  Metallurgy,
  Navigation,
  Tactics,
} from '@civ-clone/civ2-science/Advances';
import { KnowsDependencies, anyoneKnows, personKnows } from './knows';
import barbarianPlayer, { BarbarianPlayerGame } from './barbarianPlayer';
import spawnUnits, {
  createUnit,
} from '@civ-clone/base-barbarians/lib/spawnUnits';
import Advance from '@civ-clone/core-science/Advance';
import { Game } from '@civ-clone/core-game';
import NavalTransport from '@civ-clone/base-unit-type-naval-transport/NavalTransport';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import Veteran from '@civ-clone/base-unit-improvement-veteran/UnitImprovements/Veteran';
import World from '@civ-clone/core-world/World';
import { cRand } from '@civ-clone/civ2-science/lib/pickResearch';
import { tileAt } from './grid';
import waterBodyHasAtLeast from '@civ-clone/base-barbarians/lib/waterBody';

export type SeaRaidGame = BarbarianPlayerGame &
  KnowsDependencies &
  Pick<Game, 'engine' | 'rng' | 'rules' | 'unitImprovements' | 'units'>;

/** How many squares a raiding ship's sea must have (`water_body_size < 0x10` rejects it). */
export const RAID_WATER_BODY = 16;

/** How many squares the search draws before it gives up, and the uprising is skipped that turn. */
export const RAID_TRIES = 1000;

/** The rows a raiding ship may appear on: 3 from the top to 4 from the bottom (`rand % (height − 6) + 3`). */
export const RAID_EDGE_ROWS = 3;

/**
 * How many barbarians a raid brings, the leader among them (`barbarians_sea_raid`, `game.cpp` 1497-1501):
 *  n = clamp(turn ÷ (250 − 50a) + 1, 1, 5), then n + 1, or n + 2 at a = 3.
 */
export const raidHorde = (activity: number, turn: number): number => {
  const n = Math.min(
    Math.max(Math.trunc(turn / (250 - 50 * activity)) + 1, 1),
    5
  );

  return activity === 3 ? n + 2 : n + 1;
};

/** What anyone, and what a person, knows: the raids' units follow both. */
export type Known = {
  anyone: (AdvanceType: typeof Advance) => boolean;
  person: (AdvanceType: typeof Advance) => boolean;
};

export const known = (game: KnowsDependencies): Known => ({
  anyone: (AdvanceType: typeof Advance): boolean =>
    anyoneKnows(game, AdvanceType),
  person: (AdvanceType: typeof Advance): boolean =>
    personKnows(game, AdvanceType),
});

/** The ship: a Trireme, a Caravel once anyone knows Navigation, a Frigate once anyone knows Magnetism. */
export const raidShip = (knows: Known): typeof Unit => {
  if (knows.anyone(Magnetism)) {
    return Frigate;
  }

  if (knows.anyone(Navigation)) {
    return Sail;
  }

  return Trireme;
};

/**
 * The escorts' type (`game.cpp` 1508-1523, the full roster): Archers; the Legion once a person knows Iron Working;
 *  Knights once anyone knows Metallurgy, or Chivalry at a = 3, and Crusaders instead on an odd row (the original's odd
 *  x); Dragoons once a person knows Tactics.
 */
export const raidEscort = (
  knows: Known,
  activity: number,
  oddRow: boolean
): typeof Unit => {
  let Escort: typeof Unit = Archer;

  if (knows.person(IronWorking)) {
    Escort = Swordman;
  }

  if (knows.anyone(Metallurgy) || (activity === 3 && knows.anyone(Chivalry))) {
    Escort = oddRow ? Crusader : Knight;
  }

  if (knows.person(Tactics)) {
    Escort = Dragoon;
  }

  return Escort;
};

/** The horde aboard, in the order the original makes it: the leader first when there is more than one, then escorts. */
export const raidUnits = (
  count: number,
  Escort: typeof Unit
): (typeof Unit)[] =>
  new Array(count)
    .fill(null)
    .map((_, index: number): typeof Unit =>
      count > 1 && index === 0 ? Diplomat : Escort
    );

/**
 * The square a raiding ship appears on (`barbarians_sea_raid`, `game.cpp` 1468-1495): up to `RAID_TRIES` squares drawn
 *  in the original's coordinates, on rows 3 to height − 4, each an empty square of a sea of at least 16. `null` when
 *  none is found: the draw after the last is made and not looked at, as in the original.
 */
export const raidSite = (
  world: World,
  rand: () => number,
  empty: (tile: Tile) => boolean
): Tile | null => {
  const width = world.width() * 2,
    height = world.height();

  // As the original: a square is drawn, then counted, then given up on past `RAID_TRIES`, so the last draw is never
  //  looked at.
  for (let tries = 1; ; tries++) {
    let x = width <= 1 ? 0 : rand() % width;

    const y = (height <= 7 ? 0 : rand() % (height - 6)) + RAID_EDGE_ROWS;

    if ((x & 1) !== 0) {
      x--;
    }

    if ((y & 1) !== 0) {
      x++;
    }

    if (tries > RAID_TRIES) {
      return null;
    }

    const tile = tileAt(world, x, y);

    if (
      tile !== null &&
      tile.isWater() &&
      empty(tile) &&
      waterBodyHasAtLeast(tile, RAID_WATER_BODY)
    ) {
      return tile;
    }
  }
};

/**
 * A raid from the sea (`barbarians_sea_raid`): a ship on `raidSite`'s square with `raidHorde` barbarians aboard, the
 *  ship a veteran on an even draw. Emits `barbarians:raiders-at-sea` (player, ship, tile). Returns `false` when no
 *  square was found, so the turn's uprising is skipped, as the original returns from `game_spawn_barbarians` then.
 */
export const seaRaid = (
  game: SeaRaidGame,
  world: World,
  activity: number,
  turn: number
): boolean => {
  const rand = (): number => cRand(game.rng),
    tile = raidSite(
      world,
      rand,
      (tile: Tile): boolean => game.units.getByTile(tile).length === 0
    );

  if (tile === null) {
    return false;
  }

  const knows = known(game),
    player = barbarianPlayer(game, world),
    ship = createUnit(
      raidShip(knows),
      player,
      tile,
      game.rules
    ) as unknown as NavalTransport;

  spawnUnits(
    player,
    tile,
    raidUnits(
      raidHorde(activity, turn),
      raidEscort(knows, activity, (tile.y() & 1) === 1)
    ),
    game.rules,
    ship
  );

  if ((rand() & 1) === 0) {
    game.unitImprovements.register(new Veteran(ship));
  }

  game.engine.emit('barbarians:raiders-at-sea', player, ship, tile);

  return true;
};

export default seaRaid;
