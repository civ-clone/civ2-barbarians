import { ActivityGame, activityLevel } from '../lib/activity';
import { spawnTurn, spawns } from '../lib/onset';
import Effect from '@civ-clone/core-rule/Effect';
import { SPAWNING_RULE } from '../RuleIds';
import Spawning from '@civ-clone/base-barbarians/Rules/Spawning';
import Turn from '@civ-clone/core-turn-based-game/Turn';
import { levelOf } from '@civ-clone/civ2-difficulty/level';

/**
 * Barbarians appear from the onset turn for the activity level and the difficulty level (`lib/onset`), and never at
 *  a = 0. Every sea raid and uprising is gated on it; a hut's barbarians aren't.
 */
export const getRules = (game: ActivityGame): Spawning[] => [
  new Spawning(
    SPAWNING_RULE,
    new Effect((turn: Turn): boolean =>
      spawns(activityLevel(game), levelOf(game.difficulty), spawnTurn(turn))
    )
  ),
];

export default getRules;
