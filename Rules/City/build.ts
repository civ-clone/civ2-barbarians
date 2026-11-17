import { Build, IBuildCriterion } from '@civ-clone/core-city-build/Rules/Build';
import barbarianBuild, { CityBuildGame } from '../../lib/cityBuild';
import { CITY_BUILD_RULE } from '../../RuleIds';
import City from '@civ-clone/core-city/City';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { IConstructor } from '@civ-clone/core-registry/Registry';
import isBarbarian from '@civ-clone/base-civilization-barbarian/isBarbarian';

/**
 * What a barbarian city may build: `barbarianBuild`'s one unit, and nothing else (`city_choose_production_barbarian`).
 *  civ2-unit's rules leave barbarian cities to this one. `civ2-enhanced` can take its place.
 */
export const getRules = (game: CityBuildGame): Build[] => [
  new Build(
    CITY_BUILD_RULE,
    new Criterion((city: City): boolean => isBarbarian(city.player())),
    new Effect(
      (city: City, Item: IConstructor): IBuildCriterion =>
        new Criterion(
          (): boolean =>
            Item === (barbarianBuild(game, city) as unknown as IConstructor)
        )
    )
  ),
];

export default getRules;
