import { KnowsDependencies } from './knows';
import { Game } from '@civ-clone/core-game';
import Player from '@civ-clone/core-player/Player';
import Unit from '@civ-clone/core-unit/Unit';
/** The smallest defence a halved barbarian defender keeps: 1 step of 8 (`defense2 < 2` gives 1). */
export declare const MINIMUM_DEFENCE: number;
/** What a barbarian attack on a city with a Palace is multiplied by. */
export declare const PALACE_BARBARIAN_ATTACK: number;
/** What a barbarian attack on a unit of the Great Wall's owner is multiplied by, wherever it stands. */
export declare const GREAT_WALL_BARBARIAN_ATTACK: number;
/** What the attack of a unit of the Great Wall's owner is multiplied by against a barbarian defender. */
export declare const GREAT_WALL_ATTACK_MULTIPLIER = 2;
/** A barbarian attack's terms against a defender. */
export type BarbarianAttack = {
  defenderHuman: boolean;
  level: number;
  inCity: boolean;
  defenderCities: number;
  palace: boolean;
  greatWall: boolean;
};
/**
 * What a barbarian's attack is multiplied by: ½ against a computer player, (level + 1) ÷ 4 against a person; in a
 *  city, 0 while its owner has fewer than 2 cities, and ½ with a Palace there (`PALACE_BARBARIAN_ATTACK`); ½ again when
 *  the defender's owner has the Great Wall (`GREAT_WALL_BARBARIAN_ATTACK`), wherever the defender stands.
 */
export declare const barbarianAttackFactor: (terms: BarbarianAttack) => number;
/** Whether the defender rolls again on each round the barbarians win: in a city with a Palace, or of an owner with fewer than 8 cities. */
export declare const defenderRerolls: (terms: BarbarianAttack) => boolean;
/**
 * A barbarian defender's defence: Archers, and the Legion while no person knows Iron Working, defend at half, but at
 *  least `MINIMUM_DEFENCE`.
 */
export declare const barbarianDefence: (
  defence: number,
  halved: boolean
) => number;
/**
 * Whether `player` has the Great Wall (`civ_has_wonder`): it stands in one of its cities and hasn't expired. The
 *  original finds the Wonder's city through `wonder_get_city` (`city.cpp` 2045), which gives none once anyone knows the
 *  advance that ends it (Metallurgy, in civ2-wonder's requirements), as base-wonder's `playerOwnsWonder` reads them.
 */
export declare const hasGreatWall: (
  game: Pick<Game, 'playerResearch' | 'requirements' | 'wonders'>,
  player: Player
) => boolean;
export type CombatGame = KnowsDependencies &
  Pick<
    Game,
    'cities' | 'cityImprovements' | 'difficulty' | 'requirements' | 'wonders'
  >;
/** The terms of a barbarian `attacker`'s attack on `defender`. */
export declare const barbarianAttack: (
  game: CombatGame,
  defender: Unit
) => BarbarianAttack;
/** Whether a barbarian `defender` defends at half: Archers, or the Legion while no person knows Iron Working. */
export declare const halvedDefender: (
  game: KnowsDependencies,
  defender: Unit
) => boolean;
