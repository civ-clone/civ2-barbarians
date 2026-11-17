import { ActivityGame } from '../../lib/activity';
import { UprisingGame } from '../../lib/uprising';
import { SeaRaidGame } from '../../lib/seaRaid';
import Start from '@civ-clone/core-turn-based-game/Rules/Start';
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
export declare const getRules: (game: BarbariansGame) => Start[];
export default getRules;
