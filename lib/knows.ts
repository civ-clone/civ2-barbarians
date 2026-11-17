import Advance from '@civ-clone/core-science/Advance';
import { ClientRegistry } from '@civ-clone/core-client/ClientRegistry';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import anyoneHas from '@civ-clone/base-barbarians/lib/anyoneHas';
import { isHuman } from '@civ-clone/civ2-difficulty/isHuman';

export type KnowsDependencies = {
  clients: ClientRegistry;
  playerResearch: PlayerResearchRegistry;
};

/** Whether anyone knows `AdvanceType` (`game.advance_known_by[advance] != 0`). */
export const anyoneKnows = (
  { playerResearch }: Pick<KnowsDependencies, 'playerResearch'>,
  AdvanceType: typeof Advance
): boolean => anyoneHas(playerResearch, AdvanceType);

/**
 * Whether a person knows `AdvanceType` (`game.human_players & game.advance_known_by[advance]`): any player a person
 *  plays, in the game or gone.
 */
export const personKnows = (
  { clients, playerResearch }: KnowsDependencies,
  AdvanceType: typeof Advance
): boolean =>
  playerResearch.some(
    (research: PlayerResearch): boolean =>
      research.completed(AdvanceType) && isHuman(research.player(), clients)
  );

/** How many players know `AdvanceType` (`bits_count8(game.advance_known_by[advance])`). */
export const knownBy = (
  { playerResearch }: Pick<KnowsDependencies, 'playerResearch'>,
  AdvanceType: typeof Advance
): number =>
  playerResearch.filter((research: PlayerResearch): boolean =>
    research.completed(AdvanceType)
  ).length;
