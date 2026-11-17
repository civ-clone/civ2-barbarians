import { onsetTurn, raidMask, raidTurn, spawnTurn, spawns } from '../lib/onset';
import Turn from '@civ-clone/core-turn-based-game/Turn';
import { expect } from 'chai';

// OpenCiv2 `game.cpp` `game_spawn_barbarians` 1566-1592 (richardpenman/civ2@e39fe7b).
describe('onset', (): void => {
  it('starts barbarians on the turns of the original table: below Deity ((3 − a) × 3 + 30) × (5 − d), on Deity (3 − a) × 3 + 15', (): void => {
    // Rows a = 1..3, columns Chieftain..Deity (RULES §1).
    const table = [
      [180, 144, 108, 72, 36, 21],
      [165, 132, 99, 66, 33, 18],
      [150, 120, 90, 60, 30, 15],
    ];

    table.forEach((row: number[], index: number): void =>
      row.forEach((turn: number, level: number): void => {
        expect(onsetTurn(index + 1, level), `a ${index + 1}, d ${level}`).equal(
          turn
        );
      })
    );
  });

  it('never starts them at a = 0', (): void => {
    [0, 1, 2, 3, 4, 5].forEach((level: number): void => {
      expect(spawns(0, level, 1000)).false;
    });
  });

  it('lets them appear from the onset turn itself, never before, and never on turn 0', (): void => {
    // King, a = 2: 66.
    expect(spawns(2, 3, 65)).false;
    expect(spawns(2, 3, 66)).true;
    expect(spawns(2, 3, 67)).true;
    // Deity, a = 3: 15.
    expect(spawns(3, 5, 14)).false;
    expect(spawns(3, 5, 15)).true;
    expect(spawns(3, 5, 0)).false;
  });

  it('tests the turn just played, one before the turn starting', (): void => {
    const turn = new Turn();

    // The first turn's `Start` rules run once `turn:start` has counted it: turn 1.
    turn.increment();

    expect(turn.value()).equal(1);
    expect(spawnTurn(turn)).equal(0);

    turn.increment();

    expect(spawnTurn(turn)).equal(1);
  });

  it('raids every 16th turn at a = 1 and every 8th at a = 2 and 3: (turn + 1) & mask = 0', (): void => {
    expect(raidMask(1)).equal(15);
    expect(raidMask(2)).equal(7);
    expect(raidMask(3)).equal(7);

    const turns = (activity: number): number[] =>
      new Array(48)
        .fill(0)
        .map((_, turn: number): number => turn)
        .filter((turn: number): boolean => raidTurn(activity, turn));

    expect(turns(1)).eql([15, 31, 47]);
    expect(turns(2)).eql([7, 15, 23, 31, 39, 47]);
    expect(turns(3)).eql(turns(2));
  });
});
