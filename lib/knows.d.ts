import Advance from '@civ-clone/core-science/Advance';
import { ClientRegistry } from '@civ-clone/core-client/ClientRegistry';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
export type KnowsDependencies = {
  clients: ClientRegistry;
  playerResearch: PlayerResearchRegistry;
};
/** Whether anyone knows `AdvanceType` (`game.advance_known_by[advance] != 0`). */
export declare const anyoneKnows: (
  { playerResearch }: Pick<KnowsDependencies, 'playerResearch'>,
  AdvanceType: typeof Advance
) => boolean;
/**
 * Whether a person knows `AdvanceType` (`game.human_players & game.advance_known_by[advance]`): any player a person
 *  plays, in the game or gone.
 */
export declare const personKnows: (
  { clients, playerResearch }: KnowsDependencies,
  AdvanceType: typeof Advance
) => boolean;
/** How many players know `AdvanceType` (`bits_count8(game.advance_known_by[advance])`). */
export declare const knownBy: (
  { playerResearch }: Pick<KnowsDependencies, 'playerResearch'>,
  AdvanceType: typeof Advance
) => number;
