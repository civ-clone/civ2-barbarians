import base, {
  BarbarianPlayerGame,
} from '@civ-clone/base-barbarians/lib/barbarianPlayer';
import { Anarchy } from '@civ-clone/civ2-government/Governments';
import Player from '@civ-clone/core-player/Player';
import World from '@civ-clone/core-world/World';

export type { BarbarianPlayerGame } from '@civ-clone/base-barbarians/lib/barbarianPlayer';

/**
 * The barbarian player (civilization 0 in the original), made by the first spawn with base-barbarians'
 *  `barbarianPlayer`: in Anarchy for good, with no advances. Civilization II gives a new player no advances when it
 *  joins (civ2-science's `Added` rule only sets up its research; the starting advances are civ2-player's start
 *  balancing, before the first turn), so no rule is held off.
 */
export const barbarianPlayer = (
  game: BarbarianPlayerGame,
  world: World
): Player => base(game, world, { government: Anarchy });

export default barbarianPlayer;
