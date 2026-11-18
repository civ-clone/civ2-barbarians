import { ShipGame, countStep, isTransportShip } from '../../lib/ship';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Moved from '@civ-clone/core-unit/Rules/Moved';
import { SHIP_COUNTS_STEPS_RULE } from '../../RuleIds';
import Unit from '@civ-clone/core-unit/Unit';
import isBarbarian from '@civ-clone/base-civilization-barbarian/isBarbarian';

/** Each step a barbarian ship takes is counted towards its giving up (`lib/ship`'s `countStep`). */
export const getRules = (game: ShipGame): Moved[] => [
  new Moved(
    SHIP_COUNTS_STEPS_RULE,
    new Criterion(
      (unit: Unit): boolean =>
        isTransportShip(unit) && isBarbarian(unit.player())
    ),
    new Effect((unit: Unit): void => countStep(game, unit))
  ),
];

export default getRules;
