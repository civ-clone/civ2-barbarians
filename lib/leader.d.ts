import { Game } from '@civ-clone/core-game';
import Player from '@civ-clone/core-player/Player';
import Unit from '@civ-clone/core-unit/Unit';
export type LeaderGame = Pick<Game, 'cities' | 'units'>;
/**
 * Whether `unit` sleeps aboard a ship (`Stowed`), as a raid's horde does from the start (`game.cpp` 1542). A unit
 *  carried but awake (its escorts landed, the ship woken near land) is at sea, and moves.
 */
export declare const asleepAboard: (unit: Unit) => boolean;
/** A leader at sea leaves less than this far from a city. */
export declare const LEADER_SEA_DISTANCE = 3;
/** A leader on land follows a fighting unit (attack or defence role) less than this far away. */
export declare const LEADER_FOLLOWS = 4;
/** Whether a leader with nobody to follow leaves on turn `turn`, `fromCity` from the nearest city: `(turn & 7) + 4` or more. */
export declare const leaderGivesUp: (turn: number, fromCity: number) => boolean;
/**
 * Whether the barbarian leader `leader` leaves the map this turn (`ai_barb_leader`, `ai.cpp` 1885-1916):
 * - asleep aboard a ship he stays: the original's raiders sleep at sea (`game.cpp` 1542), so `ai_barb_leader` never
 *   runs for them;
 * - on land with others on his square and fewer than 2 of his role among them, he stays with them;
 * - awake at sea (carried by a ship that has woken him), less than 3 from a city, he leaves;
 * - on land, with the nearest of his own units less than 4 away and of a fighting role, he follows it;
 * - otherwise on land, `leaderGivesUp` from the nearest city (always, with no city left), he leaves.
 */
export declare const leaderLeaves: (
  game: LeaderGame,
  leader: Unit,
  turn: number
) => boolean;
/** The barbarian leaders of `player`'s units. */
export declare const leadersOf: (
  game: Pick<Game, 'units'>,
  player: Player
) => Unit[];
