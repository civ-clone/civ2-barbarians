import { ActivityGame, activityLevel } from '../../lib/activity';
import payRansom, { RansomGame } from '@civ-clone/base-barbarians/lib/ransom';
import Action from '@civ-clone/core-unit/Action';
import Criterion from '@civ-clone/core-rule/Criterion';
import Defeated from '@civ-clone/core-unit/Rules/Defeated';
import Effect from '@civ-clone/core-rule/Effect';
import { RANSOM_RULE } from '../../RuleIds';
import Unit from '@civ-clone/core-unit/Unit';
import isBarbarian from '@civ-clone/base-civilization-barbarian/isBarbarian';
import { isLeader } from '../../lib/units';
import ransom from '../../lib/ransom';

/**
 * Ransom (`unit_combat.cpp` 1080-1081, `unit_resolve_attack_ransom`): an attacker that beats a barbarian leader (a unit
 *  of a role above 4, the Diplomat) defending his square is paid `ransom` (activity × 50), through base-barbarians'
 *  `payRansom` (`barbarians:ransom`). Only the defender counts, so a leader killed in a stack another unit defended
 *  pays nothing; nor does one who attacks and loses.
 */
export const getRules = (game: ActivityGame & RansomGame): Defeated[] => [
  new Defeated(
    RANSOM_RULE,
    // `Attack` processes `Defeated` for a losing attacker too: the action's unit is the one that attacked.
    new Criterion(
      (unit: Unit, by: Unit, action?: Action): boolean =>
        !action || action.unit() !== unit
    ),
    new Criterion(
      (unit: Unit): boolean => isBarbarian(unit.player()) && isLeader(unit)
    ),
    new Criterion((unit: Unit, by: Unit): boolean => !isBarbarian(by.player())),
    new Effect((unit: Unit, by: Unit): void =>
      payRansom(game, by.player(), unit, ransom(activityLevel(game)))
    )
  ),
];

export default getRules;
