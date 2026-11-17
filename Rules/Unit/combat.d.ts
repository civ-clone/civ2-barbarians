import { CombatGame } from '../../lib/combat';
import CombatModifiers from '@civ-clone/base-combat-rounds/lib/CombatModifiers';
import Strength from '@civ-clone/core-unit/Rules/Strength';
/**
 * Civilization II's odds when barbarians fight (`unit_resolve_attack_barbarian_odds`), after the defence bonuses (low
 *  priority, as the original applies them to the strengths `unit_defense_strength` gave):
 * - a barbarian attacker (`barbarianAttackFactor`), and a city that rolls again on each round it loses
 *   (`defenderRerolls`, a `CombatModifiers` rule: the city's own firepower changes come first);
 * - a barbarian defender (`barbarianDefence`), and ×2 for an attacker whose owner has the Great Wall.
 */
export declare const getRules: (
  game: CombatGame
) => (Strength | CombatModifiers)[];
export default getRules;
