import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Low from '@civ-clone/core-rule/Priorities/Low';
import NavalTransport from '@civ-clone/base-unit-type-naval-transport/NavalTransport';
import { RAIDERS_ABOARD_RULE } from '../../RuleIds';
import Unit from '@civ-clone/core-unit/Unit';
import { Yield as UnitYield } from '@civ-clone/core-unit/Rules/Yield';
import { Capacity } from '@civ-clone/core-unit-transport/Yields';
import YieldValue from '@civ-clone/core-yield/Yield';
import isBarbarian from '@civ-clone/base-civilization-barbarian/isBarbarian';

/** The most barbarians a raid brings: 5 + 2 at a = 3. */
export const MOST_RAIDERS = 7;

/**
 * A barbarian ship holds at least `MOST_RAIDERS`: the original makes the horde on the ship's square with no thought for
 *  its hold (a Trireme holds 2), and this keeps the whole horde aboard (`spawnUnits` would leave out those with no
 *  room). Low priority, after civ2-unit's hold.
 */
export const getRules = (): UnitYield[] => [
  new UnitYield(
    RAIDERS_ABOARD_RULE,
    new Low(),
    new Criterion(
      (unit: Unit, unitYield: YieldValue): boolean =>
        unitYield instanceof Capacity &&
        unit instanceof NavalTransport &&
        isBarbarian(unit.player())
    ),
    new Effect((unit: Unit, unitYield: YieldValue): void => {
      if (unitYield.value() < MOST_RAIDERS) {
        unitYield.set(MOST_RAIDERS);
      }
    })
  ),
];

export default getRules;
