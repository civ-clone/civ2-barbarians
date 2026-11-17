import Effect from '@civ-clone/core-rule/Effect';
import LeadsGroup from '@civ-clone/base-barbarians/Rules/LeadsGroup';
import LeavesMap from '@civ-clone/base-barbarians/Rules/LeavesMap';
import { LEADS_GROUP_RULE, LEAVES_MAP_RULE } from '../RuleIds';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import { isLeader } from '../lib/units';

/** A barbarian within this many rows of the top or bottom edge leaves the map (`ai.cpp` 2183-2186: `y < 2`). */
export const EDGE_ROWS = 2;

/** Whether `tile` is within `EDGE_ROWS` of the top or bottom edge, whatever the map's height. */
export const nearEdge = (tile: Tile): boolean =>
  tile.y() < EDGE_ROWS || tile.y() >= tile.map().height() - EDGE_ROWS;

/**
 * What the barbarians' client asks the rule set (base-barbarians): the leader is a unit of a role above 4
 *  (`LeadsGroup`), and a barbarian leaves the map, and isn't landed, within 2 rows of the top or bottom edge
 *  (`LeavesMap`), counted in rows rather than scaled, as Civilization II does.
 */
export const getRules = (): (LeadsGroup | LeavesMap)[] => [
  new LeadsGroup(
    LEADS_GROUP_RULE,
    new Effect((unit: Unit): boolean => isLeader(unit))
  ),
  new LeavesMap(
    LEAVES_MAP_RULE,
    new Effect((tile: Tile): boolean => nearEdge(tile))
  ),
];

export default getRules;
