import { ActivityGame, activityLevel } from '../../lib/activity';
import { LAND_UPRISING_RULE, SEA_RAID_RULE } from '../../RuleIds';
import landUprising, {
  CLASSIC_UPRISING,
  UprisingGame,
  uprisingCity,
} from '../../lib/uprising';
import { raidTurn, spawnTurn } from '../../lib/onset';
import seaRaid, {
  SeaRaidGame,
  raidFailed,
  uprisingSkipped,
} from '../../lib/seaRaid';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Start from '@civ-clone/core-turn-based-game/Rules/Start';
import Turn from '@civ-clone/core-turn-based-game/Turn';
import { anyoneKnows } from '../../lib/knows';
import { armorAdvance } from '../../lib/units';
import { cRand } from '@civ-clone/civ2-science/lib/pickResearch';
import { levelOf } from '@civ-clone/civ2-difficulty/level';
import spawning from '@civ-clone/base-barbarians/lib/spawning';
import worldOf from '@civ-clone/base-barbarians/lib/worldOf';

export type BarbariansGame = ActivityGame & SeaRaidGame & UprisingGame;

/**
 * When barbarians appear (`game_spawn_barbarians`, `game.cpp` 1566-1606), as each turn starts, for the turn just played
 *  (`spawnTurn`), once every `Spawning` rule allows it:
 * - `SEA_RAID_RULE`: on a raid turn (`raidTurn`), until anyone knows Armor's advance, a raid from the sea
 *   (`lib/seaRaid`). A raid that finds no square skips the turn's uprising (`raidFailed`, `uprisingSkipped`).
 * - `LAND_UPRISING_RULE`: one city is drawn, and an uprising may break out near it if a person plays it
 *   (`lib/uprising`). `civ2-enhanced` can take its place with other `UprisingOptions`.
 *
 * The barbarian player is made by the first spawn.
 */
export const getRules = (game: BarbariansGame): Start[] => [
  new Start(
    SEA_RAID_RULE,
    new Criterion((turn: Turn): boolean => spawning(game.rules, turn)),
    new Criterion((turn: Turn): boolean =>
      raidTurn(activityLevel(game), spawnTurn(turn))
    ),
    new Criterion((): boolean => !anyoneKnows(game, armorAdvance())),
    new Effect((turn: Turn): void => {
      const world = worldOf(game);

      if (world === null) {
        return;
      }

      if (!seaRaid(game, world, activityLevel(game), spawnTurn(turn))) {
        raidFailed(game, turn.value());
      }
    })
  ),
  new Start(
    LAND_UPRISING_RULE,
    new Criterion((turn: Turn): boolean => spawning(game.rules, turn)),
    new Effect((turn: Turn): void => {
      if (uprisingSkipped(game, turn.value())) {
        return;
      }

      const city = uprisingCity(game, () => cRand(game.rng));

      if (city === null) {
        return;
      }

      landUprising(
        game,
        city,
        activityLevel(game),
        levelOf(game.difficulty),
        spawnTurn(turn),
        CLASSIC_UPRISING
      );
    })
  ),
];

export default getRules;
