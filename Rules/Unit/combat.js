"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const RuleIds_1 = require("../../RuleIds");
const combat_1 = require("../../lib/combat");
const CombatModifiers_1 = require("@civ-clone/base-combat-rounds/lib/CombatModifiers");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Description_1 = require("@civ-clone/core-rule/Description");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const GreatWall_1 = require("@civ-clone/base-wonder-great-wall/GreatWall");
const Low_1 = require("@civ-clone/core-rule/Priorities/Low");
const Palace_1 = require("@civ-clone/base-city-improvement-palace/Palace");
const Strength_1 = require("@civ-clone/core-unit/Rules/Strength");
const isBarbarian_1 = require("@civ-clone/base-civilization-barbarian/isBarbarian");
/**
 * Civilization II's odds when barbarians fight (`unit_resolve_attack_barbarian_odds`), after the defence bonuses (low
 *  priority, as the original applies them to the strengths `unit_defense_strength` gave):
 * - a barbarian attacker (`barbarianAttackFactor`), and a city that rolls again on each round it loses
 *   (`defenderRerolls`, a `CombatModifiers` rule: the city's own firepower changes come first);
 * - a barbarian defender (`barbarianDefence`), and ×2 for an attacker whose owner has the Great Wall
 *   (`GREAT_WALL_ATTACK_MULTIPLIER`).
 */
const getRules = (game) => [
    new Strength_1.default(RuleIds_1.BARBARIAN_ATTACKER_RULE, new Low_1.default(), new Criterion_1.default((attacker) => (0, isBarbarian_1.default)(attacker.player())), new Criterion_1.default((attacker, defender) => !(0, isBarbarian_1.default)(defender.player())), new Effect_1.default((attacker, defender, attack, defence) => {
        const factor = (0, combat_1.barbarianAttackFactor)((0, combat_1.barbarianAttack)(game, defender));
        attack.add(attack.value() * (factor - 1), 'Barbarians');
    }), new Description_1.default({
        type: 'barbarian_attack',
        subject: Palace_1.default,
        value: combat_1.PALACE_BARBARIAN_ATTACK,
    }, {
        type: 'barbarian_attack',
        subject: GreatWall_1.default,
        value: combat_1.GREAT_WALL_BARBARIAN_ATTACK,
        scope: 'player',
    })),
    new Strength_1.default(RuleIds_1.BARBARIAN_DEFENDER_RULE, new Low_1.default(), new Criterion_1.default((attacker, defender) => (0, isBarbarian_1.default)(defender.player())), new Criterion_1.default((attacker) => !(0, isBarbarian_1.default)(attacker.player())), new Effect_1.default((attacker, defender, attack, defence) => {
        if ((0, combat_1.halvedDefender)(game, defender)) {
            defence.add((0, combat_1.barbarianDefence)(defence.value(), true) - defence.value(), 'Barbarians');
        }
        if ((0, combat_1.hasGreatWall)(game, attacker.player())) {
            attack.add(attack.value() * (combat_1.GREAT_WALL_ATTACK_MULTIPLIER - 1), 'GreatWall');
        }
    }), new Description_1.default({
        type: 'attack_multiplier',
        subject: GreatWall_1.default,
        value: combat_1.GREAT_WALL_ATTACK_MULTIPLIER,
        against: 'barbarians',
    })),
    new CombatModifiers_1.default(RuleIds_1.DEFENDER_REROLLS_RULE, new Criterion_1.default((attacker, defender) => (0, isBarbarian_1.default)(attacker.player())), new Criterion_1.default((attacker, defender) => !(0, isBarbarian_1.default)(defender.player()) &&
        (0, combat_1.defenderRerolls)((0, combat_1.barbarianAttack)(game, defender))), new Effect_1.default((attacker, defender, terms) => ({
        ...terms,
        defenderRerolls: true,
    })), 
    // Fewer than 8 cities lets a city roll again too, but that belongs to no improvement.
    new Description_1.default({ type: 'barbarian_defender_rerolls', subject: Palace_1.default })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=combat.js.map