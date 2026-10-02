import './setup.mjs';
import '../src/dcc.mjs';
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { DCCSessionEngine, DCC_ROLL_OUTCOMES } from '../src/apps/session-manager.mjs';
import { DCCRapidBatchImportApp } from '../src/apps/rapid-batch-import.mjs';
import { DCCRapidTextParser } from '../src/apps/rapid-text-parser.mjs';

describe('DCC RPG Rapid Batch Import Subsystem', () => {
  let mockCarl;
  let mockDonut;
  let session;

  beforeEach(async () => {
    // Reset global sessions
    globalThis.game.settings.set('carl-rpg', 'sessions', []);
    globalThis.game.settings.set('carl-rpg', 'activeSessionId', null);

    // Create mock crawler actors
    mockCarl = await Actor.create({
      id: 'actor-carl',
      name: 'Carl',
      type: 'crawler',
      system: { details: { level: 3, party: 'The Royal Court' } }
    });

    mockDonut = await Actor.create({
      id: 'actor-donut',
      name: 'Princess Donut the Queen Anne Chonk',
      type: 'crawler',
      system: { details: { level: 3, party: 'The Royal Court' } }
    });

    // Start a clean active session
    session = await DCCSessionEngine.createSession({ title: 'Floor 3 Boss Fight' });
  });

  it('1. DCCRapidBatchImportApp initializes with default state and formats getData', async () => {
    const app = new DCCRapidBatchImportApp({ sessionId: session.id });
    const data = await app.getData();

    assert.ok(data);
    assert.equal(data.sessionId, session.id);
    assert.equal(data.sessionTitle, 'Floor 3 Boss Fight');
    assert.equal(data.hasEvents, false);
    assert.equal(data.totalEvents, 0);
    assert.ok(Array.isArray(data.crawlers));
    assert.ok(data.crawlers.length >= 2);
    assert.ok(Array.isArray(data.typeOptions));
    assert.ok(Array.isArray(data.outcomeOptions));
  });

  it('2. _parseCurrentText parses multi-line text and prepares display events', async () => {
    const app = new DCCRapidBatchImportApp({ sessionId: session.id });
    app.rawText = [
      'Carl Dodge 16 vs 14 blocked 5 dmg',
      'Donut Magic Missile 18 vs 12 hit 14 dmg',
      'Carl Heavy Kick 19 vs 12 hit 22 dmg killing blow'
    ].join('\n');

    app._parseCurrentText();

    assert.equal(app.parsedEvents.length, 3);
    assert.equal(app.parsedEvents[0].actorId, 'actor-carl');
    assert.equal(app.parsedEvents[0].name, 'Dodge');
    assert.equal(app.parsedEvents[0].mitigation, 5);

    assert.equal(app.parsedEvents[1].actorId, 'actor-donut');
    assert.equal(app.parsedEvents[1].name, 'Magic Missile');
    assert.equal(app.parsedEvents[1].damage, 14);

    assert.equal(app.parsedEvents[2].actorId, 'actor-carl');
    assert.equal(app.parsedEvents[2].name, 'Heavy Kick');
    assert.equal(app.parsedEvents[2].isKill, true);

    const data = await app.getData();
    assert.equal(data.hasEvents, true);
    assert.equal(data.totalEvents, 3);
    assert.equal(data.parsedEvents[0].actorName, 'Carl');
    assert.equal(data.parsedEvents[1].actorName, 'Princess Donut the Queen Anne Chonk');
  });

  it('3. _loadSampleNotes loads pre-formatted in-person notes and parses them', async () => {
    const app = new DCCRapidBatchImportApp({ sessionId: session.id });
    app._loadSampleNotes();

    assert.ok(app.rawText.length > 0);
    assert.ok(app.parsedEvents.length >= 5);
  });

  it('4. _addBlankRow allows manual row creation', async () => {
    const app = new DCCRapidBatchImportApp({ sessionId: session.id, defaultActorId: 'actor-carl' });
    app._addBlankRow();

    assert.equal(app.parsedEvents.length, 1);
    assert.equal(app.parsedEvents[0].actorId, 'actor-carl');
    assert.equal(app.parsedEvents[0].name, 'Custom Action');
    assert.equal(app.parsedEvents[0].outcome, DCC_ROLL_OUTCOMES.PENDING);
  });

  it('5. _commitBatch writes all rows to session ledger and updates crawler metrics', async () => {
    const app = new DCCRapidBatchImportApp({ sessionId: session.id });
    app.rawText = [
      'Carl Dodge 16 vs 14 blocked 8 dmg',
      'Donut Magic Missile 18 vs 12 hit 15 dmg',
      'Carl Slam nat 20 crit 30 dmg killing blow',
      'Donut Acrobatics 7 vs 15 untrained fail'
    ].join('\n');

    app._parseCurrentText();
    assert.equal(app.parsedEvents.length, 4);

    // Commit batch
    await app._commitBatch();

    // Verify session data
    const s = DCCSessionEngine.getAllSessions().find(x => x.id === session.id);
    assert.ok(s);
    assert.equal(s.ledger.length, 4);

    // Check Carl's metrics: 30 damage dealt, 8 mitigated, 1 kill
    const carlEntry = s.crawlers['actor-carl'];
    assert.ok(carlEntry);
    assert.equal(carlEntry.damageDealt, 30);
    assert.equal(carlEntry.damageMitigated, 8);
    assert.equal(carlEntry.kills, 1);

    // Check Donut's metrics: 15 damage dealt, 1 untrained attempt
    const donutEntry = s.crawlers['actor-donut'];
    assert.ok(donutEntry);
    assert.equal(donutEntry.damageDealt, 15);
    assert.equal(donutEntry.untrainedAttempted['Acrobatics'], 1);

    // Verify Session Summary recomputations
    assert.equal(s.summary.totalDamageDealt, 45);
    assert.equal(s.summary.totalDamageMitigated, 8);
    assert.equal(s.summary.totalKills, 1);
    assert.equal(s.summary.totalUntrainedAttempts, 1);
  });

  it('6. DCCSessionEngine.batchCreateEvents handles direct array creation', async () => {
    const events = [
      {
        actorId: 'actor-carl',
        type: 'attack',
        name: 'Warhammer Stomp',
        total: 19,
        targetDC: 14,
        damage: 25,
        isKill: true
      },
      {
        actorId: 'actor-donut',
        type: 'spell',
        name: 'Heal',
        total: 12,
        healing: 12
      }
    ];

    const created = await DCCSessionEngine.batchCreateEvents(events, session.id);
    assert.equal(created.length, 2);
    assert.equal(created[0].damage, 25);
    assert.equal(created[0].isKill, true);
    assert.equal(created[1].healing, 12);

    const s = DCCSessionEngine.getAllSessions().find(x => x.id === session.id);
    assert.equal(s.crawlers['actor-carl'].damageDealt, 25);
    assert.equal(s.crawlers['actor-carl'].kills, 1);
    assert.equal(s.crawlers['actor-donut'].healingDone, 12);
    assert.equal(s.summary.totalHealingDone, 12);
  });

  it('7. Chat command /log directly records a single roll into active session', async () => {
    // Find the chatMessage hook registered in dcc.mjs
    const listeners = Hooks.events?.chatMessage || [];
    const entry = listeners[listeners.length - 1];
    const hookFn = typeof entry === 'function' ? entry : entry?.fn;
    assert.equal(typeof hookFn, 'function', 'hookFn must be a callable function');

    // Simulate sending /log command
    const handled = hookFn(null, '/log Carl Punch 17 vs 13 hit 10 dmg', {});
    assert.equal(handled, false, 'Command hook must return false to suppress chat broadcasting');

    // Give promise microtask time to settle
    await new Promise(resolve => setTimeout(resolve, 20));

    const s = DCCSessionEngine.getAllSessions().find(x => x.id === session.id);
    const lastEvent = s.ledger[s.ledger.length - 1];
    assert.ok(lastEvent);
    assert.equal(lastEvent.actorId, 'actor-carl');
    assert.equal(lastEvent.name, 'Punch');
    assert.equal(lastEvent.damage, 10);
    assert.equal(lastEvent.total, 17);
    assert.equal(lastEvent.targetDC, 13);
  });
});
