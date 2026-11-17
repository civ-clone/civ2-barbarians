import { Attack, Defence } from '@civ-clone/core-unit/Yields';
import {
  BARBARIAN_ATTACKER_RULE,
  BARBARIAN_DEFENDER_RULE,
  DEFENDER_REROLLS_RULE,
} from '../../RuleIds';
import {
  CombatGame,
  barbarianAttack,
  barbarianAttackFactor,
  barbarianDefence,
  defenderRerolls,
  halvedDefender,
  hasGreatWall,
} from '../../lib/combat';
import CombatModifiers, {
  CombatTerms,
} from '@civ-clone/base-combat-rounds/lib/CombatModifiers';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Low from '@civ-clone/core-rule/Priorities/Low';
import Strength from '@civ-clone/core-unit/Rules/Strength';
import Unit from '@civ-clone/core-unit/Unit';
import isBarbarian from '@civ-clone/base-civilization-barbarian/isBarbarian';

/**
 * Civilization II's odds when barbarians fight (`unit_resolve_attack_barbarian_odds`), after the defence bonuses (low
 *  priority, as the original applies them to the strengths `unit_defense_strength` gave):
 * - a barbarian attacker (`barbarianAttackFactor`), and a city that rolls again on each round it loses
 *   (`defenderRerolls`, a `CombatModifiers` rule: the city's own firepower changes come first);
 * - a barbarian defender (`barbarianDefence`), and ×2 for an attacker whose owner has the Great Wall.
 */
export const getRules = (game: CombatGame): (Strength | CombatModifiers)[] => [
  new Strength(
    BARBARIAN_ATTACKER_RULE,
    new Low(),
    new Criterion((attacker: Unit): boolean => isBarbarian(attacker.player())),
    new Criterion(
      (attacker: Unit, defender: Unit): boolean =>
        !isBarbarian(defender.player())
    ),
    new Effect(
      (
        attacker: Unit,
        defender: Unit,
        attack: Attack,
        defence: Defence
      ): void => {
        const factor = barbarianAttackFactor(barbarianAttack(game, defender));

        attack.add(attack.value() * (factor - 1), 'Barbarians');
      }
    )
  ),
  new Strength(
    BARBARIAN_DEFENDER_RULE,
    new Low(),
    new Criterion((attacker: Unit, defender: Unit): boolean =>
      isBarbarian(defender.player())
    ),
    new Criterion((attacker: Unit): boolean => !isBarbarian(attacker.player())),
    new Effect(
      (
        attacker: Unit,
        defender: Unit,
        attack: Attack,
        defence: Defence
      ): void => {
        if (halvedDefender(game, defender)) {
          defence.add(
            barbarianDefence(defence.value(), true) - defence.value(),
            'Barbarians'
          );
        }

        if (hasGreatWall(game, attacker.player())) {
          attack.add(attack.value(), 'GreatWall');
        }
      }
    )
  ),
  new CombatModifiers(
    DEFENDER_REROLLS_RULE,
    new Criterion((attacker: Unit, defender: Unit): boolean =>
      isBarbarian(attacker.player())
    ),
    new Criterion(
      (attacker: Unit, defender: Unit): boolean =>
        !isBarbarian(defender.player()) &&
        defenderRerolls(barbarianAttack(game, defender))
    ),
    new Effect(
      (attacker: Unit, defender: Unit, terms: CombatTerms): CombatTerms => ({
        ...terms,
        defenderRerolls: true,
      })
    )
  ),
];

export default getRules;
