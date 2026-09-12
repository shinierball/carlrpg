import './setup.mjs';
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DCCActor } from '../src/documents/actor.mjs';

describe('DCC RPG Crawler & Pet Token Linking', () => {
  test('DCCActor._preCreate sets prototypeToken.actorLink to true for crawler and pet', async () => {
    const crawler = new DCCActor({
      type: 'crawler',
      name: 'Carl'
    });
    await crawler._preCreate({}, {}, 'user-1');
    assert.equal(crawler.prototypeToken?.actorLink, true);
    assert.equal(crawler.prototypeToken?.disposition, 1);

    const pet = new DCCActor({
      type: 'pet',
      name: 'Princess Donut'
    });
    await pet._preCreate({}, {}, 'user-1');
    assert.equal(pet.prototypeToken?.actorLink, true);
    assert.equal(pet.prototypeToken?.disposition, 1);

    const npc = new DCCActor({
      type: 'npc',
      name: 'Goblin'
    });
    await npc._preCreate({}, {}, 'user-1');
    assert.notEqual(npc.prototypeToken?.actorLink, true);
  });

  test('preCreateToken hook enforces actorLink: true for crawler and pet tokens', () => {
    // Simulate preCreateToken handler logic
    const handler = (tokenDoc, createData, options, userId) => {
      const actor = tokenDoc.actor || globalThis.game?.actors?.get?.(tokenDoc.actorId);
      if (actor && (actor.type === 'crawler' || actor.type === 'pet')) {
        tokenDoc.updateSource({ actorLink: true });
      }
    };

    // Token for crawler
    const crawlerActor = new DCCActor({ type: 'crawler', name: 'Carl' });
    const crawlerTokenDoc = {
      actor: crawlerActor,
      actorLink: false,
      updateSource(data) {
        Object.assign(this, data);
      }
    };

    handler(crawlerTokenDoc, {}, {}, 'user-1');
    assert.equal(crawlerTokenDoc.actorLink, true);

    // Token for pet
    const petActor = new DCCActor({ type: 'pet', name: 'Princess Donut' });
    const petTokenDoc = {
      actor: petActor,
      actorLink: false,
      updateSource(data) {
        Object.assign(this, data);
      }
    };

    handler(petTokenDoc, {}, {}, 'user-1');
    assert.equal(petTokenDoc.actorLink, true);

    // Token for monster/npc
    const monsterActor = new DCCActor({ type: 'npc', name: 'Goblin' });
    const monsterTokenDoc = {
      actor: monsterActor,
      actorLink: false,
      updateSource(data) {
        Object.assign(this, data);
      }
    };

    handler(monsterTokenDoc, {}, {}, 'user-1');
    assert.equal(monsterTokenDoc.actorLink, false);
  });

  test('scene migration updates unlinked crawler and pet tokens across scenes', async () => {
    const crawlerActor = new DCCActor({ type: 'crawler', name: 'Carl' });
    const npcActor = new DCCActor({ type: 'npc', name: 'Goblin' });

    const scene1Tokens = [
      { id: 'token-1', name: 'Carl', actor: crawlerActor, actorLink: false },
      { id: 'token-2', name: 'Goblin 1', actor: npcActor, actorLink: false }
    ];

    const scene2Tokens = [
      { id: 'token-3', name: 'Carl', actor: crawlerActor, actorLink: false }
    ];

    const scenes = [
      {
        name: 'Dungeon Level 1',
        tokens: scene1Tokens,
        updated: [],
        async updateEmbeddedDocuments(type, updates) {
          this.updated.push(...updates);
          for (const u of updates) {
            const t = this.tokens.find(tok => tok.id === u._id);
            if (t) Object.assign(t, u);
          }
        }
      },
      {
        name: 'Dungeon Level 2',
        tokens: scene2Tokens,
        updated: [],
        async updateEmbeddedDocuments(type, updates) {
          this.updated.push(...updates);
          for (const u of updates) {
            const t = this.tokens.find(tok => tok.id === u._id);
            if (t) Object.assign(t, u);
          }
        }
      }
    ];

    // Simulate migration logic from ready hook
    for (const scene of scenes) {
      const updates = [];
      for (const token of scene.tokens) {
        const actor = token.actor;
        if (actor && (actor.type === 'crawler' || actor.type === 'pet') && !token.actorLink) {
          updates.push({ _id: token.id, actorLink: true });
        }
      }
      if (updates.length) {
        await scene.updateEmbeddedDocuments('Token', updates);
      }
    }

    assert.equal(scenes[0].tokens[0].actorLink, true, 'Crawler on scene 1 should be migrated to actorLink: true');
    assert.equal(scenes[0].tokens[1].actorLink, false, 'Goblin on scene 1 should remain unlinked');
    assert.equal(scenes[1].tokens[0].actorLink, true, 'Crawler on scene 2 should be migrated to actorLink: true');
    assert.equal(scenes[0].updated.length, 1);
    assert.equal(scenes[1].updated.length, 1);
  });
});
