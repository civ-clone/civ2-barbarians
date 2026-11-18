import { LeaderGame, leaderLeaves, leadersOf } from '../../lib/leader';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { Game } from '@civ-clone/core-game';
import { LEADER_LEAVES_RULE, SHIP_GIVES_UP_RULE } from '../../RuleIds';
import {
  ShipGame,
  forgetLostShips,
  giveUp,
  shipGivesUp,
  shipsOf,
} from '../../lib/ship';
import Player from '@civ-clone/core-player/Player';
import TurnStart from '@civ-clone/core-player/Rules/TurnStart';
import Unit from '@civ-clone/core-unit/Unit';
import isBarbarian from '@civ-clone/base-civilization-barbarian/isBarbarian';

/**
 * As the barbarians' turn starts, before their client moves them, each leader that `leaderLeaves` says leaves is taken
 *  off the map, with no ransom. Civilization II decides it by the unit, the turn and how far the cities are, which
 *  base-barbarians' `LeavesMap` (a question about a square) can't say, so it's a rule of its own. The client still
 *  walks a leader to the unit he follows.
 */
export const getRules = (
  game: LeaderGame & ShipGame & Pick<Game, 'turn'>
): TurnStart[] => [
  new TurnStart(
    LEADER_LEAVES_RULE,
    new Criterion((player: Player): boolean => isBarbarian(player)),
    new Effect((player: Player): void =>
      leadersOf(game, player)
        .filter((leader: Unit): boolean =>
          leaderLeaves(game, leader, game.turn.value())
        )
        .forEach((leader: Unit): void => leader.destroy())
    )
  ),
  // And each ship that `shipGivesUp` says gives up (nothing but leaders aboard, or its count of steps past 30) is
  //  taken off the map with whatever it carries, as the original does as the ship moves.
  new TurnStart(
    SHIP_GIVES_UP_RULE,
    new Criterion((player: Player): boolean => isBarbarian(player)),
    new Effect((player: Player): void => {
      forgetLostShips(game);
      shipsOf(game, player)
        .filter((ship) => shipGivesUp(game, ship))
        .forEach((ship) => giveUp(game, ship));
    })
  ),
];

export default getRules;
