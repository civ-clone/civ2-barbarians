import {
  BARBARIAN_ATTACKER_RULE,
  BARBARIAN_DEFENDER_RULE,
  DEFENDER_REROLLS_RULE,
} from '../RuleIds';
import {
  BarbarianAttack,
  GREAT_WALL_ATTACK_MULTIPLIER,
  GREAT_WALL_BARBARIAN_ATTACK,
  PALACE_BARBARIAN_ATTACK,
  barbarianAttackFactor,
  defenderRerolls,
} from '../lib/combat';
import { Musketman, Warrior } from '@civ-clone/civ2-unit/Units';
import { EffectDescription } from '@civ-clone/core-rule/Description';
import GreatWall from '@civ-clone/base-wonder-great-wall/GreatWall';
import Palace from '@civ-clone/base-city-improvement-palace/Palace';
import Player from '@civ-clone/core-player/Player';
import barbarianPlayer from '../lib/barbarianPlayer';
import { expect } from 'chai';
import { setUp } from './lib/setUp';
import strength from '@civ-clone/core-unit/strength';
import unitCombat from '../Rules/Unit/combat';

describe('descriptions', (): void => {
  const rules = unitCombat({} as any),
    described = (id: string): EffectDescription[] =>
      rules.find((rule) => rule.id() === id)!.descriptions(),
    all = rules.flatMap((rule) => rule.descriptions()),
    about = (subject: Function): EffectDescription[] =>
      all.filter((description) => description.subject === subject),
    open: BarbarianAttack = {
      defenderHuman: false,
      level: 3,
      inCity: true,
      defenderCities: 10,
      palace: false,
      greatWall: false,
    };

  it('says something about the Palace and the Great Wall', (): void => {
    expect(about(Palace)).not.empty;
    expect(about(GreatWall)).not.empty;
  });

  it('describes the barbarian attack the Palace and the Great Wall halve, as the factor applies it', (): void => {
    expect(described(BARBARIAN_ATTACKER_RULE)).eql([
      {
        type: 'barbarian_attack',
        subject: Palace,
        value: PALACE_BARBARIAN_ATTACK,
      },
      {
        type: 'barbarian_attack',
        subject: GreatWall,
        value: GREAT_WALL_BARBARIAN_ATTACK,
        scope: 'player',
      },
    ]);

    const plain = barbarianAttackFactor(open);

    expect(barbarianAttackFactor({ ...open, palace: true }) / plain).equal(
      PALACE_BARBARIAN_ATTACK
    );
    expect(barbarianAttackFactor({ ...open, greatWall: true }) / plain).equal(
      GREAT_WALL_BARBARIAN_ATTACK
    );
    // The Great Wall's counts outside a city; the Palace's doesn't.
    expect(
      barbarianAttackFactor({ ...open, inCity: false, greatWall: true }) /
        barbarianAttackFactor({ ...open, inCity: false })
    ).equal(GREAT_WALL_BARBARIAN_ATTACK);
    expect(
      barbarianAttackFactor({ ...open, inCity: false, palace: true })
    ).equal(barbarianAttackFactor({ ...open, inCity: false }));
  });

  it("describes the Great Wall's attack on barbarian defenders, as the rule applies it", async (): Promise<void> => {
    expect(described(BARBARIAN_DEFENDER_RULE)).eql([
      {
        type: 'attack_multiplier',
        subject: GreatWall,
        value: GREAT_WALL_ATTACK_MULTIPLIER,
        against: 'barbarians',
      },
    ]);

    const { city, game, player, world } = await setUp(
        new Array(12).fill('#'.repeat(20))
      ),
      barbarians = barbarianPlayer(game, world),
      person: Player = player(true),
      attacker = new Musketman(null, person, world.get(5, 4), game.rules),
      ratio = (): number =>
        strength(
          attacker,
          new Warrior(null, barbarians, world.get(5, 5), game.rules),
          game.rules
        )[0].value() / attacker.attack().value();

    expect(ratio()).equal(1);

    game.wonders.register(
      new GreatWall(city(person, world.get(1, 1)), game.rules)
    );

    expect(ratio()).equal(GREAT_WALL_ATTACK_MULTIPLIER);
  });

  it("describes the Palace's re-roll, which a city with one always gets", (): void => {
    expect(described(DEFENDER_REROLLS_RULE)).eql([
      { type: 'barbarian_defender_rerolls', subject: Palace },
    ]);

    expect(defenderRerolls(open)).false;
    expect(defenderRerolls({ ...open, palace: true })).true;
    expect(defenderRerolls({ ...open, inCity: false, palace: true })).false;
  });
});
