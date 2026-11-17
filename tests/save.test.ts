import { ACTIVITY, ACTIVITY_RANDOM } from '../RuleSets';
import { ACTIVITY_STATE, activityLevel } from '../lib/activity';
import { Game } from '@civ-clone/core-game';
import { expect } from 'chai';
import { gameForLoad } from '@civ-clone/core-save-game/gameForLoad';
import { hydrate } from '@civ-clone/core-save-game/hydrate';
import register from '../registerRules';
import { registerClasses } from '@civ-clone/core-save-game/registerClasses';
import { save } from '@civ-clone/core-save-game/save';

describe('a saved game', (): void => {
  it('keeps a drawn level, and draws no other after a load', (): void => {
    const game = new Game();

    game.engine.registerPlugins({ '@civ-clone/civ2-barbarians': 'test' });
    registerClasses(game);
    register(game);
    game.ruleSets.choose(ACTIVITY, ACTIVITY_RANDOM);

    // At King, the level with none set: 1 to 3.
    const level = activityLevel(game);

    expect(level).within(1, 3);

    const file = JSON.parse(
        JSON.stringify(save(game, { name: 'aa1', createdAt: 0 }))
      ),
      loaded = gameForLoad({
        classes: game.classes,
        engine: game.engine,
        rules: game.rules,
      });

    hydrate(file, loaded);

    const [record] = loaded.pendingEffects.getByHandler(ACTIVITY_STATE);

    expect(record.target()).null;
    expect(record.data()).eql({ level: String(level) });
    expect(record === game.pendingEffects.entries()[0]).false;

    // The loaded game's rules are the same game's, still on "random": the level comes from the record.
    expect(
      activityLevel({
        difficulty: loaded.difficulty,
        pendingEffects: loaded.pendingEffects,
        rng: (() => {
          throw new Error('drew');
        }) as any,
        rules: game.rules,
      })
    ).equal(level);
  });
});
