import { ActivityGame } from '../../lib/activity';
import { RansomGame } from '@civ-clone/base-barbarians/lib/ransom';
import Defeated from '@civ-clone/core-unit/Rules/Defeated';
/**
 * Ransom (`unit_combat.cpp` 1080-1081, `unit_resolve_attack_ransom`): an attacker that beats a barbarian leader (a unit
 *  of a role above 4, the Diplomat) defending his square is paid `ransom` (activity × 50), through base-barbarians'
 *  `payRansom` (`barbarians:ransom`). Only the defender counts, so a leader killed in a stack another unit defended
 *  pays nothing; nor does one who attacks and loses.
 */
export declare const getRules: (game: ActivityGame & RansomGame) => Defeated[];
export default getRules;
