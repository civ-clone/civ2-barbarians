import {
  Cannon,
  Diplomat,
  Knight,
  Musketman,
  Rifleman,
  Settlers,
  Spearman,
  Swordman,
  Trireme,
} from '@civ-clone/civ2-unit/Units';
import {
  Conscription,
  Explosives,
  MobileWarfare,
} from '@civ-clone/civ2-science/Advances';
import { Game } from '@civ-clone/core-game';
import Tile from '@civ-clone/core-world/Tile';
import TurnStart from '@civ-clone/core-player/Rules/TurnStart';
import { seaRaid, uprisingSkipped } from '../lib/seaRaid';
import { barbarianBuild, firstUnit, upgradeOf } from '../lib/cityBuild';
import {
  Chieftain,
  Emperor,
  King,
} from '@civ-clone/civ2-difficulty/Difficulties';
import { scripted, setUp } from './lib/setUp';
import { ACTIVITY } from '../RuleSets';
import Action from '@civ-clone/core-unit/Action';
import Defeated from '@civ-clone/core-unit/Rules/Defeated';
import Gold from '@civ-clone/base-city-yield-gold/Gold';
import LeadsGroup from '@civ-clone/base-barbarians/Rules/LeadsGroup';
import Player from '@civ-clone/core-player/Player';
import Start from '@civ-clone/core-turn-based-game/Rules/Start';
import Turn from '@civ-clone/core-turn-based-game/Turn';
import Unit from '@civ-clone/core-unit/Unit';
import barbarianPlayer from '../lib/barbarianPlayer';
import { expect } from 'chai';
import isBarbarian from '@civ-clone/base-civilization-barbarian/isBarbarian';
import leadsGroup from '@civ-clone/base-barbarians/lib/leadsGroup';
import leavesMap from '@civ-clone/base-barbarians/lib/leavesMap';
import ransom from '../lib/ransom';
import spawning from '@civ-clone/base-barbarians/lib/spawning';

// The attack `unit` made, as `Attack` passes it to `Defeated`.
const attackedBy = (unit: Unit): Action =>
  ({ unit: (): Unit => unit } as unknown as Action);

const ocean = (): string[] => new Array(20).fill('.'.repeat(20));

describe('ransom', (): void => {
  it('is the activity level × 50', (): void => {
    expect([0, 1, 2, 3].map(ransom)).eql([0, 50, 100, 150]);
  });

  it('is paid to the attacker that beats a leader defending, and only then', async (): Promise<void> => {
    const { game, player, world } = await setUp(ocean()),
      barbarians = barbarianPlayer(game, world),
      victor: Player = player(),
      leader = new Diplomat(null, barbarians, world.get(5, 5), game.rules),
      attacker = new Swordman(null, victor, world.get(6, 5), game.rules),
      treasury = game.playerTreasuries.getByPlayerAndType(victor, Gold);

    // A leader who attacks and loses pays nothing.
    game.rules.process(Defeated, leader, attacker, attackedBy(leader));
    expect(treasury.value()).equal(0);

    // An escort pays nothing.
    game.rules.process(
      Defeated,
      new Swordman(null, barbarians, world.get(5, 5), game.rules),
      attacker,
      attackedBy(attacker)
    );
    expect(treasury.value()).equal(0);

    game.ruleSets.choose(ACTIVITY, `${ACTIVITY}/3`);
    game.rules.process(Defeated, leader, attacker, attackedBy(attacker));
    expect(treasury.value()).equal(150);
  });
});

describe('what the client asks', (): void => {
  it('takes the Diplomat as the leader, and the 2 rows at the top and bottom as off the map', async (): Promise<void> => {
    const { game, world } = await setUp(ocean()),
      barbarians = barbarianPlayer(game, world);

    expect(game.rules.get(LeadsGroup).length).equal(1);
    expect(
      leadsGroup(
        game.rules,
        new Diplomat(null, barbarians, world.get(1, 5), game.rules),
        () => false
      )
    ).true;
    expect(
      leadsGroup(
        game.rules,
        new Swordman(null, barbarians, world.get(1, 5), game.rules),
        () => true
      )
    ).false;

    const leaves = (y: number): boolean =>
      leavesMap(game.rules, world.get(3, y), () => false);

    expect([0, 1, 2, 17, 18, 19].map(leaves)).eql([
      true,
      true,
      false,
      false,
      true,
      true,
    ]);
  });
});

describe('barbarian cities', (): void => {
  it('start the Legion, or Knights once anyone knows Explosives', async (): Promise<void> => {
    const { game, player } = await setUp(ocean()),
      someone = player();

    expect(firstUnit(game)).equal(Swordman);

    game.playerResearch.getByPlayer(someone).addAdvance(Explosives);

    expect(firstUnit(game)).equal(Knight);
  });

  it('upgrade a unit once two know its obsoleting advance and a person does, or at Emperor; never at Chieftain', async (): Promise<void> => {
    const { game, player } = await setUp(ocean()),
      person = player(true),
      computer = player(false);

    game.difficulty.set(King);

    // Nobody knows Feudalism, which replaces the Phalanx with Pikemen.
    expect(upgradeOf(game, Spearman)).equal(Spearman);

    // Musketeers become obsolete with Conscription, which gives Riflemen (same role).
    game.playerResearch.getByPlayer(computer).addAdvance(Conscription);

    expect(upgradeOf(game, Musketman)).equal(Musketman);

    game.playerResearch.getByPlayer(person).addAdvance(Conscription);

    expect(upgradeOf(game, Musketman)).equal(Rifleman);

    game.difficulty.set(Chieftain);

    expect(upgradeOf(game, Musketman)).equal(Musketman);

    // At Emperor, two computer players are enough.
    const other = await setUp(ocean()),
      first = other.player(false),
      second = other.player(false);

    other.game.difficulty.set(Emperor);
    other.game.playerResearch.getByPlayer(first).addAdvance(Conscription);
    other.game.playerResearch.getByPlayer(second).addAdvance(Conscription);

    expect(upgradeOf(other.game, Musketman)).equal(Rifleman);
    // A unit nothing replaces stays.
    expect(upgradeOf(other.game, Cannon)).equal(Cannon);
  });

  it('build only the one unit, and treat Settlers as no unit', async (): Promise<void> => {
    const { city, game, world } = await setUp([
        ...new Array(10).fill('#'.repeat(20)),
        ...new Array(10).fill('.'.repeat(20)),
      ]),
      barbarians = barbarianPlayer(game, world),
      held = city(barbarians, world.get(5, 5)),
      build = game.cityBuilds.getByCity(held);

    expect(barbarianBuild(game, held)).equal(Swordman);

    // What it last completed, as the original's `building` keeps it.
    build.setCleared('completed', Settlers);

    expect(barbarianBuild(game, held)).equal(Swordman);

    build.setCleared('completed', Trireme);

    expect(barbarianBuild(game, held)).equal(Trireme);

    build.setCleared('completed', Musketman);

    expect(barbarianBuild(game, held)).equal(Musketman);
    game.availableCityBuildItems.register(Musketman, Swordman, Spearman);

    expect(build.available().map((item) => item.item())).eql([Musketman]);
  });
});

describe('the turn', (): void => {
  it('gates spawning on the onset, and raids on the 8th turns from it, at King and the second level', async (): Promise<void> => {
    const { city, game, player, world } = await setUp([
        '#'.repeat(20),
        ...ocean().slice(1),
      ]),
      turn = new Turn(),
      raids: number[] = [];

    // A city gives the rules the world.
    city(player(false), world.get(3, 0));
    game.difficulty.set(King);
    game.engine.on('barbarians:raiders-at-sea', () => raids.push(turn.value()));

    while (turn.value() < 90) {
      turn.increment();
      game.rules.process(Start, turn);

      if (turn.value() === 66) {
        expect(spawning(game.rules, turn)).false;
      }

      if (turn.value() === 67) {
        expect(spawning(game.rules, turn)).true;
      }
    }

    // T = 71, 79 and 87: (T + 1) & 7 = 0, from T = 66.
    expect(raids).eql([72, 80, 88]);
    expect(
      game.units
        .entries()
        .every((unit: Unit): boolean => isBarbarian(unit.player()))
    ).true;
  });

  it('never spawns at the lowest level', async (): Promise<void> => {
    const { game } = await setUp(ocean(), scripted().rng),
      turn = new Turn();

    game.ruleSets.choose(ACTIVITY, `${ACTIVITY}/0`);

    while (turn.value() < 300) {
      turn.increment();
      game.rules.process(Start, turn);
    }

    expect(game.units.entries().length).equal(0);
  });
});

describe('the turn, once raids are under way', (): void => {
  // King, the second level: raids as turns 72, 80 and 88 start.
  const play = (game: Game, until: number): Turn => {
    const turn = new Turn();

    while (turn.value() < until) {
      turn.increment();
      game.rules.process(Start, turn);
    }

    return turn;
  };

  it("stops raiding once anyone knows Armor's advance", async (): Promise<void> => {
    const { city, game, player, world } = await setUp([
        '#'.repeat(20),
        ...ocean().slice(1),
      ]),
      raids: number[] = [],
      someone = player(false);

    city(someone, world.get(3, 0));
    game.difficulty.set(King);
    game.engine.on('barbarians:raiders-at-sea', () => raids.push(1));
    game.playerResearch.getByPlayer(someone).addAdvance(MobileWarfare);

    play(game, 90);

    expect(raids.length).equal(0);
  });

  it("skips the turn's uprising when the raid finds no square", async (): Promise<void> => {
    // No sea at all: the raid on turn 72 finds no square, so no uprising is tried; on turn 73 one is.
    const { city, game, gold, player, world } = await setUp(
        new Array(24).fill('#'.repeat(30))
      ),
      person = player(true),
      uprisings: number[] = [];

    city(person, world.get(4, 10), 8);
    gold(person, 100000);
    game.difficulty.set(King);

    const turn = play(game, 71);

    game.engine.on('barbarians:uprising', () => uprisings.push(turn.value()));

    turn.increment();
    game.rules.process(Start, turn);

    expect(turn.value()).equal(72);
    expect(uprisingSkipped(game, 72)).true;
    expect(uprisings).eql([]);

    turn.increment();
    game.rules.process(Start, turn);

    expect(uprisingSkipped(game, 73)).false;
    expect(uprisings).eql([73]);
  });
});

describe('leaders leaving, as the barbarians move', (): void => {
  it("takes off a lone leader far from cities, only on the barbarians' turn", async (): Promise<void> => {
    const { city, game, player, world } = await setUp(
        new Array(12).fill('#'.repeat(30))
      ),
      someone = player(),
      barbarians = barbarianPlayer(game, world),
      leader = new Diplomat(null, barbarians, world.get(20, 6), game.rules);

    city(someone, world.get(2, 6));
    game.turn.increment();

    game.rules.process(TurnStart, someone);

    expect(leader.destroyed()).false;

    game.rules.process(TurnStart, barbarians);

    expect(leader.destroyed()).true;
  });

  it('leaves a leader aboard a ship near a city, who can still be ransomed', async (): Promise<void> => {
    const { city, game, player, world } = await setUp([
        ...new Array(6).fill('#'.repeat(20)),
        ...new Array(14).fill('.'.repeat(20)),
      ]),
      someone = player(),
      raids: [Player, Unit, Tile][] = [];

    city(someone, world.get(5, 5));
    game.engine.on('barbarians:raiders-at-sea', (...args: any[]) =>
      raids.push(args as [Player, Unit, Tile])
    );

    // The raid's square: the first draws give (5, 7), 1 from the city.
    (game as any).rng = scripted(
      ...[10, 4], // x 10 (half columns), y 4 + 3 = 7: (5, 7).
      0 // the ship a veteran.
    ).rng;

    expect(seaRaid(game, world, 2, 100)).true;

    const [[barbarians, ship, tile]] = raids,
      [leader] = (ship as any).cargo() as Unit[];

    expect([tile.x(), tile.y()]).eql([5, 7]);
    expect(leader).instanceOf(Diplomat);

    game.rules.process(TurnStart, barbarians);

    expect(leader.destroyed()).false;

    const attacker = new Swordman(null, someone, world.get(5, 5), game.rules);

    game.rules.process(Defeated, leader, attacker, attackedBy(attacker));

    expect(
      game.playerTreasuries.getByPlayerAndType(someone, Gold).value()
    ).equal(100);
  });
});
