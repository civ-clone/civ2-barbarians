import {
  Archer,
  Crusader,
  Diplomat,
  Dragoon,
  Frigate,
  Knight,
  Sail,
  Swordman,
  Trireme,
} from '@civ-clone/civ2-unit/Units';
import {
  Chivalry,
  IronWorking,
  Magnetism,
  Metallurgy,
  Navigation,
  Tactics,
} from '@civ-clone/civ2-science/Advances';
import {
  Known,
  RAID_TRIES,
  raidEscort,
  raidHorde,
  raidShip,
  raidSite,
  raidUnits,
  seaRaid,
} from '../lib/seaRaid';
import Advance from '@civ-clone/core-science/Advance';
import Tile from '@civ-clone/core-world/Tile';
import { expect } from 'chai';
import { setUp } from './lib/setUp';

const knowing = (
  anyone: (typeof Advance)[],
  person: (typeof Advance)[] = []
): Known => ({
  anyone: (AdvanceType: typeof Advance): boolean =>
    anyone.includes(AdvanceType) || person.includes(AdvanceType),
  person: (AdvanceType: typeof Advance): boolean =>
    person.includes(AdvanceType),
});

// OpenCiv2 `game.cpp` `barbarians_sea_raid` 1451-1560 (richardpenman/civ2@e39fe7b).
describe('sea raids', (): void => {
  it('brings clamp(turn ÷ (250 − 50a) + 1, 1, 5) + 1 barbarians, + 2 at a = 3', (): void => {
    // a = 1: ÷ 200.
    expect(raidHorde(1, 0)).equal(2);
    expect(raidHorde(1, 199)).equal(2);
    expect(raidHorde(1, 200)).equal(3);
    expect(raidHorde(1, 799)).equal(5);
    expect(raidHorde(1, 800)).equal(6);
    expect(raidHorde(1, 5000)).equal(6);
    // a = 2: ÷ 150.
    expect(raidHorde(2, 149)).equal(2);
    expect(raidHorde(2, 150)).equal(3);
    expect(raidHorde(2, 600)).equal(6);
    // a = 3: ÷ 100, and one more.
    expect(raidHorde(3, 99)).equal(3);
    expect(raidHorde(3, 100)).equal(4);
    expect(raidHorde(3, 400)).equal(7);
    expect(raidHorde(3, 1000)).equal(7);
  });

  it('sails a Trireme, a Caravel once anyone knows Navigation, a Frigate once anyone knows Magnetism', (): void => {
    expect(raidShip(knowing([]))).equal(Trireme);
    expect(raidShip(knowing([Navigation]))).equal(Sail);
    expect(raidShip(knowing([Navigation, Magnetism]))).equal(Frigate);
    expect(raidShip(knowing([Magnetism]))).equal(Frigate);
  });

  it('escorts with Archers, the Legion once a person knows Iron Working, Knights or Crusaders, then Dragoons', (): void => {
    expect(raidEscort(knowing([]), 2, false)).equal(Archer);
    // A computer player's Iron Working doesn't count.
    expect(raidEscort(knowing([IronWorking]), 2, false)).equal(Archer);
    expect(raidEscort(knowing([], [IronWorking]), 2, false)).equal(Swordman);
    expect(raidEscort(knowing([Metallurgy]), 2, false)).equal(Knight);
    expect(raidEscort(knowing([Metallurgy]), 2, true)).equal(Crusader);
    // Chivalry only at a = 3.
    expect(raidEscort(knowing([Chivalry]), 2, false)).equal(Archer);
    expect(raidEscort(knowing([Chivalry]), 3, false)).equal(Knight);
    expect(raidEscort(knowing([Metallurgy, Tactics]), 2, false)).equal(Knight);
    expect(raidEscort(knowing([Metallurgy], [Tactics]), 2, true)).equal(
      Dragoon
    );
  });

  it('puts the leader first, and has none in a horde of one', (): void => {
    expect(raidUnits(3, Archer)).eql([Diplomat, Archer, Archer]);
    expect(raidUnits(1, Archer)).eql([Archer]);
  });

  it('finds an empty square of a sea of 16 or more on rows 3 to height − 4, in the order drawn', async (): Promise<void> => {
    // 8 wide (16 half columns), 12 high: a sea of 3 squares in the north-west corner, open sea elsewhere.
    const { world } = await setUp([
        '..######',
        '.#######',
        '########',
        '...#####',
        '########',
        '########',
        '########',
        '###.....',
        '##......',
        '###.....',
        '########',
        '########',
      ]),
      draws: number[] = [];

    // Each try draws x below 16, then y below 6 (rows 3 to 8).
    const rolls = [
        // x 0, y 0 + 3 = 3: (0, 3), the small sea of 3 squares: rejected.
        0, 0,
        // x 9, y 4 + 3 = 7: odd x on an odd row is kept: (4, 7), open sea.
        9, 4,
      ],
      rand = (): number => {
        draws.push(rolls[draws.length]);

        return rolls[draws.length - 1];
      };

    expect(raidSite(world, rand, (): boolean => true)).equal(world.get(4, 7));
    expect(draws.length).equal(4);
  });

  it('gives up after its tries, drawing one more square it never looks at', async (): Promise<void> => {
    const { world } = await setUp(new Array(10).fill('########'));

    let draws = 0;

    expect(
      raidSite(
        world,
        (): number => {
          draws++;

          return 0;
        },
        (tile: Tile): boolean => true
      )
    ).null;
    expect(draws).equal((RAID_TRIES + 1) * 2);
  });
});

describe('a sea raid in a game', (): void => {
  it('puts the whole horde aboard, even 7 on a Trireme, and says where', async (): Promise<void> => {
    const rows = new Array(10).fill('........'),
      { game, world } = await setUp(rows),
      raids: unknown[][] = [];

    game.engine.on('barbarians:raiders-at-sea', (...args: unknown[]) =>
      raids.push(args)
    );

    expect(seaRaid(game, world, 3, 400)).true;
    expect(raids.length).equal(1);

    const [[player, ship, tile]] = raids as [any, any, Tile][];

    expect(ship).instanceOf(Trireme);
    expect(ship.tile()).equal(tile);
    expect(ship.cargo().length).equal(7);
    expect(ship.cargo()[0]).instanceOf(Diplomat);
    expect(game.units.getByPlayer(player).length).equal(8);
  });
});
