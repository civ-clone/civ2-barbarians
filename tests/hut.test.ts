import {
  Cavalry,
  Fanatic,
  Horseman,
  Knight,
  Musketman,
  Partisan,
  Rifleman,
  Swordman,
} from '@civ-clone/civ2-unit/Units';
import { Grassland, Hills, Mountains } from '@civ-clone/civ2-world/Terrains';
import {
  HutKnowledge,
  hutBarbarians,
  hutSafe,
  hutSquares,
  hutUnit,
  rough,
} from '../lib/hut';
import { scripted, setUp } from './lib/setUp';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import { expect } from 'chai';
import isBarbarian from '@civ-clone/base-civilization-barbarian/isBarbarian';
import { step } from '../lib/grid';

const none: HutKnowledge = {
  metallurgy: false,
  armorAdvance: false,
  guerrillaWarfare: false,
};

const at = (tile: Tile | null): number[] | null =>
  tile === null ? null : [tile.x(), tile.y()];

const land = (): string[] => new Array(24).fill('#'.repeat(30));

// OpenCiv2 `src/game/retvals.cpp` `hut_barbarians` 1663-1750 (richardpenman/civ2@e39fe7b).
describe('huts', (): void => {
  it('releases the Legion on rough ground and Horsemen elsewhere, then their successors', (): void => {
    expect(hutUnit(none, true)).equal(Swordman);
    expect(hutUnit(none, false)).equal(Horseman);
    expect(hutUnit({ ...none, metallurgy: true }, true)).equal(Musketman);
    expect(hutUnit({ ...none, metallurgy: true }, false)).equal(Knight);
    expect(hutUnit({ ...none, armorAdvance: true }, true)).equal(Rifleman);
    expect(hutUnit({ ...none, armorAdvance: true }, false)).equal(Cavalry);
    expect(
      hutUnit(
        { metallurgy: true, armorAdvance: true, guerrillaWarfare: true },
        true
      )
    ).equal(Fanatic);
    expect(hutUnit({ ...none, guerrillaWarfare: true }, false)).equal(Partisan);
  });

  it('calls ground of a movement cost of 3 or more rough', (): void => {
    expect(rough(new Mountains())).true;
    expect(rough(new Hills())).false;
    expect(rough(new Grassland())).false;
  });

  it("walks the original's directions from the turn's, stepping by 4 − the player's cities", async (): Promise<void> => {
    const { world } = await setUp(land()),
      hut = world.get(10, 10),
      squares = (turn: number, cities: number, single: boolean = false) =>
        hutSquares(hut, turn, cities, single, (): boolean => true).map(at);

    // Turn 100: from direction 4. One city: every third, 4, 7, 2.
    expect(squares(100, 1)).eql([4, 7, 2].map((d) => at(step(hut, d))));
    // Two cities: every second, 4, 6, 0, 2.
    expect(squares(100, 2)).eql([4, 6, 0, 2].map((d) => at(step(hut, d))));
    // No city: every fourth (4 − 0, at most 4): 4, 0.
    expect(squares(100, 0)).eql([4, 0].map((d) => at(step(hut, d))));
    // Three or more: all eight.
    expect(squares(100, 5).length).equal(8);
    // One only.
    expect(squares(100, 5, true)).eql([at(step(hut, 4))]);
  });

  it('is safe below a = 3, early on, for a player with a city on the land mass within 24', async (): Promise<void> => {
    const { city, game, player, world } = await setUp(land()),
      owner = player(),
      hut = world.get(10, 10),
      never = (): number => {
        throw new Error('drew');
      };

    city(owner, world.get(4, 10));

    expect(hutSafe(game, hut, owner, 2, 29, never)).true;
    expect(hutSafe(game, hut, owner, 3, 29, never)).false;
    // From turn 30, on an even draw only.
    expect(hutSafe(game, hut, owner, 2, 30, () => 0)).true;
    expect(hutSafe(game, hut, owner, 2, 30, () => 1)).false;
    expect(hutSafe(game, hut, owner, 2, 50, never)).false;
    // Another player's city doesn't count.
    expect(hutSafe(game, hut, player(), 2, 29, never)).false;
  });

  it('releases one barbarian up to turn 49, and a few later, beside the hut and never on a city', async (): Promise<void> => {
    const { draws, rng } = scripted(1),
      { city, game, player, world } = await setUp(land(), rng),
      owner = player(),
      explorer = new Unit(null, owner, world.get(10, 10), game.rules);

    city(owner, world.get(20, 10));

    // Turn 40: an odd draw, so not safe; up to turn 49, one only, with no draw for it.
    const early = hutBarbarians(game, world.get(10, 10), explorer, 2, 40);

    expect(draws.length).equal(1);
    expect(early.length).equal(1);
    expect(isBarbarian(early[0].player())).true;
    expect(at(early[0].tile())).eql(at(step(world.get(10, 10), 40 & 7)));

    // Turn 100, one city: three, at a = 0 as well.
    const later = hutBarbarians(game, world.get(14, 14), explorer, 0, 100);

    expect(later.map((unit: Unit) => unit.constructor)).eql([
      Horseman,
      Horseman,
      Horseman,
    ]);
  });
});
