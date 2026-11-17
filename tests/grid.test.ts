import { DIRECTIONS, civ2Coordinates, step, tileAt } from '../lib/grid';
import { expect } from 'chai';
import { setUp } from './lib/setUp';

const ocean = (width: number, height: number): string[] =>
  new Array(height).fill('.'.repeat(width));

describe('grid', (): void => {
  it("maps squares to the original's half columns, and back", async (): Promise<void> => {
    const { world } = await setUp(ocean(6, 6));

    expect(civ2Coordinates(world.get(2, 3))).eql([5, 3]);
    expect(civ2Coordinates(world.get(2, 2))).eql([4, 2]);
    expect(tileAt(world, 5, 3)).equal(world.get(2, 3));
    expect(tileAt(world, 4, 3)).null;
    // x wraps; y doesn't.
    expect(tileAt(world, -1, 1)).equal(world.get(5, 1));
    expect(tileAt(world, 12, 0)).equal(world.get(0, 0));
    expect(tileAt(world, 0, -2)).null;
    expect(tileAt(world, 0, 6)).null;
  });

  it("steps in the original's eight directions, each the topology's neighbour", async (): Promise<void> => {
    const { world } = await setUp(ocean(6, 8)),
      from = world.get(2, 3),
      neighbours = from.getNeighbours();

    expect(DIRECTIONS.length).equal(8);

    DIRECTIONS.forEach((_, direction: number): void => {
      const to = step(from, direction)!;

      expect(neighbours, `direction ${direction}`).include(to);
    });

    // North is two rows up, the same column.
    expect(step(from, 7)).equal(world.get(2, 1));
    // East is the next column.
    expect(step(from, 1)).equal(world.get(3, 3));
    // Off the top.
    expect(step(world.get(0, 0), 0)).null;
  });
});
