/**
 * Dungeon Crawler Carl RPG — Rapid Batch Importer
 * 
 * Provides an ultra-fast in-person play transcription and batch entry interface.
 * GMs or scribes can paste raw bullet points, chat lines, or speech-to-text transcripts
 * to rapidly parse, review, tweak, and commit multiple player rolls and combat results
 * into the active session ledger in a single click.
 */

import { DCCBaseApplication } from './base-application.mjs';
import { DCCSessionEngine, DCC_ROLL_OUTCOMES, DCC_OUTCOME_CONFIG } from './session-manager.mjs';
import { DCCRapidTextParser } from './rapid-text-parser.mjs';

export class DCCRapidBatchImportApp extends DCCBaseApplication {
  constructor(options = {}) {
    super(options);
    this.sessionId = options.sessionId || DCCSessionEngine.getActiveSessionId();
    this.rawText = options.rawText || '';
    this.defaultActorId = options.defaultActorId || '';
    this.parsedEvents = [];
  }

  static get defaultOptions() {
    const options = super.defaultOptions || {};
    const merge = (typeof foundry !== 'undefined' && foundry?.utils?.mergeObject)
      ? foundry.utils.mergeObject
      : Object.assign;

    return merge(options, {
      id: 'dcc-rapid-batch-import',
      template: 'systems/carl-rpg/templates/apps/rapid-batch-import.hbs',
      title: '⚡ Rapid Batch Roll & Event Importer',
      width: 940,
      height: 700,
      resizable: true,
      scrollY: ['.dcc-rapid-preview-scroll', '.dcc-rapid-textarea'],
      classes: ['dcc-rapid-batch-import-app']
    });
  }

  async getData(options = {}) {
    const sessions = DCCSessionEngine.getAllSessions();
    const session = sessions.find(s => s.id === this.sessionId) || await DCCSessionEngine.getActiveSession();
    const crawlers = DCCSessionEngine.getPartyCrawlers({ sessionId: this.sessionId, trackedOnly: false });

    // Fallback default actor to first party crawler if not set
    if (!this.defaultActorId && crawlers.length > 0) {
      this.defaultActorId = crawlers[0].id;
    }

    const typeOptions = [
      { key: 'skill', label: 'Trained Skill' },
      { key: 'untrained_skill', label: 'Untrained Skill' },
      { key: 'attack', label: 'Attack / Strike' },
      { key: 'spell', label: 'Spell Cast' },
      { key: 'damage_taken', label: 'Damage Taken' },
      { key: 'favor', label: 'AI Favor' },
      { key: 'popularity', label: 'Popularity' },
      { key: 'loot', label: 'Loot Box' },
      { key: 'manual', label: 'Manual Event' }
    ];

    const outcomeOptions = Object.entries(DCC_OUTCOME_CONFIG).map(([k, v]) => ({
      key: k,
      label: v.label,
      badge: v.badge,
      class: v.class
    }));

    // Attach presentation metadata to parsed events
    const displayEvents = this.parsedEvents.map((evt, idx) => {
      const actor = crawlers.find(c => c.id === evt.actorId);
      const outcomeConf = DCC_OUTCOME_CONFIG[evt.outcome] || DCC_OUTCOME_CONFIG.pending;
      return {
        ...evt,
        index: idx,
        actorName: actor?.name || 'Party / Crawler',
        actorImg: actor?.img || 'icons/svg/mystery-man.svg',
        outcomeClass: outcomeConf.class,
        outcomeBadge: outcomeConf.badge
      };
    });

    return {
      session,
      sessionId: session?.id || '',
      sessionTitle: session?.title || 'Active Session',
      crawlers,
      defaultActorId: this.defaultActorId,
      rawText: this.rawText,
      parsedEvents: displayEvents,
      hasEvents: displayEvents.length > 0,
      totalEvents: displayEvents.length,
      typeOptions,
      outcomeOptions
    };
  }

  activateListeners(html) {
    super.activateListeners(html);
    const root = html[0] || html;

    // Textarea sync
    const textarea = root.querySelector('.dcc-rapid-textarea');
    if (textarea) {
      textarea.addEventListener('input', (e) => {
        this.rawText = e.target.value;
      });
    }

    // Default crawler change
    const defaultSelect = root.querySelector('.dcc-rapid-default-crawler');
    if (defaultSelect) {
      defaultSelect.addEventListener('change', (e) => {
        this.defaultActorId = e.target.value;
      });
    }

    // Parse button
    const parseBtn = root.querySelector('.dcc-rapid-parse-btn');
    if (parseBtn) {
      parseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this._parseCurrentText();
      });
    }

    // Sample notes loader
    const sampleBtn = root.querySelector('.dcc-rapid-sample-btn');
    if (sampleBtn) {
      sampleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this._loadSampleNotes();
      });
    }

    // Clear button
    const clearBtn = root.querySelector('.dcc-rapid-clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.rawText = '';
        this.parsedEvents = [];
        this.render(false);
      });
    }

    // Add empty row
    const addRowBtn = root.querySelector('.dcc-rapid-add-row-btn');
    if (addRowBtn) {
      addRowBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this._addBlankRow();
      });
    }

    // Delete single row
    root.querySelectorAll('.dcc-rapid-delete-row-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const rowIdx = parseInt(e.currentTarget.dataset.index, 10);
        if (!isNaN(rowIdx) && this.parsedEvents[rowIdx]) {
          this.parsedEvents.splice(rowIdx, 1);
          this.render(false);
        }
      });
    });

    // Row inline input changes (keep this.parsedEvents in sync)
    root.querySelectorAll('.dcc-rapid-row-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const rowIdx = parseInt(e.target.dataset.index, 10);
        const field = e.target.dataset.field;
        if (isNaN(rowIdx) || !this.parsedEvents[rowIdx] || !field) return;

        const val = e.target.value;
        if (['total', 'targetDC', 'damage', 'healing', 'mitigation', 'statDelta'].includes(field)) {
          this.parsedEvents[rowIdx][field] = val === '' ? null : Number(val);
        } else if (['isUntrained', 'isKill'].includes(field)) {
          this.parsedEvents[rowIdx][field] = e.target.checked;
        } else {
          this.parsedEvents[rowIdx][field] = val;
        }
      });
    });

    // Commit / Import All button
    const commitBtn = root.querySelector('.dcc-rapid-commit-btn');
    if (commitBtn) {
      commitBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        await this._commitBatch();
      });
    }
  }

  /**
   * Parse the current textarea string using DCCRapidTextParser
   */
  _parseCurrentText() {
    const crawlers = DCCSessionEngine.getPartyCrawlers({ sessionId: this.sessionId, trackedOnly: false });
    const parsed = DCCRapidTextParser.parse(this.rawText, crawlers, this.defaultActorId);

    this.parsedEvents = parsed;
    this.render(false);

    if (parsed.length === 0 && this.rawText.trim().length > 0) {
      if (typeof ui !== 'undefined' && ui.notifications?.warn) {
        ui.notifications.warn('No valid roll or action events could be parsed from the text.');
      }
    } else if (parsed.length > 0 && typeof ui !== 'undefined' && ui.notifications?.info) {
      ui.notifications.info(`Parsed ${parsed.length} action lines ready for review.`);
    }
  }

  /**
   * Load sample transcribed lines for instant demonstration
   */
  _loadSampleNotes() {
    const sample = [
      'Carl Dodge 16 vs 14 blocked 5 dmg',
      'Donut Magic Missile 18 vs 12 hit 14 dmg',
      'Elle Heal 8 healing on Carl',
      'Prepotente Headbutt nat 20 crit 35 dmg killing blow',
      'Katia Lockpicking 9 vs 15 untrained fail',
      'Carl took 12 dmg from acid trap',
      'Party AI Favor: +5 favor for audience stunt'
    ].join('\n');

    this.rawText = sample;
    this._parseCurrentText();
  }

  /**
   * Append an empty row for quick manual entry
   */
  _addBlankRow() {
    this.parsedEvents.push({
      actorId: this.defaultActorId || 'unknown',
      name: 'Custom Action',
      type: 'skill',
      isUntrained: false,
      rollFormula: '1d20',
      total: 10,
      d20Result: null,
      targetDC: 12,
      outcome: DCC_ROLL_OUTCOMES.PENDING,
      damage: 0,
      healing: 0,
      mitigation: 0,
      isKill: false,
      notes: ''
    });
    this.render(false);
  }

  /**
   * Commit all parsed events into the active session ledger
   */
  async _commitBatch() {
    if (!this.parsedEvents.length) {
      if (typeof ui !== 'undefined' && ui.notifications?.warn) {
        ui.notifications.warn('There are no parsed events to import.');
      }
      return;
    }

    const created = await DCCSessionEngine.batchCreateEvents(this.parsedEvents, this.sessionId);

    if (typeof ui !== 'undefined' && ui.notifications?.info) {
      ui.notifications.info(`⚡ Successfully imported ${created.length} rolls & events to the session!`);
    }

    // Refresh any open Session Manager windows
    DCCSessionEngine._refreshOpenWindows();

    // Reset and close
    this.rawText = '';
    this.parsedEvents = [];
    await this.close();
  }
}
