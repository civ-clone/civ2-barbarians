import {
  Desert,
  Grassland,
  Hills,
  Mountains,
  Ocean,
} from '@civ-clone/civ2-world/Terrains';
import Added from '@civ-clone/core-player/Rules/Added';
import AIClient from '@civ-clone/core-ai-client/AIClient';
import City from '@civ-clone/core-city/City';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import CityGrowth from '@civ-clone/core-city-growth/CityGrowth';
import Client from '@civ-clone/core-client/Client';
import Created from '@civ-clone/core-unit/Rules/Created';
import Effect from '@civ-clone/core-rule/Effect';
import { Game } from '@civ-clone/core-game';
import Generator from '@civ-clone/core-world-generator/Generator';
import Gold from '@civ-clone/base-city-yield-gold/Gold';
import Player from '@civ-clone/core-player/Player';
import PlayerGovernment from '@civ-clone/core-government/PlayerGovernment';
import PlayerResearch from '@civ-clone/core-science/PlayerResearch';
import PlayerTreasury from '@civ-clone/core-treasury/PlayerTreasury';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
import Unit from '@civ-clone/core-unit/Unit';
import World from '@civ-clone/core-world/World';
import register from '../../registerRules';
import unitYields from '@civ-clone/civ2-unit/Rules/Unit/yield';

// A map drawn in rows: `.` Ocean, `#` Grassland, `^` Hills, `M` Mountains, `d` Desert.
const terrains: { [key: string]: typeof Terrain } = {
  '.': Ocean,
  '#': Grassland,
  '^': Hills,
  M: Mountains,
  d: Desert,
};

class MapGenerator extends Generator {
  #rows: string[];

  constructor(rows: string[], topologyId: string) {
    super(rows.length, rows[0].length, { topologyId });

    this.#rows = rows;
  }

  async generate(): Promise<Terrain[]> {
    return this.#rows.flatMap((row: string): Terrain[] =>
      row.split('').map((key: string): Terrain => new terrains[key]())
    );
  }
}

/** A seeded generator (mulberry32), for games that draw. */
export const seeded = (seed: number) => (): number => {
  seed = (seed + 0x6d2b79f5) | 0;

  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);

  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;

  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** A generator that gives C's `rand()` the values `values`, in order, as fractions of 32768. */
export const scripted = (...values: number[]) => {
  const draws: number[] = [];

  return {
    draws,
    rng: (): number => {
      if (draws.length >= values.length) {
        throw new Error('Drew more numbers than were scripted.');
      }

      draws.push(values[draws.length]);

      return (values[draws.length - 1] + 0.5) / 32768;
    },
  };
};

export class Person extends Client {}

export class Computer extends AIClient {}

/**
 * A game with civ2-barbarians registered on a map drawn in `rows` (staggered isometric, as Civ2 plays): its players get
 *  a government, a treasury and research when they join, its units are registered when they're made, and have
 *  civ2-unit's strengths and holds.
 */
export const setUp = async (
  rows: string[],
  rng: () => number = seeded(1),
  topologyId: string = 'staggered-iso'
) => {
  const game = new Game({ rng } as any),
    world = new World(
      new MapGenerator(rows, topologyId),
      game.rules,
      game.landMasses
    );

  await world.build();

  game.rules.register(
    new Added(
      new Effect((player: Player): void => {
        game.playerGovernments.register(
          new PlayerGovernment(player, undefined, game.rules)
        );
        game.playerTreasuries.register(
          new PlayerTreasury(player, Gold, game.cityBuilds, game.rules)
        );
        game.playerResearch.register(
          new PlayerResearch(player, game.advances, game.rules)
        );
      })
    ),
    new Created(
      new Effect((unit: Unit): void => {
        game.units.register(unit);
      })
    )
  );

  // Civilization II's units' strengths and holds.
  game.rules.register(
    ...unitYields(game.unitImprovements, game.rules, game.transports)
  );

  register(game);

  const player = (human: boolean = true): Player => {
      const created = new Player(game.rules);

      game.players.register(created);
      game.clients.register(
        human ? new Person(created) : new Computer(created)
      );

      return created;
    },
    city = (owner: Player, tile: Tile, size: number = 1): City => {
      const created = new City(owner, tile, 'City', game.rules);

      game.cities.register(created);
      game.cityBuilds.register(
        new CityBuild(
          created,
          game.availableCityBuildItems,
          game.rules
        ) as CityBuild
      );

      const growth = new CityGrowth(created, game.rules);

      game.cityGrowth.register(growth);

      for (let grown = 1; grown < size; grown++) {
        growth.grow();
      }

      return created;
    },
    gold = (owner: Player, amount: number): void => {
      game.playerTreasuries.getByPlayerAndType(owner, Gold).add(amount);
    };

  return { city, game, gold, player, world };
};
