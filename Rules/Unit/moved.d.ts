import { ShipGame } from '../../lib/ship';
import Moved from '@civ-clone/core-unit/Rules/Moved';
/** Each step a barbarian ship takes is counted towards its giving up (`lib/ship`'s `countStep`). */
export declare const getRules: (game: ShipGame) => Moved[];
export default getRules;
