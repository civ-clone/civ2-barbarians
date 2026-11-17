import { KnowsDependencies } from './knows';
import City from '@civ-clone/core-city/City';
import { Game } from '@civ-clone/core-game';
import Unit from '@civ-clone/core-unit/Unit';
export type CityBuildGame = KnowsDependencies &
  Pick<Game, 'cityBuilds' | 'difficulty'>;
/** The unit a barbarian city last built or is building, as the original's `building` keeps it, or `null`. */
export declare const lastBuilt: (
  game: Pick<Game, 'cityBuilds'>,
  city: City
) => Function | null;
/**
 * What a barbarian city starts building when it isn't building a unit (`city_production.cpp` 307-312): Knights once
 *  anyone knows Explosives, the Legion before.
 */
export declare const firstUnit: (game: KnowsDependencies) => typeof Unit;
/**
 * The unit that replaces `UnitType` in a barbarian city (`city_production.cpp` 313-338): the first unit of the same role
 *  whose advance is the one that makes `UnitType` obsolete, once at least two players know that advance and a person
 *  knows it (or at Emperor or Deity); never at Chieftain. `UnitType` itself otherwise.
 */
export declare const upgradeOf: (
  game: CityBuildGame,
  UnitType: typeof Unit
) => typeof Unit;
/**
 * What a barbarian city builds (`city_choose_production_barbarian`): `firstUnit` while it isn't building a unit (the
 *  Settlers, row 0, count as none, as `building < 1` has it), otherwise the unit it builds, or `upgradeOf` it.
 *  Never an improvement or a Wonder.
 */
export declare const barbarianBuild: (
  game: CityBuildGame,
  city: City
) => typeof Unit;
export default barbarianBuild;
