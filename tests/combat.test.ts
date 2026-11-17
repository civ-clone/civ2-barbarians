import {
  BarbarianAttack,
  MINIMUM_DEFENCE,
  barbarianAttackFactor,
  barbarianDefence,
  defenderRerolls,
} from '../lib/combat';
import {
  Archer,
  Musketman,
  Swordman,
  Warrior,
} from '@civ-clone/civ2-unit/Units';
import { applyCombatModifiers } from '@civ-clone/base-combat-rounds/lib/CombatModifiers';
import GreatWall from '@civ-clone/base-wonder-great-wall/GreatWall';
import { IronWorking, Metallurgy } from '@civ-clone/civ2-science/Advances';
import { obsoletedBy } from '@civ-clone/civ2-wonder/Requirements';
import Palace from '@civ-clone/base-city-improvement-palace/Palace';
import Player from '@civ-clone/core-player/Player';
import Unit from '@civ-clone/core-unit/Unit';
import barbarianPlayer from '../lib/barbarianPlayer';
import { expect } from 'chai';
import { setUp } from './lib/setUp';
import strength from '@civ-clone/core-unit/strength';

const open: BarbarianAttack = {
  defenderHuman: false,
  level: 3,
  inCity: false,
  defenderCities: 10,
  palace: false,
  greatWall: false,
};

// OpenCiv2 `unit_combat.cpp` `unit_resolve_attack_barbarian_odds` 360-400 (richardpenman/civ2@e39fe7b).
describe('barbarian odds', (): void => {
  it("halves a barbarian's attack on a computer player, and scales it by (level + 1) ÷ 4 on a person", (): void => {
    expect(barbarianAttackFactor(open)).equal(0.5);
    [0, 1, 2, 3, 4, 5].forEach((level: number): void => {
      expect(
        barbarianAttackFactor({ ...open, defenderHuman: true, level })
      ).equal((level + 1) / 4);
    });
  });

  it('stops it against a city whose owner has fewer than 2, and halves it again for a Palace and for the Great Wall', (): void => {
    const city = { ...open, inCity: true };

    expect(barbarianAttackFactor({ ...city, defenderCities: 1 })).equal(0);
    expect(barbarianAttackFactor({ ...city, defenderCities: 2 })).equal(0.5);
    expect(barbarianAttackFactor({ ...city, palace: true })).equal(0.25);
    expect(
      barbarianAttackFactor({ ...city, palace: true, greatWall: true })
    ).equal(0.125);
    // The Great Wall counts outside a city too; a Palace only in one.
    expect(barbarianAttackFactor({ ...open, greatWall: true })).equal(0.25);
    expect(barbarianAttackFactor({ ...open, palace: true })).equal(0.5);
  });

  it('lets a city roll again with a Palace or under 8 cities, and nothing outside a city', (): void => {
    const city = { ...open, inCity: true };

    expect(defenderRerolls(open)).false;
    expect(defenderRerolls({ ...open, defenderCities: 1 })).false;
    expect(defenderRerolls({ ...city, defenderCities: 8 })).false;
    expect(defenderRerolls({ ...city, defenderCities: 7 })).true;
    expect(defenderRerolls({ ...city, palace: true })).true;
  });

  it('halves a weak barbarian defender, to no less than 1 of 8', (): void => {
    expect(barbarianDefence(2, true)).equal(1);
    expect(barbarianDefence(0.25, true)).equal(MINIMUM_DEFENCE);
    expect(barbarianDefence(0.125, true)).equal(MINIMUM_DEFENCE);
    expect(barbarianDefence(2, false)).equal(2);
  });
});

describe('barbarian odds in a game', (): void => {
  const land = (): string[] => new Array(12).fill('#'.repeat(20));

  it("changes the strengths and the rounds by the rules, and nothing else's", async (): Promise<void> => {
    const { city, game, player, world } = await setUp(land()),
      barbarians = barbarianPlayer(game, world),
      person: Player = player(true),
      computer: Player = player(false),
      unit = (UnitType: typeof Unit, owner: Player, x: number, y: number) =>
        new UnitType(null, owner, world.get(x, y), game.rules),
      raider = unit(Archer, barbarians, 5, 5),
      ratio = (attacker: Unit, defender: Unit): [number, number] => {
        const [plainAttack, plainDefence] = [
            attacker.attack().value(),
            defender.defence().value(),
          ],
          [attack, defence] = strength(attacker, defender, game.rules);

        return [attack.value() / plainAttack, defence.value() / plainDefence];
      };

    // On a person's unit in the open at King: × 4 ÷ 4.
    expect(ratio(raider, unit(Musketman, person, 6, 5))[0]).equal(1);
    // On a computer player's: ½.
    expect(ratio(raider, unit(Musketman, computer, 6, 6))[0]).equal(0.5);

    // In a computer player's only city: 0, and no reroll (it isn't asked for, but the rule says so with a Palace).
    const capital = city(computer, world.get(7, 7)),
      guard = unit(Musketman, computer, 7, 7);

    expect(ratio(raider, guard)[0]).equal(0);

    city(computer, world.get(15, 7));
    game.cityImprovements.register(new Palace(capital, game.rules));

    // Two cities and a Palace: ½ × ½, and the defender rolls again.
    expect(ratio(raider, guard)[0]).equal(0.25);

    const terms = applyCombatModifiers(game.rules, raider, guard, {
      attack: 1,
      defence: 1,
      attackerFirepower: 1,
      defenderFirepower: 1,
    });

    expect(terms.defenderRerolls).true;

    // A barbarian Archer defends at half; a Legion while no person knows Iron Working; a Warrior at full.
    const attacker = unit(Musketman, person, 5, 4);

    expect(ratio(attacker, raider)[1]).equal(0.5);
    expect(ratio(attacker, unit(Swordman, barbarians, 4, 4))[1]).equal(0.5);
    expect(ratio(attacker, unit(Warrior, barbarians, 4, 3))[1]).equal(1);

    game.playerResearch.getByPlayer(person).addAdvance(IronWorking);

    expect(ratio(attacker, unit(Swordman, barbarians, 3, 3))[1]).equal(1);

    // The Great Wall doubles its owner's attack on barbarians.
    game.wonders.register(
      new GreatWall(city(person, world.get(1, 1)), game.rules)
    );

    expect(ratio(attacker, unit(Warrior, barbarians, 3, 2))[0]).equal(2);

    // Not between civilizations.
    expect(ratio(attacker, guard)).eql([1, 1]);

    // A barbarian attack on the Great Wall's owner is halved, until the Wonder expires: once anyone knows Metallurgy,
    //  civ2-wonder's requirement (`wonder_get_city` gives no city then).
    game.requirements.register(...obsoletedBy);

    const defender = unit(Musketman, person, 2, 2);

    expect(ratio(raider, defender)[0]).equal(0.5);

    game.playerResearch.getByPlayer(computer).addAdvance(Metallurgy);

    expect(ratio(raider, defender)[0]).equal(1);
    expect(ratio(attacker, unit(Warrior, barbarians, 2, 1))[0]).equal(1);
  });
});
