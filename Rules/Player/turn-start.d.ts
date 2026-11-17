import { LeaderGame } from '../../lib/leader';
import { Game } from '@civ-clone/core-game';
import TurnStart from '@civ-clone/core-player/Rules/TurnStart';
/**
 * As the barbarians' turn starts, before their client moves them, each leader that `leaderLeaves` says leaves is taken
 *  off the map, with no ransom. Civilization II decides it by the unit, the turn and how far the cities are, which
 *  base-barbarians' `LeavesMap` (a question about a square) can't say, so it's a rule of its own. The client still
 *  walks a leader to the unit he follows.
 */
export declare const getRules: (
  game: LeaderGame & Pick<Game, 'turn'>
) => TurnStart[];
export default getRules;
