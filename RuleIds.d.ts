/** Whether barbarians may appear this turn: from the onset turn for the activity level and the difficulty level. */
export declare const SPAWNING_RULE = 'civ2-barbarians:spawning/onset';
/** A raiding ship and its horde, every 8 or 16 turns, until anyone can build the unit Armor's advance gives. */
export declare const SEA_RAID_RULE = 'civ2-barbarians:turn/start/sea-raid';
/** Each turn one city may be drawn, and an uprising may break out near it if a person plays its owner. */
export declare const LAND_UPRISING_RULE =
  'civ2-barbarians:turn/start/land-uprising';
/** The barbarians a goody hut releases, whatever the activity level. */
export declare const HUT_HORDE_RULE =
  'civ2-barbarians:goody-hut/barbarians/horde';
/** A barbarian leader who defends and loses pays the activity level × 50 gold. */
export declare const RANSOM_RULE = 'civ2-barbarians:unit/defeated/ransom';
/** A barbarian city builds one unit: Legion or Knights, or keeps (or upgrades) the unit it built. */
export declare const CITY_BUILD_RULE = 'civ2-barbarians:city/build/units-only';
/** A leader left on his own far from any city, or at sea near one, leaves. */
export declare const LEADER_LEAVES_RULE =
  'civ2-barbarians:player/turn-start/leader-leaves';
/** A barbarian ship with fewer than 2 aboard, or at sea more than 30 turns, gives up. */
export declare const SHIP_GIVES_UP_RULE =
  'civ2-barbarians:player/turn-start/ship-gives-up';
/** The barbarians' leader is their unit of a role above the transports' (the Diplomat). */
export declare const LEADS_GROUP_RULE = 'civ2-barbarians:leads-group/role';
/** A barbarian within 2 rows of the top or bottom edge leaves the map. */
export declare const LEAVES_MAP_RULE = 'civ2-barbarians:leaves-map/edge-rows';
/** A barbarian ship carries the whole horde it was raised with. */
export declare const RAIDERS_ABOARD_RULE =
  'civ2-barbarians:unit/yield/raiders-aboard';
/** A barbarian's attack: halved against a computer player, × (level + 1) ÷ 4 against a person, and by city and Wonder. */
export declare const BARBARIAN_ATTACKER_RULE =
  'civ2-barbarians:unit/strength/barbarian-attacker';
/** A barbarian's defence: Archers, and the Legion while no person knows Iron Working, at half; the Great Wall. */
export declare const BARBARIAN_DEFENDER_RULE =
  'civ2-barbarians:unit/strength/barbarian-defender';
/** A city the barbarians attack rolls again on each round they win, with a Palace or fewer than 8 cities. */
export declare const DEFENDER_REROLLS_RULE =
  'civ2-barbarians:unit/combat-modifiers/defender-rerolls';
