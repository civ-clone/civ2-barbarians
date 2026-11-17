import { Game } from '@civ-clone/core-game';
import Government from '@civ-clone/core-government/Government';
import Player from '@civ-clone/core-player/Player';
export type RanksGame = Pick<
  Game,
  'clients' | 'playerGovernments' | 'players' | 'rules'
>;
/**
 * The strongest player a person plays, by the game's `Rank` rules (`game.best_human_rank`), or `null` with none. The
 *  barbarians aren't ranked.
 */
export declare const strongestHuman: (game: RanksGame) => Player | null;
/**
 * The government of the strongest player a person plays, or `null`. The original reads `civs[game.best_human_rank]`,
 *  a power rank used as a civilization number; players here have no numbers, so this reads what was meant.
 */
export declare const strongestHumanGovernment: (
  game: RanksGame
) => Government | null;
