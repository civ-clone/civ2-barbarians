import { ActivityGame } from '../../lib/activity';
import { HutGame } from '../../lib/hut';
import Barbarians from '@civ-clone/base-goody-hut-barbarians/Rules/Barbarians';
import { Game } from '@civ-clone/core-game';
/**
 * The barbarians a goody hut releases (`hut_barbarians`, `lib/hut`), at any activity level, a = 0 included: the
 *  original doesn't ask. Registering it is what lets civ2-goody-hut's barbarians outcome happen.
 */
export declare const getRules: (
  game: ActivityGame & HutGame & Pick<Game, 'turn'>
) => Barbarians[];
export default getRules;
