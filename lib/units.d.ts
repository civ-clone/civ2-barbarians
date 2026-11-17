import { UnitRow } from '@civ-clone/civ2-unit/data/units';
import Advance from '@civ-clone/core-science/Advance';
import Unit from '@civ-clone/core-unit/Unit';
/** `UnitType`'s `@UNITS` row, or `undefined` for a type that isn't Civilization II's. */
export declare const rowOf: (UnitType: Function) => UnitRow | undefined;
/** `UnitType`'s row index, or -1. */
export declare const indexOf: (UnitType: Function) => number;
/** The AI's role of `UnitType` (0 attack, 1 defend, … 5 settle, 6 diplomacy, 7 trade), or -1. */
export declare const roleOf: (UnitType: Function) => number;
/**
 * Whether `unit` is a barbarian leader: a unit whose role is above 4 (`unit_combat.cpp` 1080: the ransom), which for
 *  the barbarians is the Diplomat each group is raised with.
 */
export declare const isLeader: (unit: Unit) => boolean;
/**
 * The advance the Armor unit needs (`unit_types[UNIT_ARMOR].prerequisite`), read from its row: sea raids stop, and
 *  raiders and uprisings change, once anyone knows it.
 */
export declare const armorAdvance: () => typeof Advance;
