import { Diplomat, Swordman, Trireme } from '@civ-clone/civ2-unit/Units';
import {
  SHIP_AT_SEA,
  SHIP_TURNS,
  countTurnAtSea,
  shipGivesUp,
} from '../lib/ship';
import NavalTransport from '@civ-clone/base-unit-type-naval-transport/NavalTransport';
import Player from '@civ-clone/core-player/Player';
import { SHIP_GIVES_UP_RULE } from '../RuleIds';
import TurnStart from '@civ-clone/core-player/Rules/TurnStart';
import Unit from '@civ-clone/core-unit/Unit';
import barbarianPlayer from '../lib/barbarianPlayer';
import { expect } from 'chai';
import { setUp } from './lib/setUp';

// OpenCiv2 `ai.cpp` `ai_barbarian_unit_move` 2192-2203 (richardpenman/civ2@e39fe7b).
describe('barbarian ships', (): void => {
  const sea = async () => {
    const { game, world } = await setUp(new Array(12).fill('.'.repeat(20))),
      barbarians: Player = barbarianPlayer(game, world),
      // Each ship on a square of its own.
      ships = { placed: 0 },
      ship = (...aboard: (typeof Unit)[]) => {
        const transport = new Trireme(
          null,
          barbarians,
          world.get(2 + 2 * ships.placed++, 5),
          game.rules
        ) as unknown as NavalTransport;

        aboard.forEach(
          (UnitType) =>
            expect(
              transport.stow(
                new UnitType(null, barbarians, transport.tile(), game.rules),
                transport.tile()
              )
            ).true
        );

        return transport;
      };

    return { barbarians, game, ship };
  };

  it('give up with nothing but leaders aboard: fewer than 2 on the square, the ship counted, leaders not', async (): Promise<void> => {
    const one = await sea(),
      two = await sea(),
      three = await sea();

    expect(shipGivesUp(one.game, one.ship(Swordman, Diplomat) as any, 1)).false;
    expect(shipGivesUp(two.game, two.ship(Diplomat) as any, 1)).true;
    expect(shipGivesUp(three.game, three.ship() as any, 1)).true;
  });

  it(`give up after ${SHIP_TURNS} of their turns at sea, counting from the first, and keep the count in a saved record`, async (): Promise<void> => {
    const { game, ship } = await sea(),
      raider = ship(Swordman, Swordman, Diplomat);

    expect(countTurnAtSea(game, raider, 100)).equal(1);
    expect(game.pendingEffects.getByHandler(SHIP_AT_SEA)).length(1);
    expect(shipGivesUp(game, raider as any, 129)).false;
    expect(shipGivesUp(game, raider as any, 130)).true;
  });

  it('are taken off the map with what they carry as the barbarians’ turn starts', async (): Promise<void> => {
    const { barbarians, game, ship } = await sea(),
      full = ship(Swordman, Swordman),
      empty = ship(Diplomat),
      [leader] = (empty as any).cargo() as Unit[];

    game.rules
      .get(TurnStart)
      .filter((rule) => rule.id() === SHIP_GIVES_UP_RULE)
      .forEach((rule) => rule.process(barbarians));

    expect(empty.destroyed()).true;
    expect(leader.destroyed()).true;
    expect(full.destroyed()).false;
    expect(
      game.pendingEffects
        .getByHandler(SHIP_AT_SEA)
        .map((record) => record.target())
    ).eql([full]);
  });
});
