import { Diplomat, Swordman, Trireme } from '@civ-clone/civ2-unit/Units';
import { leaderGivesUp, leaderLeaves } from '../lib/leader';
import Player from '@civ-clone/core-player/Player';
import Unit from '@civ-clone/core-unit/Unit';
import barbarianPlayer from '../lib/barbarianPlayer';
import { expect } from 'chai';
import { setUp } from './lib/setUp';

// OpenCiv2 `ai.cpp` `ai_barb_leader` 1885-1916 (richardpenman/civ2@e39fe7b).
describe('leaders', (): void => {
  it('give up (turn & 7) + 4 or more from the nearest city', (): void => {
    expect(leaderGivesUp(0, 3)).false;
    expect(leaderGivesUp(0, 4)).true;
    expect(leaderGivesUp(7, 10)).false;
    expect(leaderGivesUp(7, 11)).true;
    expect(leaderGivesUp(8, 4)).true;
  });

  it('stay with an escort, follow a fighting unit within 4, and otherwise leave far from cities', async (): Promise<void> => {
    const rows = [
        ...new Array(12).fill('#'.repeat(30)),
        ...new Array(12).fill('.'.repeat(30)),
      ],
      { city, game, player, world } = await setUp(rows),
      barbarians: Player = barbarianPlayer(game, world),
      make = (UnitType: typeof Unit, x: number, y: number): Unit =>
        new UnitType(null, barbarians, world.get(x, y), game.rules);

    city(player(), world.get(2, 4));

    // On land, 12 squares east of the city: far, on turn 0 ((0 & 7) + 4 = 4).
    const alone = make(Diplomat, 14, 4);

    expect(leaderLeaves(game, alone, 0)).true;

    // With a Legion on his square, he stays.
    const escort = make(Swordman, 14, 4);

    expect(leaderLeaves(game, alone, 0)).false;

    // With the Legion a square away, he follows it.
    escort.destroy();

    const near = make(Swordman, 15, 4);

    expect(leaderLeaves(game, alone, 0)).false;

    near.destroy();

    // Close to the city, he stays on turn 7 ((7 & 7) + 4 = 11 > the distance).
    const close = make(Diplomat, 6, 4);

    expect(leaderLeaves(game, close, 7)).false;
    expect(leaderLeaves(game, close, 0)).true;

    // At sea, aboard a ship: he leaves less than 3 from a city, whatever the turn.
    city(player(), world.get(20, 10));
    make(Trireme, 20, 12);
    make(Trireme, 20, 22);

    const nearShore = make(Diplomat, 20, 12),
      offshore = make(Diplomat, 20, 22);

    expect(world.get(20, 12).isWater()).true;
    expect(leaderLeaves(game, nearShore, 7)).true;
    expect(leaderLeaves(game, offshore, 0)).false;
  });
});
