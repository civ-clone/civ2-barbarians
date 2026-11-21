import { Attack, Defence } from '@civ-clone/core-unit/Yields';
import {
  BARBARIAN_ATTACKER_RULE,
  BARBARIAN_DEFENDER_RULE,
  DEFENDER_REROLLS_RULE,
} from '../../RuleIds';
import {
  CombatGame,
  GREAT_WALL_ATTACK_MULTIPLIER,
  GREAT_WALL_BARBARIAN_ATTACK,
  PALACE_BARBARIAN_ATTACK,
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
import Description from '@civ-clone/core-rule/Description';
import Effect from '@civ-clone/core-rule/Effect';
import GreatWall from '@civ-clone/base-wonder-great-wall/GreatWall';
import Low from '@civ-clone/core-rule/Priorities/Low';
import Palace from '@civ-clone/base-city-improvement-palace/Palace';
import Strength from '@civ-clone/core-unit/Rules/Strength';
import Unit from '@civ-clone/core-unit/Unit';
import isBarbarian from '@civ-clone/base-civilization-barbarian/isBarbarian';

/**
 * Civilization II's odds when barbarians fight (`unit_resolve_attack_barbarian_odds`), after the defence bonuses (low
 *  priority, as the original applies them to the strengths `unit_defense_strength` gave):
 * - a barbarian attacker (`barbarianAttackFactor`), and a city that rolls again on each round it loses
 *   (`defenderRerolls`, a `CombatModifiers` rule: the city's own firepower changes come first);
 * - a barbarian defender (`barbarianDefence`), and ×2 for an attacker whose owner has the Great Wall
 *   (`GREAT_WALL_ATTACK_MULTIPLIER`).
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
    ),
    new Description(
      {
        type: 'barbarian_attack',
        subject: Palace,
        value: PALACE_BARBARIAN_ATTACK,
      },
      {
        type: 'barbarian_attack',
        subject: GreatWall,
        value: GREAT_WALL_BARBARIAN_ATTACK,
        scope: 'player',
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
          attack.add(
            attack.value() * (GREAT_WALL_ATTACK_MULTIPLIER - 1),
            'GreatWall'
          );
        }
      }
    ),
    new Description({
      type: 'attack_multiplier',
      subject: GreatWall,
      value: GREAT_WALL_ATTACK_MULTIPLIER,
      against: 'barbarians',
    })
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
    ),
    // Fewer than 8 cities lets a city roll again too, but that belongs to no improvement.
    new Description({ type: 'barbarian_defender_rerolls', subject: Palace })
  ),
];

export default getRules;
