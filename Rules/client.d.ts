import LeadsGroup from '@civ-clone/base-barbarians/Rules/LeadsGroup';
import LeavesMap from '@civ-clone/base-barbarians/Rules/LeavesMap';
import Tile from '@civ-clone/core-world/Tile';
/** A barbarian within this many rows of the top or bottom edge leaves the map (`ai.cpp` 2183-2186: `y < 2`). */
export declare const EDGE_ROWS = 2;
/** Whether `tile` is within `EDGE_ROWS` of the top or bottom edge, whatever the map's height. */
export declare const nearEdge: (tile: Tile) => boolean;
/**
 * What the barbarians' client asks the rule set (base-barbarians): the leader is a unit of a role above 4
 *  (`LeadsGroup`), and a barbarian leaves the map, and isn't landed, within 2 rows of the top or bottom edge
 *  (`LeavesMap`), counted in rows rather than scaled, as Civilization II does.
 */
export declare const getRules: () => (LeadsGroup | LeavesMap)[];
export default getRules;
