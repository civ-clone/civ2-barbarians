import { Diplomat, Swordman, Trireme } from '@civ-clone/civ2-unit/Units';
import { leaderGivesUp, leaderLeaves } from '../lib/leader';
import NavalTransport from '@civ-clone/base-unit-type-naval-transport/NavalTransport';
import Player from '@civ-clone/core-player/Player';
import Stowed from '@civ-clone/base-unit-action-embark/Busy/Stowed';
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

    // At sea, carried by a ship: asleep (as a raid's horde starts), he stays; awake, he leaves less than 3 from a city,
    //  whatever the turn.
    city(player(), world.get(20, 10));

    const ship = make(Trireme, 20, 12) as unknown as NavalTransport,
      farShip = make(Trireme, 20, 22) as unknown as NavalTransport,
      load = (onto: NavalTransport): Unit => {
        const leader = new Diplomat(null, barbarians, onto.tile(), game.rules);

        expect(onto.stow(leader, onto.tile())).true;

        return leader;
      },
      asleep = load(ship),
      awake = load(ship),
      offshore = load(farShip);

    asleep.setBusy(new Stowed());

    expect(world.get(20, 12).isWater()).true;
    expect(ship.cargo()).include(asleep).include(awake);
    expect(leaderLeaves(game, asleep, 7)).false;
    expect(leaderLeaves(game, awake, 7)).true;
    expect(leaderLeaves(game, offshore, 0)).false;
  });
});
