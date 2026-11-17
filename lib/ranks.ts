import Civilization from '@civ-clone/core-civilization/Civilization';
import { Game } from '@civ-clone/core-game';
import Government from '@civ-clone/core-government/Government';
import Player from '@civ-clone/core-player/Player';
import isBarbarian from '@civ-clone/base-civilization-barbarian/isBarbarian';
import { isHuman } from '@civ-clone/civ2-difficulty/isHuman';
import { rankings } from '@civ-clone/core-power/lib/rank';

export type RanksGame = Pick<
  Game,
  'attributes' | 'clients' | 'playerGovernments' | 'players' | 'rules'
>;

/**
 * Each player's power rank, 7 for the strongest and down by one (`civ_update_power_ranks`), by the game's `Rank` rules.
 *  The barbarians have none.
 */
export const powerRanks = (game: RanksGame): Map<Player, number> =>
  new Map(
    rankings(
      game.players
        .entries()
        .filter((player: Player): boolean => !isBarbarian(player)),
      game.rules
    ).map((player: Player, index: number): [Player, number] => [
      player,
      7 - index,
    ])
  );

/** The power rank of the strongest player a person plays (`game.best_human_rank`), or `null` with none. */
export const bestHumanRank = (game: RanksGame): number | null => {
  const ranks = [...powerRanks(game)]
    .filter(([player]): boolean => isHuman(player, game.clients))
    .map(([, rank]): number => rank);

  return ranks.length === 0 ? null : Math.max(...ranks);
};

/** The player whose civilization number (civ2-civilization's `colourSet`, 1 to 7) is `number`, or `null`. */
export const playerNumbered = (
  game: RanksGame,
  number: number
): Player | null =>
  game.players
    .entries()
    .find(
      (player: Player): boolean =>
        !isBarbarian(player) &&
        game.attributes
          .getByCivilization(
            player.civilization().constructor as typeof Civilization
          )
          .some(
            (attribute): boolean =>
              attribute.name() === 'colourSet' && attribute.value() === number
          )
    ) ?? null;

const governmentOf = (game: RanksGame, player: Player | null) => {
  if (player === null) {
    return null;
  }

  try {
    return game.playerGovernments.getByPlayer(player).current();
  } catch (e) {
    return null;
  }
};

/**
 * The government the original reads as the strongest human's, `civs[game.best_human_rank].government`: the rank is used
 *  as a civilization number, so it's the government of the player numbered with that rank, whoever plays it. `null`
 *  when no player has that number (an empty slot: the original reads Anarchy's 0 there).
 */
export const rankAsNumberGovernment = (game: RanksGame): Government | null => {
  const rank = bestHumanRank(game);

  return rank === null ? null : governmentOf(game, playerNumbered(game, rank));
};

/** The government of the strongest player a person plays: what `rankAsNumberGovernment` was meant to read. */
export const bestHumanGovernment = (game: RanksGame): Government | null => {
  const ranks = powerRanks(game);

  const [best] = [...ranks]
    .filter(([player]): boolean => isHuman(player, game.clients))
    .sort(([, a], [, b]): number => b - a);

  return best === undefined ? null : governmentOf(game, best[0]);
};
