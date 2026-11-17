import { KnowsDependencies, anyoneKnows, knownBy, personKnows } from './knows';
import { Knight, Settlers, Swordman } from '@civ-clone/civ2-unit/Units';
import { advanceType, unitTypes } from '@civ-clone/civ2-unit/lib/unitTable';
import { indexOf, rowOf } from './units';
import City from '@civ-clone/core-city/City';
import { Explosives } from '@civ-clone/civ2-science/Advances';
import { Game } from '@civ-clone/core-game';
import Unit from '@civ-clone/core-unit/Unit';
import { levelOf } from '@civ-clone/civ2-difficulty/level';
import { units } from '@civ-clone/civ2-unit/data/units';

export type CityBuildGame = KnowsDependencies &
  Pick<Game, 'cityBuilds' | 'difficulty'>;

/** The unit a barbarian city last built or is building, as the original's `building` keeps it, or `null`. */
export const lastBuilt = (
  game: Pick<Game, 'cityBuilds'>,
  city: City
): Function | null => {
  const cityBuild = game.cityBuilds.getByCity(city),
    building = cityBuild.building();

  if (building !== null) {
    return building.item();
  }

  return cityBuild.cleared()?.item ?? null;
};

/**
 * What a barbarian city starts building when it isn't building a unit (`city_production.cpp` 307-312): Knights once
 *  anyone knows Explosives, the Legion before.
 */
export const firstUnit = (game: KnowsDependencies): typeof Unit =>
  anyoneKnows(game, Explosives) ? Knight : Swordman;

/**
 * The unit that replaces `UnitType` in a barbarian city (`city_production.cpp` 313-338): the first unit of the same role
 *  whose advance is the one that makes `UnitType` obsolete, once at least two players know that advance and a person
 *  knows it (or at Emperor or Deity); never at Chieftain. `UnitType` itself otherwise.
 */
export const upgradeOf = (
  game: CityBuildGame,
  UnitType: typeof Unit
): typeof Unit => {
  const row = rowOf(UnitType);

  if (row === undefined || row[0] < 0) {
    return UnitType;
  }

  const level = levelOf(game.difficulty),
    Obsoleting = advanceType(row[0])!;

  if (
    level === 0 ||
    knownBy(game, Obsoleting) < 2 ||
    (!personKnows(game, Obsoleting) && level < 4)
  ) {
    return UnitType;
  }

  const upgrade = units.findIndex(
    ([, , , , , , , , , , role, prerequisite]): boolean =>
      prerequisite === row[0] && role === row[10]
  );

  return upgrade === -1 ? UnitType : unitTypes[upgrade];
};

/**
 * What a barbarian city builds (`city_choose_production_barbarian`): `firstUnit` while it isn't building a unit (the
 *  Settlers, row 0, count as none, as `building < 1` has it), otherwise the unit it builds, or `upgradeOf` it.
 *  Never an improvement or a Wonder.
 */
export const barbarianBuild = (
  game: CityBuildGame,
  city: City
): typeof Unit => {
  const last = lastBuilt(game, city);

  if (last === null || indexOf(last) < 1 || last === Settlers) {
    return firstUnit(game);
  }

  return upgradeOf(game, last as typeof Unit);
};

export default barbarianBuild;
