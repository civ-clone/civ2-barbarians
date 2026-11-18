import {
  ACTIVITY,
  ACTIVITY_DEFAULT,
  ACTIVITY_LEVELS,
  ACTIVITY_RANDOM,
} from './RuleSets';
import { Game, defaultGame } from '@civ-clone/core-game';
import RuleSet from '@civ-clone/core-rule/RuleSet';
import activity from './Rules/activityLevels';
import cityBuild from './Rules/City/build';
import client from './Rules/client';
import goodyHutBarbarians from './Rules/GoodyHut/barbarians';
import playerTurnStart from './Rules/Player/turn-start';
import spawning from './Rules/Spawning';
import turnStart from './Rules/Turn/start';
import unitCombat from './Rules/Unit/combat';
import unitDefeated from './Rules/Unit/defeated';
import unitMoved from './Rules/Unit/moved';
import unitYield from './Rules/Unit/yield';

export const register = (game: Game): void => {
  game.rules.register(
    ...activity(),
    ...spawning(game),
    ...turnStart(game),
    ...goodyHutBarbarians(game),
    ...unitDefeated(game),
    ...unitMoved(game),
    ...cityBuild(game),
    ...playerTurnStart(game),
    ...client(),
    ...unitYield(),
    ...unitCombat(game)
  );

  // How active the barbarians are: a choice saved with the game, the second level up to start with.
  game.ruleSets.register(
    new RuleSet(
      ACTIVITY,
      { exclusive: true, default: ACTIVITY_DEFAULT },
      ...ACTIVITY_LEVELS,
      ACTIVITY_RANDOM
    )
  );
};

// The plugin loader imports each package for this side effect.
register(defaultGame);

export default register;
