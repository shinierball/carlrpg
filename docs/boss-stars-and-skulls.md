# Public Notoriety: Boss Stars & Crawler Skulls

In the *Dungeon Crawler Carl Roleplaying Game*, the Dungeon AI ensures everyone knows who the heavy hitters and cold-blooded killers are. When a crawler defeats a boss or eliminates another crawler in PvP, public notoriety badges are pinned directly to their name for all crawlers to see.

---

## 1. Boss Level & Star Tier Hierarchy

Boss stars are color-coded based on the tier of boss defeated, representing their difficulty and dungeon scope:

| Star Tier | Boss Level | Dungeon Scope | Color Code | Visual Effects |
| :--- | :--- | :--- | :--- | :--- |
| **Bronze** | Neighborhood Boss | Local outpost / sub-level minion leader | `#cd7f32` | Warm bronze sheen |
| **Silver** | Borough Boss | Sector / district commander | `#dcdde1` | Polished silver steel glint |
| **Gold** | City Boss | Major zone guardian | `#f1c40f` | Radiant gold halo |
| **Platinum** | Country Boss | Continental / realm tyrant | `#00d2d3` | Icy platinum cyan shimmer |
| **Legendary** | Floor Boss | End-of-floor staircase guardian | `#e67e22` | Molten fiery pulse |
| **Celestial** | Dungeon Boss | Core deity / dungeon sovereign | `#9b59b6` | Cosmic violet prismatic aura |
| **Skull** | Slain Crawler | Fellow crawler eliminated (PvP) | `#ecf0f1` | Bone-white with crimson shadow |

---

## 2. Public Display Touchpoints

The badges are visible across all primary Foundry VTT UI surfaces where crawlers interact:

1. **Crawler Character Sheet**:
   - Prominently rendered next to the Crawler's Name in the Page 1 Core header.
   - Fully interactive Trophy Room in **Tab 6 (Achievements & Trophy Room)** with count adjustments, boss logs, crawler logs, and manual kill recording dialogs.
2. **Combat Tracker**:
   - Beside each crawler combatant's name in `DCCCombatTracker`, giving full visibility during encounters.
3. **Chat Message Headers & Cards**:
   - Appended to the sender name on attack rolls, spell casts, skill checks, and general chat messages.
4. **Token Nameplates**:
   - Plain text unicode representation (`★` and `💀`) formatted for token nameplates and titles.

---

## 3. Automated & Manual Tracking

### Automated Lethal Damage Tracking
- When lethal damage drops a Mob with a Boss classification to 0 HP, `DCCCombatMetrics` automatically identifies the boss tier and calls `attackerActor.recordBossKill()`.
- When lethal damage drops a fellow Crawler to 0 HP, `DCCCombatMetrics` calls `attackerActor.recordCrawlerKill()`.
- The Dungeon AI broadcasts a celebratory (or chilling) public announcement card to the chat log.

### Manual Adjustments & GM Overrides
- Players and GMs can use the **[+ / -]** step buttons on Tab 6 to adjust tier counts.
- The **[+ Record Boss Kill]** and **[+ Record Crawler Kill]** buttons open custom Dialogs to record past or out-of-combat kills.
- Individual entries in the Boss Kill Log and Crawler Kill Log can be deleted, automatically updating the corresponding totals.

---

## 4. Data Model Schema

Under `system.trophies`:
```json
{
  "bosses": {
    "bronze": 0,
    "silver": 0,
    "gold": 0,
    "platinum": 0,
    "legendary": 0,
    "celestial": 0
  },
  "bossLog": [
    {
      "id": "bkill-abc123",
      "name": "Goblin Chief",
      "tier": "bronze",
      "bossLevel": "Neighborhood Boss",
      "floor": "1st Floor",
      "date": "2026-09-27"
    }
  ],
  "crawlers": {
    "count": 0
  },
  "crawlerLog": [
    {
      "id": "ckill-xyz789",
      "name": "Frank",
      "crawlerNumber": "#4091",
      "floor": "2nd Floor",
      "date": "2026-09-27"
    }
  ]
}
```
