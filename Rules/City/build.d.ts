import { Build } from '@civ-clone/core-city-build/Rules/Build';
import { CityBuildGame } from '../../lib/cityBuild';
/**
 * What a barbarian city may build: `barbarianBuild`'s one unit, and nothing else (`city_choose_production_barbarian`).
 *  civ2-unit's rules leave barbarian cities to this one. `civ2-enhanced` can take its place.
 */
export declare const getRules: (game: CityBuildGame) => Build[];
export default getRules;
