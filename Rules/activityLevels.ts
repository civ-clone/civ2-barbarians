import { ACTIVITY_LEVELS, ACTIVITY_RANDOM } from '../RuleSets';
import Activity from './Activity';
import Effect from '@civ-clone/core-rule/Effect';

/** One `Activity` rule for each choice of the `ACTIVITY` set: each level, and the level drawn by the difficulty level. */
export const getRules = (): Activity[] => [
  ...ACTIVITY_LEVELS.map(
    (id: string, level: number): Activity =>
      new Activity(id, new Effect((): number => level))
  ),
  new Activity(ACTIVITY_RANDOM, new Effect((): 'random' => 'random')),
];

export default getRules;
