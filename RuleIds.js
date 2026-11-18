"use strict";
// The ids of this package's rules that another package is expected to name, as `civ2-enhanced` does when it takes the
//  place of one: imported, a rename breaks the other package's build rather than leaving both rules running.
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFENDER_REROLLS_RULE = exports.BARBARIAN_DEFENDER_RULE = exports.BARBARIAN_ATTACKER_RULE = exports.RAIDERS_ABOARD_RULE = exports.LEAVES_MAP_RULE = exports.LEADS_GROUP_RULE = exports.SHIP_COUNTS_STEPS_RULE = exports.SHIP_GIVES_UP_RULE = exports.LEADER_LEAVES_RULE = exports.CITY_BUILD_RULE = exports.RANSOM_RULE = exports.HUT_HORDE_RULE = exports.LAND_UPRISING_RULE = exports.SEA_RAID_RULE = exports.SPAWNING_RULE = void 0;
/** Whether barbarians may appear this turn: from the onset turn for the activity level and the difficulty level. */
exports.SPAWNING_RULE = 'civ2-barbarians:spawning/onset';
/** A raiding ship and its horde, every 8 or 16 turns, until anyone can build the unit Armor's advance gives. */
exports.SEA_RAID_RULE = 'civ2-barbarians:turn/start/sea-raid';
/** Each turn one city may be drawn, and an uprising may break out near it if a person plays its owner. */
exports.LAND_UPRISING_RULE = 'civ2-barbarians:turn/start/land-uprising';
/** The barbarians a goody hut releases, whatever the activity level. */
exports.HUT_HORDE_RULE = 'civ2-barbarians:goody-hut/barbarians/horde';
/** A barbarian leader who defends and loses pays the activity level × 50 gold. */
exports.RANSOM_RULE = 'civ2-barbarians:unit/defeated/ransom';
/** A barbarian city builds one unit: Legion or Knights, or keeps (or upgrades) the unit it built. */
exports.CITY_BUILD_RULE = 'civ2-barbarians:city/build/units-only';
/** A leader left on his own far from any city, or at sea near one, leaves. */
exports.LEADER_LEAVES_RULE = 'civ2-barbarians:player/turn-start/leader-leaves';
/** A barbarian ship with nothing but leaders aboard, or whose count of steps has passed 30, gives up. */
exports.SHIP_GIVES_UP_RULE = 'civ2-barbarians:player/turn-start/ship-gives-up';
/** Each step a barbarian ship takes is counted towards its giving up. */
exports.SHIP_COUNTS_STEPS_RULE = 'civ2-barbarians:unit/moved/ship-counts-steps';
/** The barbarians' leader is their unit of a role above the transports' (the Diplomat). */
exports.LEADS_GROUP_RULE = 'civ2-barbarians:leads-group/role';
/** A barbarian within 2 rows of the top or bottom edge leaves the map. */
exports.LEAVES_MAP_RULE = 'civ2-barbarians:leaves-map/edge-rows';
/** A barbarian ship carries the whole horde it was raised with. */
exports.RAIDERS_ABOARD_RULE = 'civ2-barbarians:unit/yield/raiders-aboard';
/** A barbarian's attack: halved against a computer player, × (level + 1) ÷ 4 against a person, and by city and Wonder. */
exports.BARBARIAN_ATTACKER_RULE = 'civ2-barbarians:unit/strength/barbarian-attacker';
/** A barbarian's defence: Archers, and the Legion while no person knows Iron Working, at half; the Great Wall. */
exports.BARBARIAN_DEFENDER_RULE = 'civ2-barbarians:unit/strength/barbarian-defender';
/** A city the barbarians attack rolls again on each round they win, with a Palace or fewer than 8 cities. */
exports.DEFENDER_REROLLS_RULE = 'civ2-barbarians:unit/combat-modifiers/defender-rerolls';
//# sourceMappingURL=RuleIds.js.map