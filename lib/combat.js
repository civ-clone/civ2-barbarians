"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.halvedDefender = exports.barbarianAttack = exports.hasGreatWall = exports.barbarianDefence = exports.defenderRerolls = exports.barbarianAttackFactor = exports.MINIMUM_DEFENCE = void 0;
const Advances_1 = require("@civ-clone/civ2-science/Advances");
const Units_1 = require("@civ-clone/civ2-unit/Units");
const knows_1 = require("./knows");
const GreatWall_1 = require("@civ-clone/base-wonder-great-wall/GreatWall");
const Palace_1 = require("@civ-clone/base-city-improvement-palace/Palace");
const isHuman_1 = require("@civ-clone/civ2-difficulty/isHuman");
const level_1 = require("@civ-clone/civ2-difficulty/level");
// Civilization II's odds when barbarians fight (OpenCiv2 `unit_combat.cpp` 360-400,
//  `unit_resolve_attack_barbarian_odds`). The original's strengths are whole numbers at 8 steps to 1, halved and
//  scaled with C's integer division; here they're the battle's `Attack` and `Defence`, multiplied, and truncated to
//  whole steps only when the battle is fought (base-combat-rounds' `rollRange`).
/** The smallest defence a halved barbarian defender keeps: 1 step of 8 (`defense2 < 2` gives 1). */
exports.MINIMUM_DEFENCE = 1 / 8;
/**
 * What a barbarian's attack is multiplied by: ½ against a computer player, (level + 1) ÷ 4 against a person; in a
 *  city, 0 while its owner has fewer than 2 cities, and ½ with a Palace there; ½ again when the defender's owner has the
 *  Great Wall, wherever the defender stands.
 */
const barbarianAttackFactor = (terms) => {
    let factor = terms.defenderHuman ? (terms.level + 1) / 4 : 1 / 2;
    if (terms.inCity) {
        if (terms.defenderCities < 2) {
            factor = 0;
        }
        if (terms.palace) {
            factor /= 2;
        }
    }
    if (terms.greatWall) {
        factor /= 2;
    }
    return factor;
};
exports.barbarianAttackFactor = barbarianAttackFactor;
/** Whether the defender rolls again on each round the barbarians win: in a city with a Palace, or of an owner with fewer than 8 cities. */
const defenderRerolls = (terms) => terms.inCity && (terms.palace || terms.defenderCities < 8);
exports.defenderRerolls = defenderRerolls;
/**
 * A barbarian defender's defence: Archers, and the Legion while no person knows Iron Working, defend at half, but at
 *  least `MINIMUM_DEFENCE`.
 */
const barbarianDefence = (defence, halved) => halved ? Math.max(defence / 2, exports.MINIMUM_DEFENCE) : defence;
exports.barbarianDefence = barbarianDefence;
/** Whether `player` has the Great Wall (`civ_has_wonder`: it stands in one of its cities; it never goes out of date here). */
const hasGreatWall = (game, player) => game.wonders
    .entries()
    .some((wonder) => wonder instanceof GreatWall_1.default &&
    !wonder.city().destroyed() &&
    wonder.city().player() === player);
exports.hasGreatWall = hasGreatWall;
/** The terms of a barbarian `attacker`'s attack on `defender`. */
const barbarianAttack = (game, defender) => {
    const owner = defender.player(), city = game.cities.getByTile(defender.tile());
    return {
        defenderHuman: (0, isHuman_1.isHuman)(owner, game.clients),
        level: (0, level_1.levelOf)(game.difficulty),
        inCity: city !== null,
        defenderCities: game.cities
            .getByPlayer(owner)
            .filter((city) => !city.destroyed()).length,
        palace: city !== null &&
            game.cityImprovements
                .getByCity(city)
                .some((improvement) => improvement instanceof Palace_1.default),
        greatWall: (0, exports.hasGreatWall)(game, owner),
    };
};
exports.barbarianAttack = barbarianAttack;
/** Whether a barbarian `defender` defends at half: Archers, or the Legion while no person knows Iron Working. */
const halvedDefender = (game, defender) => defender instanceof Units_1.Archer ||
    (defender instanceof Units_1.Swordman && !(0, knows_1.personKnows)(game, Advances_1.IronWorking));
exports.halvedDefender = halvedDefender;
//# sourceMappingURL=combat.js.map