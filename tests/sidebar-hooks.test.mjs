import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import './setup.mjs';
import '../src/dcc.mjs';

describe('DCC RPG Sidebar Directory Hooks & Foundry v13 HTMLElement Compatibility', () => {

  describe('1. renderItemDirectory Hook', () => {
    test('handles raw HTMLElement without throwing "html.find is not a function"', () => {
      // Create an HTMLElement structure
      const mockElement = {
        nodeType: 1,
        querySelector: (sel) => null,
        querySelectorAll: (sel) => []
      };

      assert.doesNotThrow(() => {
        globalThis.Hooks.callAll('renderItemDirectory', { element: mockElement }, mockElement);
      });
    });

    test('handles jQuery wrapped element without throwing', () => {
      const $mock = globalThis.$({
        dataset: {}
      });

      assert.doesNotThrow(() => {
        globalThis.Hooks.callAll('renderItemDirectory', { element: $mock }, $mock);
      });
    });
  });

  describe('2. renderActorDirectory Hook', () => {
    test('handles raw HTMLElement without throwing', () => {
      const mockElement = {
        nodeType: 1,
        querySelector: (sel) => null,
        querySelectorAll: (sel) => []
      };

      assert.doesNotThrow(() => {
        globalThis.Hooks.callAll('renderActorDirectory', { element: mockElement }, mockElement);
      });
    });
  });

  describe('3. renderSidebarTab Hook', () => {
    test('handles raw HTMLElement for actors and items tabs', () => {
      const mockElement = {
        nodeType: 1,
        querySelector: (sel) => null,
        querySelectorAll: (sel) => []
      };

      assert.doesNotThrow(() => {
        globalThis.Hooks.callAll('renderSidebarTab', { tabName: 'actors', element: mockElement }, mockElement);
        globalThis.Hooks.callAll('renderSidebarTab', { tabName: 'items', element: mockElement }, mockElement);
      });
    });
  });

  describe('4. renderCombatTracker Hook', () => {
    test('handles raw HTMLElement without throwing', () => {
      const mockElement = {
        nodeType: 1,
        querySelector: (sel) => null,
        querySelectorAll: (sel) => []
      };

      assert.doesNotThrow(() => {
        globalThis.Hooks.callAll('renderCombatTracker', { element: mockElement }, mockElement, {});
      });
    });
  });
});
