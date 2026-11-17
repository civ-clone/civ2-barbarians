import { UnitRow, units } from '@civ-clone/civ2-unit/data/units';
import { advanceType, unitTypes } from '@civ-clone/civ2-unit/lib/unitTable';
import Advance from '@civ-clone/core-science/Advance';
import { Tank } from '@civ-clone/civ2-unit/Units';
import Unit from '@civ-clone/core-unit/Unit';

// Civilization II's unit rows (`@UNITS`), by class, for what the barbarians' rules read from them.
const rows = new Map<Function, UnitRow>(
  units.map((row: UnitRow, index: number): [Function, UnitRow] => [
    unitTypes[index],
    row,
  ])
);

/** `UnitType`'s `@UNITS` row, or `undefined` for a type that isn't Civilization II's. */
export const rowOf = (UnitType: Function): UnitRow | undefined =>
  rows.get(UnitType);

/** `UnitType`'s row index, or -1. */
export const indexOf = (UnitType: Function): number =>
  unitTypes.indexOf(UnitType as typeof Unit);

/** The AI's role of `UnitType` (0 attack, 1 defend, … 5 settle, 6 diplomacy, 7 trade), or -1. */
export const roleOf = (UnitType: Function): number =>
  rowOf(UnitType)?.[10] ?? -1;

/**
 * Whether `unit` is a barbarian leader: a unit whose role is above 4 (`unit_combat.cpp` 1080: the ransom), which for
 *  the barbarians is the Diplomat each group is raised with.
 */
export const isLeader = (unit: Unit): boolean => roleOf(unit.constructor) > 4;

/**
 * The advance the Armor unit needs (`unit_types[UNIT_ARMOR].prerequisite`), read from its row: sea raids stop, and
 *  raiders and uprisings change, once anyone knows it.
 */
export const armorAdvance = (): typeof Advance =>
  advanceType(rowOf(Tank)![11])!;
