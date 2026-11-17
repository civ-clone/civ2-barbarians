import { ActivityGame } from '../lib/activity';
import Spawning from '@civ-clone/base-barbarians/Rules/Spawning';
/**
 * Barbarians appear from the onset turn for the activity level and the difficulty level (`lib/onset`), and never at
 *  a = 0. Every sea raid and uprising is gated on it; a hut's barbarians aren't.
 */
export declare const getRules: (game: ActivityGame) => Spawning[];
export default getRules;
