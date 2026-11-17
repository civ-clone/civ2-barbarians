import { Game } from '@civ-clone/core-game';
import Government from '@civ-clone/core-government/Government';
import Player from '@civ-clone/core-player/Player';
export type RanksGame = Pick<
  Game,
  'attributes' | 'clients' | 'playerGovernments' | 'players' | 'rules'
>;
/**
 * Each player's power rank, 7 for the strongest and down by one (`civ_update_power_ranks`), by the game's `Rank` rules.
 *  The barbarians have none.
 */
export declare const powerRanks: (game: RanksGame) => Map<Player, number>;
/** The power rank of the strongest player a person plays (`game.best_human_rank`), or `null` with none. */
export declare const bestHumanRank: (game: RanksGame) => number | null;
/** The player whose civilization number (civ2-civilization's `colourSet`, 1 to 7) is `number`, or `null`. */
export declare const playerNumbered: (
  game: RanksGame,
  number: number
) => Player | null;
/**
 * The government the original reads as the strongest human's, `civs[game.best_human_rank].government`: the rank is used
 *  as a civilization number, so it's the government of the player numbered with that rank, whoever plays it. `null`
 *  when no player has that number (an empty slot: the original reads Anarchy's 0 there).
 */
export declare const rankAsNumberGovernment: (
  game: RanksGame
) => Government | null;
/** The government of the strongest player a person plays: what `rankAsNumberGovernment` was meant to read. */
export declare const bestHumanGovernment: (
  game: RanksGame
) => Government | null;
