import { IronWorking } from '@civ-clone/civ2-science/Advances';
import { Archer, Swordman } from '@civ-clone/civ2-unit/Units';
import { KnowsDependencies, personKnows } from './knows';
import City from '@civ-clone/core-city/City';
import CityImprovement from '@civ-clone/core-city-improvement/CityImprovement';
import { Game } from '@civ-clone/core-game';
import GreatWall from '@civ-clone/base-wonder-great-wall/GreatWall';
import Palace from '@civ-clone/base-city-improvement-palace/Palace';
import Player from '@civ-clone/core-player/Player';
import Unit from '@civ-clone/core-unit/Unit';
import { isHuman } from '@civ-clone/civ2-difficulty/isHuman';
import { levelOf } from '@civ-clone/civ2-difficulty/level';
import { playerOwnsWonder } from '@civ-clone/base-wonder/lib/hasWonder';

// Civilization II's odds when barbarians fight (OpenCiv2 `unit_combat.cpp` 360-400,
//  `unit_resolve_attack_barbarian_odds`). The original's strengths are whole numbers at 8 steps to 1, halved and
//  scaled with C's integer division; here they're the battle's `Attack` and `Defence`, multiplied, and truncated to
//  whole steps only when the battle is fought (base-combat-rounds' `rollRange`).

/** The smallest defence a halved barbarian defender keeps: 1 step of 8 (`defense2 < 2` gives 1). */
export const MINIMUM_DEFENCE = 1 / 8;

/** What a barbarian attack on a city with a Palace is multiplied by. */
export const PALACE_BARBARIAN_ATTACK = 1 / 2;

/** What a barbarian attack on a unit of the Great Wall's owner is multiplied by, wherever it stands. */
export const GREAT_WALL_BARBARIAN_ATTACK = 1 / 2;

/** What the attack of a unit of the Great Wall's owner is multiplied by against a barbarian defender. */
export const GREAT_WALL_ATTACK_MULTIPLIER = 2;

/** A barbarian attack's terms against a defender. */
export type BarbarianAttack = {
  // A person plays the defender.
  defenderHuman: boolean;
  // The difficulty level, 0 to 5.
  level: number;
  // The defender stands in a city.
  inCity: boolean;
  // The defender's owner's cities.
  defenderCities: number;
  // That city has a Palace.
  palace: boolean;
  // The defender's owner has the Great Wall.
  greatWall: boolean;
};

/**
 * What a barbarian's attack is multiplied by: ½ against a computer player, (level + 1) ÷ 4 against a person; in a
 *  city, 0 while its owner has fewer than 2 cities, and ½ with a Palace there (`PALACE_BARBARIAN_ATTACK`); ½ again when
 *  the defender's owner has the Great Wall (`GREAT_WALL_BARBARIAN_ATTACK`), wherever the defender stands.
 */
export const barbarianAttackFactor = (terms: BarbarianAttack): number => {
  let factor = terms.defenderHuman ? (terms.level + 1) / 4 : 1 / 2;

  if (terms.inCity) {
    if (terms.defenderCities < 2) {
      factor = 0;
    }

    if (terms.palace) {
      factor *= PALACE_BARBARIAN_ATTACK;
    }
  }

  if (terms.greatWall) {
    factor *= GREAT_WALL_BARBARIAN_ATTACK;
  }

  return factor;
};

/** Whether the defender rolls again on each round the barbarians win: in a city with a Palace, or of an owner with fewer than 8 cities. */
export const defenderRerolls = (terms: BarbarianAttack): boolean =>
  terms.inCity && (terms.palace || terms.defenderCities < 8);

/**
 * A barbarian defender's defence: Archers, and the Legion while no person knows Iron Working, defend at half, but at
 *  least `MINIMUM_DEFENCE`.
 */
export const barbarianDefence = (defence: number, halved: boolean): number =>
  halved ? Math.max(defence / 2, MINIMUM_DEFENCE) : defence;

/**
 * Whether `player` has the Great Wall (`civ_has_wonder`): it stands in one of its cities and hasn't expired. The
 *  original finds the Wonder's city through `wonder_get_city` (`city.cpp` 2045), which gives none once anyone knows the
 *  advance that ends it (Metallurgy, in civ2-wonder's requirements), as base-wonder's `playerOwnsWonder` reads them.
 */
export const hasGreatWall = (
  game: Pick<Game, 'playerResearch' | 'requirements' | 'wonders'>,
  player: Player
): boolean =>
  playerOwnsWonder(
    player,
    GreatWall,
    game.wonders,
    game.playerResearch,
    game.requirements
  );

export type CombatGame = KnowsDependencies &
  Pick<
    Game,
    'cities' | 'cityImprovements' | 'difficulty' | 'requirements' | 'wonders'
  >;

/** The terms of a barbarian `attacker`'s attack on `defender`. */
export const barbarianAttack = (
  game: CombatGame,
  defender: Unit
): BarbarianAttack => {
  const owner = defender.player(),
    city: City | null = game.cities.getByTile(defender.tile());

  return {
    defenderHuman: isHuman(owner, game.clients),
    level: levelOf(game.difficulty),
    inCity: city !== null,
    defenderCities: game.cities
      .getByPlayer(owner)
      .filter((city: City): boolean => !city.destroyed()).length,
    palace:
      city !== null &&
      game.cityImprovements
        .getByCity(city)
        .some(
          (improvement: CityImprovement): boolean =>
            improvement instanceof Palace
        ),
    greatWall: hasGreatWall(game, owner),
  };
};

/** Whether a barbarian `defender` defends at half: Archers, or the Legion while no person knows Iron Working. */
export const halvedDefender = (
  game: KnowsDependencies,
  defender: Unit
): boolean =>
  defender instanceof Archer ||
  (defender instanceof Swordman && !personKnows(game, IronWorking));
