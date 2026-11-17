import { Yield as UnitYield } from '@civ-clone/core-unit/Rules/Yield';
/** The most barbarians a raid brings: 5 + 2 at a = 3. */
export declare const MOST_RAIDERS = 7;
/**
 * A barbarian ship holds at least `MOST_RAIDERS`: the original makes the horde on the ship's square with no thought for
 *  its hold (a Trireme holds 2), and this keeps the whole horde aboard (`spawnUnits` would leave out those with no
 *  room). Low priority, after civ2-unit's hold.
 */
export declare const getRules: () => UnitYield[];
export default getRules;
