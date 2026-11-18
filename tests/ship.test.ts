import { Diplomat, Swordman, Trireme } from '@civ-clone/civ2-unit/Units';
import {
  SHIP_AT_SEA,
  SHIP_STEPS,
  countStep,
  countTurn,
  shipCount,
  shipGivesUp,
} from '../lib/ship';
import NavalTransport from '@civ-clone/base-unit-type-naval-transport/NavalTransport';
import Player from '@civ-clone/core-player/Player';
import { SHIP_GIVES_UP_RULE } from '../RuleIds';
import Moved from '@civ-clone/core-unit/Rules/Moved';
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

    expect(shipGivesUp(one.game, one.ship(Swordman, Diplomat) as any)).false;
    expect(shipGivesUp(two.game, two.ship(Diplomat) as any)).true;
    expect(shipGivesUp(three.game, three.ship() as any)).true;
  });

  it(`give up once their count passes ${SHIP_STEPS}: one for each step, and one for a turn with none`, async (): Promise<void> => {
    const { game, ship } = await sea(),
      raider = ship(Swordman, Swordman, Diplomat);

    // Seen first as a turn starts: 0.
    expect(countTurn(game, raider)).equal(0);
    expect(game.pendingEffects.getByHandler(SHIP_AT_SEA)).length(1);

    // Three steps in its first turn: 3, and the next turn adds nothing for them.
    countStep(game, raider);
    countStep(game, raider);
    countStep(game, raider);
    expect(countTurn(game, raider)).equal(3);

    // A turn with no step: 1 more.
    expect(countTurn(game, raider)).equal(4);

    for (let step = 4; step < SHIP_STEPS; step++) {
      countStep(game, raider);
    }

    expect(shipCount(game, raider)).equal(SHIP_STEPS);
    expect(shipGivesUp(game, raider as any)).false;

    countStep(game, raider);
    expect(shipGivesUp(game, raider as any)).true;
  });

  it("count a barbarian ship's steps through its moves (`Moved`), not another player's", async (): Promise<void> => {
    const { game, ship } = await sea(),
      raider = ship(Swordman, Swordman);

    game.rules.process(Moved, raider, null);
    game.rules.process(Moved, raider, null);

    expect(shipCount(game, raider)).equal(2);
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
