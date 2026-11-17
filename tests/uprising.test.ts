import {
  Archer,
  Artillery,
  Cannon,
  Cavalry,
  Chariot,
  Diplomat,
  Elephant,
  Fanatic,
  Horseman,
  Musketman,
  Partisan,
  Rifleman,
} from '@civ-clone/civ2-unit/Units';
import {
  CLASSIC_UPRISING,
  UprisingKnowledge,
  landUprising,
  uprisingCity,
  uprisingHorde,
  uprisingSite,
  uprisingTypes,
  uprisingUnits,
} from '../lib/uprising';
import City from '@civ-clone/core-city/City';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import Veteran from '@civ-clone/base-unit-improvement-veteran/UnitImprovements/Veteran';
import { distance } from '../lib/grid';
import { expect } from 'chai';
import isBarbarian from '@civ-clone/base-civilization-barbarian/isBarbarian';
import { scripted, setUp } from './lib/setUp';

const none: UprisingKnowledge = {
  gunpowder: false,
  industrialization: false,
  armorAdvance: false,
  guerrillaWarfare: false,
  belowRepublic: true,
  captured: false,
};

// A generator of C's `rand()` values, in order.
const rolls = (...values: number[]) => {
  const drawn: number[] = [];

  return {
    drawn,
    rand: (): number => {
      if (drawn.length >= values.length) {
        throw new Error('Drew more numbers than were scripted.');
      }

      drawn.push(values[drawn.length]);

      return values[drawn.length - 1];
    },
  };
};

// OpenCiv2 `game.cpp` `barbarians_city_uprising` 1274-1430 (richardpenman/civ2@e39fe7b).
describe('uprisings', (): void => {
  it('raises rand % size besides the leader, at least 2 and at most 99, drawing nothing at size 1', (): void => {
    const one = rolls();

    expect(uprisingHorde(1, 2, 3, 200, one.rand)).equal(2);
    expect(one.drawn.length).equal(0);
    expect(uprisingHorde(8, 2, 3, 200, rolls(7).rand)).equal(7);
    expect(uprisingHorde(8, 2, 3, 200, rolls(9).rand)).equal(2);
    expect(uprisingHorde(200, 2, 3, 200, rolls(150).rand)).equal(99);
  });

  it('adds size ÷ 2 + rand % (size ÷ 2) one time in 10 − level at a = 3 after turn 149', (): void => {
    // At turn 149, no surge is drawn.
    const before = rolls(5);

    expect(uprisingHorde(8, 3, 3, 149, before.rand)).equal(5);
    expect(before.drawn.length).equal(1);

    // King: rand % 7 == 0 surges: 5 + 4 + 3 % 4.
    expect(uprisingHorde(8, 3, 3, 150, rolls(5, 7, 3).rand)).equal(12);
    // No surge on rand % 7 != 0.
    expect(uprisingHorde(8, 3, 3, 150, rolls(5, 1).rand)).equal(5);
    // Size 3: size ÷ 2 is 1, so no draw for the bonus: 2 % 3 + 1.
    const small = rolls(2, 0);

    expect(uprisingHorde(3, 3, 0, 150, small.rand)).equal(3);
    expect(small.drawn.length).equal(2);
  });

  it('alternates its two types in fours below the leader, counting down from the horde', (): void => {
    const units = uprisingUnits(9, Chariot, Horseman);

    expect(units.length).equal(10);
    expect(units[0]).equal(Diplomat);
    // remaining 8..0: the 4 bit is set for 7, 6, 5, 4.
    expect(units.slice(1)).eql([
      Horseman,
      Chariot,
      Chariot,
      Chariot,
      Chariot,
      Horseman,
      Horseman,
      Horseman,
      Horseman,
    ]);
    expect(uprisingUnits(2, Chariot, Horseman)).eql([
      Diplomat,
      Horseman,
      Horseman,
    ]);
  });

  it('chooses its types by what anyone knows', (): void => {
    expect(uprisingTypes(none, false)).eql([Chariot, Horseman]);
    expect(uprisingTypes(none, true)).eql([Horseman, Chariot]);
    expect(uprisingTypes({ ...none, gunpowder: true }, true)).eql([
      Archer,
      Elephant,
    ]);

    const industrial = { ...none, gunpowder: true, industrialization: true };

    expect(uprisingTypes(industrial, false)).eql([Cannon, Musketman]);
    expect(uprisingTypes({ ...industrial, armorAdvance: true }, false)).eql([
      Artillery,
      Rifleman,
    ]);

    const guerrilla = {
      ...industrial,
      armorAdvance: true,
      guerrillaWarfare: true,
    };

    expect(uprisingTypes(guerrilla, false)).eql([Cavalry, Partisan]);
    expect(uprisingTypes({ ...guerrilla, belowRepublic: false }, false)).eql([
      Artillery,
      Fanatic,
    ]);
    expect(
      uprisingTypes(
        { ...guerrilla, belowRepublic: false, captured: true },
        false
      )
    ).eql([Cavalry, Partisan]);
    // Guerrilla Warfare without Armor's advance changes nothing.
    expect(uprisingTypes({ ...industrial, guerrillaWarfare: true }, false)).eql(
      [Cannon, Musketman]
    );
  });

  it("draws a city only when there is more than one, and only a person's rises", async (): Promise<void> => {
    const { city, game, player, world } = await setUp(
        new Array(12).fill('############')
      ),
      person = player(true),
      computer = player(false),
      first = city(person, world.get(1, 2)),
      second = city(computer, world.get(8, 8));

    expect(uprisingCity(game, rolls(0).rand) === first).true;
    expect(uprisingCity(game, rolls(1).rand)).null;

    second.destroy();

    const one = rolls();

    expect(uprisingCity(game, one.rand) === first).true;
    expect(one.drawn.length).equal(0);
  });
});

const at = (tile: Tile | null | undefined): number[] | null =>
  tile ? [tile.x(), tile.y()] : null;

const land = (): string[] => new Array(24).fill('#'.repeat(30));

describe('the uprising site', (): void => {
  it('is a square at least 5 from every city, and gives up after a × 50 tries, the last never looked at', async (): Promise<void> => {
    const { city, game, player, world } = await setUp(land()),
      home = city(player(), world.get(4, 10));

    // Draws of 6 and 6 put the square 3 squares east of the city, 4 away: too near, every time.
    let draws = 0;

    expect(
      uprisingSite(game, home, 1, (): number => {
        draws++;

        return 6;
      })
    ).null;
    // 50 tries of 2 draws.
    expect(draws).equal(100);

    // A draw of 9 puts it 12 half columns (6 squares) east: 9 away.
    const found = uprisingSite(game, home, 1, rolls(9, 6).rand)!;

    expect(at(found.tile)).eql([10, 10]);
    expect(found.city === home).true;
    expect(distance(found.tile, home.tile())).equal(9);
  });

  it("is lopsided east, as the original's x offset is", (): void => {
    const offsets = new Array(13)
      .fill(0)
      .map((_, roll: number): number => CLASSIC_UPRISING.xOffset(roll));

    expect(Math.min(...offsets)).equal(-6);
    expect(Math.max(...offsets)).equal(18);
  });

  it('re-centres each try on the city nearest the last, and is sized by that city', async (): Promise<void> => {
    const { city, game, player, world } = await setUp(land()),
      home = city(player(), world.get(2, 10)),
      other = city(player(false), world.get(9, 10), 6);

    // First: 9 squares east of home, (11, 10), 3 from the other city: too near, and the next try is drawn round it.
    //  Second: 6 squares east of the other city, (15, 10).
    const found = uprisingSite(game, home, 1, rolls(12, 6, 9, 6).rand)!;

    expect(found.city === other).true;
    expect(at(found.tile)).eql([15, 10]);
  });

  it('stays with the city drawn when told to', async (): Promise<void> => {
    const { city, game, player, world } = await setUp(land()),
      home = city(player(), world.get(2, 10));

    city(player(false), world.get(9, 10), 6);

    // (11, 10) is too near the other city; drawn round home again, (8, 10) is too; then (11, 4), 5 from it.
    const found = uprisingSite(game, home, 1, rolls(12, 6, 9, 6, 12, 0).rand, {
      ...CLASSIC_UPRISING,
      byRolledCity: true,
    })!;

    expect(at(found.tile)).eql([11, 4]);
    expect(found.city === home).true;
  });

  it("wants land, with no civilization's unit next to it", async (): Promise<void> => {
    const rows = land();

    rows[10] = '######.' + '#'.repeat(23);

    const { city, game, player, world } = await setUp(rows),
      home = city(player(), world.get(0, 10));

    // (6, 10) is sea; (7, 10) is land.
    expect(at(uprisingSite(game, home, 1, rolls(9, 6, 10, 6).rand)?.tile)).eql([
      7, 10,
    ]);
  });
});

describe('an uprising in a game', (): void => {
  it("raises the leader and its horde near a rich person's city", async (): Promise<void> => {
    // Below 100, it rises (the share is 4 × 1000 ÷ 5 = 800); the square, 6 squares east; 3 % 4 = 3 besides the
    //  leader; 1 % 3: no swap, so Chariots and Horsemen.
    const { draws, rng } = scripted(50, 9, 6, 3, 1),
      { city, game, gold, player, world } = await setUp(land(), rng),
      person = player(true),
      home = city(person, world.get(4, 10), 4),
      raised: unknown[][] = [];

    gold(person, 1000);
    game.engine.on('barbarians:uprising', (...args: unknown[]) =>
      raised.push(args)
    );

    landUprising(game, home, 2, 3, 100, CLASSIC_UPRISING);

    expect(draws.length).equal(5);
    expect(raised.length).equal(1);

    const [[barbarians, sizedBy, tile]] = raised as [any, City, Tile][],
      units = game.units.getByTile(tile);

    expect(isBarbarian(barbarians)).true;
    expect(sizedBy === home).true;
    expect(at(tile)).eql([10, 10]);
    expect(units.map((unit: Unit) => unit.constructor)).eql([
      Diplomat,
      Horseman,
      Horseman,
      Horseman,
    ]);
    expect(
      units.some((unit: Unit): boolean =>
        game.unitImprovements
          .getByUnit(unit)
          .some((improvement): boolean => improvement instanceof Veteran)
      )
    ).false;
  });

  it("rises only on a roll below the city's gold share", async (): Promise<void> => {
    // The share is 1 × 99 ÷ 2 = 49: a roll of 49 doesn't rise, and nothing more is drawn.
    const { draws, rng } = scripted(49),
      { city, game, gold, player, world } = await setUp(land(), rng),
      person = player(true),
      home = city(person, world.get(4, 10), 1);

    gold(person, 99);

    landUprising(game, home, 2, 3, 100);

    expect(draws.length).equal(1);
    expect(game.units.entries().length).equal(0);
  });
});
