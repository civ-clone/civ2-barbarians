import { ActivityGame, activityLevel } from '../../lib/activity';
import hutBarbarians, { HutGame } from '../../lib/hut';
import Barbarians from '@civ-clone/base-goody-hut-barbarians/Rules/Barbarians';
import Effect from '@civ-clone/core-rule/Effect';
import { Game } from '@civ-clone/core-game';
import GoodyHut from '@civ-clone/core-goody-hut/GoodyHut';
import { HUT_HORDE_RULE } from '../../RuleIds';
import Unit from '@civ-clone/core-unit/Unit';

/**
 * The barbarians a goody hut releases (`hut_barbarians`, `lib/hut`), at any activity level, a = 0 included: the
 *  original doesn't ask. Registering it is what lets civ2-goody-hut's barbarians outcome happen.
 */
export const getRules = (
  game: ActivityGame & HutGame & Pick<Game, 'turn'>
): Barbarians[] => [
  new Barbarians(
    HUT_HORDE_RULE,
    new Effect((goodyHut: GoodyHut, unit: Unit): void => {
      hutBarbarians(
        game,
        goodyHut.tile(),
        unit,
        activityLevel(game),
        game.turn.value()
      );
    })
  ),
];

export default getRules;
