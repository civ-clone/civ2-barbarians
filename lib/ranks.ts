import { Game } from '@civ-clone/core-game';
import Government from '@civ-clone/core-government/Government';
import Player from '@civ-clone/core-player/Player';
import isBarbarian from '@civ-clone/base-civilization-barbarian/isBarbarian';
import { isHuman } from '@civ-clone/civ2-difficulty/isHuman';
import { rankings } from '@civ-clone/core-power/lib/rank';

export type RanksGame = Pick<
  Game,
  'clients' | 'playerGovernments' | 'players' | 'rules'
>;

/**
 * The strongest player a person plays, by the game's `Rank` rules (`game.best_human_rank`), or `null` with none. The
 *  barbarians aren't ranked.
 */
export const strongestHuman = (game: RanksGame): Player | null =>
  rankings(
    game.players
      .entries()
      .filter((player: Player): boolean => !isBarbarian(player)),
    game.rules
  ).find((player: Player): boolean => isHuman(player, game.clients)) ?? null;

/**
 * The government of the strongest player a person plays, or `null`. The original reads `civs[game.best_human_rank]`,
 *  a power rank used as a civilization number; players here have no numbers, so this reads what was meant.
 */
export const strongestHumanGovernment = (
  game: RanksGame
): Government | null => {
  const player = strongestHuman(game);

  if (player === null) {
    return null;
  }

  try {
    return game.playerGovernments.getByPlayer(player).current();
  } catch (e) {
    return null;
  }
};
