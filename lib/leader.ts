import { distance, nearestCity } from './grid';
import { isLeader, roleOf } from './units';
import City from '@civ-clone/core-city/City';
import { Game } from '@civ-clone/core-game';
import Player from '@civ-clone/core-player/Player';
import Unit from '@civ-clone/core-unit/Unit';

export type LeaderGame = Pick<Game, 'cities' | 'units'>;

/** A leader at sea leaves less than this far from a city. */
export const LEADER_SEA_DISTANCE = 3;

/** A leader on land follows a fighting unit (attack or defence role) less than this far away. */
export const LEADER_FOLLOWS = 4;

/** Whether a leader with nobody to follow leaves on turn `turn`, `fromCity` from the nearest city: `(turn & 7) + 4` or more. */
export const leaderGivesUp = (turn: number, fromCity: number): boolean =>
  (turn & 7) + 4 <= fromCity;

/**
 * Whether the barbarian leader `leader` leaves the map this turn (`ai_barb_leader`, `ai.cpp` 1885-1916):
 * - on land with others on his square and fewer than 2 of his role among them, he stays with them;
 * - at sea, less than 3 from a city, he leaves;
 * - on land, with the nearest of his own units less than 4 away and of a fighting role, he follows it;
 * - otherwise on land, `leaderGivesUp` from the nearest city (always, with no city left), he leaves.
 */
export const leaderLeaves = (
  game: LeaderGame,
  leader: Unit,
  turn: number
): boolean => {
  const tile = leader.tile(),
    cities = game.cities
      .entries()
      .filter((city: City): boolean => !city.destroyed()),
    nearest = nearestCity(tile, cities),
    fromCity = nearest === null ? Infinity : nearest.distance,
    player = leader.player();

  if (tile.isWater()) {
    return fromCity < LEADER_SEA_DISTANCE;
  }

  const stack = game.units
    .getByTile(tile)
    .filter((unit: Unit): boolean => unit.player() === player);

  if (
    stack.length > 1 &&
    stack.filter(
      (unit: Unit): boolean =>
        roleOf(unit.constructor) === roleOf(leader.constructor)
    ).length < 2
  ) {
    return false;
  }

  const [closest] = game.units
    .getByPlayer(player)
    .filter((unit: Unit): boolean => unit !== leader && !unit.destroyed())
    .map((unit: Unit): [Unit, number] => [unit, distance(tile, unit.tile())])
    .sort(([, a], [, b]): number => a - b);

  if (
    closest !== undefined &&
    closest[1] < LEADER_FOLLOWS &&
    roleOf(closest[0].constructor) < 2
  ) {
    return false;
  }

  return leaderGivesUp(turn, fromCity);
};

/** The barbarian leaders of `player`'s units. */
export const leadersOf = (game: Pick<Game, 'units'>, player: Player): Unit[] =>
  game.units
    .getByPlayer(player)
    .filter((unit: Unit): boolean => !unit.destroyed() && isLeader(unit));
