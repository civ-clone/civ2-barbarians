# civ2-barbarians

Civilization II's barbarians: raids from the sea, uprisings near a person's cities, the barbarians a goody hut releases,
leaders and their ransom, what barbarian cities build, and the odds when barbarians fight. The numbers and conditions
follow OpenCiv2's reconstruction of the original (github.com/richardpenman/civ2, MIT; `game.cpp`, `ai.cpp`,
`unit_combat.cpp`, `city_production.cpp`, `src/game/retvals.cpp`), the original's apparent bugs included; `civ2-enhanced`
corrects some of them by taking the place of a rule here.

The mechanism is `base-barbarians`' (the `Spawning` gate, the barbarian player, spawning a group, ransom, a city's gold).
The barbarian player is made by the first spawn, in Anarchy for good, with no advances. The host answers
`player:spawned` with a client for it, as `simple-ai-client`'s `BarbarianClient` is.

## Activity

How active the barbarians are is the `civ2-barbarians:activity` rule set (`RuleSets`), a choice saved with the game:
levels 0 to 3 (`…/0` to `…/3`), or a level drawn by the difficulty level (`…/random`): below Prince the level or one
more, Prince to Emperor 1 to 3, Deity 2 or 3. The default is level 2. `lib/activity`'s `activityLevel(game)` gives the
level, 0 to 3, for this package and any other (civ2-score's barbarian term): a drawn level is drawn the first time it's
asked for and kept in the game's pending effects (`civ2-barbarians:activity`), so a save keeps it. At level 0 no raid or
uprising ever comes; a hut still releases barbarians.

## Rules

Each rule's id is in `RuleIds`.

- **Onset** (`SPAWNING_RULE`, a base-barbarians `Spawning` rule): from the turn ((3 − a) × 3 + 30) × (5 − d) below Deity,
  (3 − a) × 3 + 15 on Deity (`lib/onset`). The original spawns as a turn ends, so the `Start` rules test the turn just
  played, `turn.value()` − 1.
- **Sea raids** (`SEA_RAID_RULE`): every 16th turn at a = 1 and every 8th at 2 and 3 (`(turn + 1) & mask`), until anyone
  knows the advance the Armor unit needs. A ship appears on an empty square of a sea of at least 16 squares, on rows 3
  to height − 4, found in up to 1000 tries (`lib/seaRaid`): a Trireme, a Caravel once anyone knows Navigation, a
  Frigate once anyone knows Magnetism, a veteran on an even draw. Aboard, clamp(turn ÷ (250 − 50a) + 1, 1, 5) + 1
  barbarians (+ 2 at a = 3): a leader (a Diplomat) and escorts, Archers, the Legion once a person knows Iron Working,
  Knights once anyone knows Metallurgy (or Chivalry at a = 3), Crusaders instead on an odd row, Dragoons once a person
  knows Tactics. A barbarian ship holds the whole horde (`RAIDERS_ABOARD_RULE`). A raid that finds no square skips that
  turn's uprising (`raidFailed`, `uprisingSkipped`). Emits `barbarians:raiders-at-sea` (player, ship, tile).
- **Uprisings** (`LAND_UPRISING_RULE`): each turn one standing city is drawn, and only a person's may rise, with a chance
  of its gold share in 100 (`lib/uprising`). The square is drawn in the original's coordinates round the city, each
  try re-centred on the city nearest the last, at least 5 from any city, with no civilization's unit next to it, on
  empty land of that city's land mass, in up to a × 50 tries. clamp(rand % size, 2, 99) barbarians rise besides the
  leader, more at a = 3 after turn 149, sized by the city the search ended on: a leader, then two types in fours, Chariots and Horsemen
  (swapped one time in 3), then Archers and Elephants, Cannon and Musketeers, Artillery and Riflemen, and Cavalry and
  Partisans, or Artillery and veteran Fanatics while the strongest human is a Republic or a Democracy and the city is its
  founder's. Emits `barbarians:uprising` (player, city, tile, industrial). `landUprising` takes `UprisingOptions`
  (`xOffset`, `byRolledCity`, `dropped`); `CLASSIC_UPRISING` is the original's.
- **Huts** (`HUT_HORDE_RULE`, base-goody-hut-barbarians' `Barbarians` rule, which turns civ2-goody-hut's barbarian
  outcome on): below a = 3, nothing before turn 30, or before turn 50 on a coin flip, for a player with a city on the
  hut's land mass within 24 (`lib/hut`). Otherwise one barbarian up to turn 49 (and up to 74 on a coin flip), or one on
  each free land square beside the hut, from direction turn mod 8, stepping by clamp(4 − the player's cities, 1, 4):
  the Legion on rough ground (a movement cost of 3 or more) or Horsemen, then Musketeers or Knights with Metallurgy,
  Riflemen or Cavalry with Armor's advance, Fanatics or Partisans with Guerrilla Warfare.
- **Ransom** (`RANSOM_RULE`): an attacker that beats a barbarian leader (a unit of a role above 4) defending is paid
  a × 50 gold, through base-barbarians' `payRansom` (`barbarians:ransom`).
- **Leaders leave** (`LEADER_LEAVES_RULE`, as the barbarians' turn starts, `lib/leader`): at sea less than 3 from a city;
  on land, unless with an escort or within 4 of a fighting unit to follow, once (turn & 7) + 4 or more from any city.
  The client's `LeadsGroup` (a role above 4) and `LeavesMap` (2 rows from the top or bottom edge, as rows, not scaled)
  rules are `LEADS_GROUP_RULE` and `LEAVES_MAP_RULE`.
- **Barbarian cities** (`CITY_BUILD_RULE`, `lib/cityBuild`) build one unit: the Legion, or Knights once anyone knows
  Explosives, when not building a unit (Settlers count as none); otherwise the unit they build, upgraded to the unit of
  the same role its obsoleting advance gives once two players know that advance and a person does (or from Emperor up),
  never on Chieftain. Never an improvement or a Wonder.
- **Odds** (`lib/combat`, after the defence bonuses):
  - a barbarian's attack is halved against a computer player and × (level + 1) ÷ 4 against a person; against a city,
    it is 0 while the owner has fewer than 2 cities and halved again with a Palace there; halved again when the
    defender's owner has the Great Wall (`BARBARIAN_ATTACKER_RULE`);
  - the city's defender rolls again on each round the barbarians win, with a Palace or under 8 cities
    (`DEFENDER_REROLLS_RULE`, base-combat-rounds' `defenderRerolls`);
  - barbarian Archers, and the Legion while no person knows Iron Working, defend at half, at least 1 of 8; an attacker
    whose owner has the Great Wall attacks barbarians at double (`BARBARIAN_DEFENDER_RULE`).

## Differences from the original

- Strengths are multiplied as numbers and truncated to eighths once, when the battle is fought; the original halves and
  scales whole eighths as it goes.
- The original reads the strongest human's government through a power rank used as a civilization number
  (`civs[game.best_human_rank]`); players here have no numbers, so the strongest human's government is read.
- The leader's departure is checked as the barbarians' turn starts rather than as each moves, and at sea for a leader
  aboard a ship (the original's wakes when its ship lands); the client lands a horde from up to 8 squares away.
- The original's barbarian ships give up after 30 turns or with fewer than 2 aboard, and barbarians demand money from a
  person's undefended city (`ai_barb_demand_ransom`): not yet (the client's).
