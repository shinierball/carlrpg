/**
 * rapid-text-parser.test.mjs
 * Unit tests verifying DCCRapidTextParser natural language and shorthand parsing.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import './setup.mjs';
import { DCCRapidTextParser } from '../src/apps/rapid-text-parser.mjs';
import { DCC_ROLL_OUTCOMES } from '../src/apps/session-manager.mjs';

describe('DCCRapidTextParser Subsystem', () => {
  const mockCrawlers = [
    { id: 'actor-carl', name: 'Carl' },
    { id: 'actor-donut', name: 'Princess Donut the Queen Anne Chonk' },
    { id: 'actor-katia', name: 'Katia Firebrand' },
    { id: 'actor-elle', name: 'Elle' },
    { id: 'actor-prepotente', name: 'Prepotente' }
  ];

  it('1. Parses attack roll with damage, DC, hit, and killing blow', () => {
    const line = 'Carl Chainsaw 18 vs 15 hit 14 dmg kill';
    const parsed = DCCRapidTextParser.parseLine(line, mockCrawlers);

    assert.ok(parsed, 'Event should be parsed');
    assert.equal(parsed.actorId, 'actor-carl');
    assert.equal(parsed.actorName, 'Carl');
    assert.equal(parsed.name, 'Chainsaw');
    assert.equal(parsed.total, 18);
    assert.equal(parsed.targetDC, 15);
    assert.equal(parsed.outcome, DCC_ROLL_OUTCOMES.SUCCESS);
    assert.equal(parsed.damage, 14);
    assert.equal(parsed.isKill, true);
    assert.equal(parsed.isUntrained, false);
    assert.equal(parsed.type, 'attack');
    assert.match(parsed.notes, /KILLING BLOW/);
  });

  it('2. Parses spell with critical success and damage', () => {
    const line = 'Donut Fireball 22 vs 16 crit success 28 dmg';
    const parsed = DCCRapidTextParser.parseLine(line, mockCrawlers);

    assert.ok(parsed);
    assert.equal(parsed.actorId, 'actor-donut');
    assert.equal(parsed.name, 'Fireball');
    assert.equal(parsed.type, 'spell');
    assert.equal(parsed.total, 22);
    assert.equal(parsed.targetDC, 16);
    assert.equal(parsed.outcome, DCC_ROLL_OUTCOMES.CRITICAL_SUCCESS);
    assert.equal(parsed.damage, 28);
    assert.equal(parsed.isUntrained, false);
  });

  it('3. Parses untrained skill check with failure', () => {
    const line = 'Katia Lockpicking 8 vs 14 fail untrained';
    const parsed = DCCRapidTextParser.parseLine(line, mockCrawlers);

    assert.ok(parsed);
    assert.equal(parsed.actorId, 'actor-katia');
    assert.equal(parsed.name, 'Lockpicking');
    assert.equal(parsed.total, 8);
    assert.equal(parsed.targetDC, 14);
    assert.equal(parsed.outcome, DCC_ROLL_OUTCOMES.FAILURE);
    assert.equal(parsed.isUntrained, true);
    assert.equal(parsed.type, 'untrained_skill');
  });

  it('4. Parses healing spell with amount', () => {
    const line = 'Elle Heal 8 healing on Carl';
    const parsed = DCCRapidTextParser.parseLine(line, mockCrawlers);

    assert.ok(parsed);
    assert.equal(parsed.actorId, 'actor-elle');
    assert.equal(parsed.name, 'Heal');
    assert.equal(parsed.healing, 8);
    assert.equal(parsed.type, 'spell');
    assert.match(parsed.notes, /8 HEAL/);
  });

  it('5. Parses skill/evade check with damage mitigation', () => {
    const line = 'Carl Dodge 16 vs 14 blocked 5 dmg';
    const parsed = DCCRapidTextParser.parseLine(line, mockCrawlers);

    assert.ok(parsed);
    assert.equal(parsed.actorId, 'actor-carl');
    assert.equal(parsed.name, 'Dodge');
    assert.equal(parsed.total, 16);
    assert.equal(parsed.targetDC, 14);
    assert.equal(parsed.outcome, DCC_ROLL_OUTCOMES.SUCCESS);
    assert.equal(parsed.mitigation, 5);
    assert.match(parsed.notes, /Mitigated 5/);
  });

  it('6. Parses natural 20 critical hit and killing blow', () => {
    const line = 'Prepotente Headbutt nat 20 crit 35 dmg killing blow';
    const parsed = DCCRapidTextParser.parseLine(line, mockCrawlers);

    assert.ok(parsed);
    assert.equal(parsed.actorId, 'actor-prepotente');
    assert.equal(parsed.name, 'Headbutt');
    assert.equal(parsed.d20Result, 20);
    assert.equal(parsed.outcome, DCC_ROLL_OUTCOMES.CRITICAL_SUCCESS);
    assert.equal(parsed.damage, 35);
    assert.equal(parsed.isKill, true);
  });

  it('7. Parses damage taken and mitigation', () => {
    const line = 'Carl took 12 damage mitigated 4';
    const parsed = DCCRapidTextParser.parseLine(line, mockCrawlers);

    assert.ok(parsed);
    assert.equal(parsed.actorId, 'actor-carl');
    assert.equal(parsed.type, 'damage_taken');
    assert.equal(parsed.damage, 12);
    assert.equal(parsed.mitigation, 4);
  });

  it('8. Parses colon-separated notation with favor delta', () => {
    const line = 'Donut: Cat Sass, rolled 19 vs DC 12, +5 favor';
    const parsed = DCCRapidTextParser.parseLine(line, mockCrawlers);

    assert.ok(parsed);
    assert.equal(parsed.actorId, 'actor-donut');
    assert.equal(parsed.name, 'Cat Sass');
    assert.equal(parsed.total, 19);
    assert.equal(parsed.targetDC, 12);
    assert.equal(parsed.statDelta, 5);
    assert.equal(parsed.type, 'favor');
  });

  it('9. Parses multi-line batch notes skipping empty lines', () => {
    const batch = `
      Carl Chainsaw 18 vs 15 hit 14 dmg kill
      Donut Fireball 22 vs 16 crit 28 dmg

      - Katia Lockpicking 8 vs 14 fail untrained
      [08:14] Elle Heal 8 healing
    `;

    const parsedList = DCCRapidTextParser.parse(batch, mockCrawlers);
    assert.equal(parsedList.length, 4);
    assert.equal(parsedList[0].actorName, 'Carl');
    assert.equal(parsedList[1].actorName, 'Princess Donut the Queen Anne Chonk');
    assert.equal(parsedList[2].actorName, 'Katia Firebrand');
    assert.equal(parsedList[2].isUntrained, true);
    assert.equal(parsedList[3].actorName, 'Elle');
    assert.equal(parsedList[3].healing, 8);
  });
});
