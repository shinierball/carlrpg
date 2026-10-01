# Dungeon Crawler Carl RPG — Crawler Countdown Clock HUD

The **Crawler Countdown Clock HUD** (`DCCCrawlerClockHUD`) is a floating scene widget anchored directly beneath the scene navigation bar and docked immediately to the right of the Floor Collapse Clock (`#dcc-floor-clock-hud`). It tracks the total number of surviving crawlers remaining in the World Dungeon, bringing the ominous LitRPG reality of Dungeon Crawler Carl to life for both GMs and players.

---

## 🧭 Visual Layout & Docking Behavior

- **Docked Position**: Rendered side-by-side with the Floor Collapse Clock. The widget's position dynamically queries the bounding rectangle of `#dcc-floor-clock-hud` and anchors 8px to its right.
- **Dynamic Synchronization**: When the Floor Collapse Clock toggles between expanded and collapsed states, or when scene navigation changes, the Crawler Countdown Clock automatically shifts to maintain its docked alignment without overlapping.
- **DCC Aesthetic**: Features high-contrast dark theme glassmorphism (`rgba(18, 18, 22, 0.95)`), a vibrant crimson border (`#c0392b` / `#e74c3c`), a glowing group icon (`fa-solid fa-users`), and Oswald typography.

---

## 👥 Display States & Controls

### 1. Collapsed Mode (Pill Badge)
- Minimizes screen footprint to an unobtrusive pill badge.
- Displays the `fa-users` icon and formatted surviving crawler count (e.g. `12,842,100`).
- Clicking anywhere on the pill expands the HUD into full control mode.

### 2. Expanded Mode (Full Readout & GM Controls)
- **Header**: Features the `[SURVIVING]` badge and `Crawler Count` title.
- **Player View**: Clean, readable LitRPG counter showing the exact number of remaining crawlers alive in the dungeon (e.g., `12,842,100 CRAWLERS`).
- **GM Controls**:
  - **Quick Delta Decrement Buttons**:
    - `-10k`: Floor-wide events or mega-boss casualties.
    - `-1k`: Major dungeon hazards or faction clashes.
    - `-100`: Mob ambushes or trap triggers.
    - `-1`: Individual crawler death.
  - **Direct Numeric Input**: Editable text field supporting both standard numbers and comma-formatted values (`12,842,100`). Pressing `Enter` or changing focus updates the world setting and re-renders all open views.
  - **Quick Delta Increment Buttons**:
    - `+1`, `+100`, `+1k`, `+10k` for easy undo or adjustments.
  - **Minimize Button**: Chevron button to return to the compact collapsed pill.

---

## ⚙️ Programmatic API & System Settings

### Setting Registration
- **Module**: `carl-rpg`
- **Key**: `crawlerCount`
- **Scope**: `world`
- **Default**: `13000000` (13 million crawlers)

### API Methods
Both `DCCActor` (static and instance), `CONFIG.DCC`, and `window.carl` expose helpers:

```javascript
// Retrieve current surviving crawler count
DCCActor.getCrawlerCount(); // => 12842100

// Set crawler count
await DCCActor.setCrawlerCount(12500000);

// Decrement crawler count (e.g. when crawlers die)
await DCCActor.decrementCrawlerCount(1); // => 12499999
await DCCActor.decrementCrawlerCount(100); // => 12499899

// Increment crawler count
await DCCActor.incrementCrawlerCount(50); // => 12499949

// Open / re-render HUD programmatically
DCCCrawlerClockHUD.get().render();
```

---

## 🧪 Automated Testing
Verified via `tests/crawler-clock-hud.test.mjs`:
- Global crawler count persistence, default values, and non-negative clamping.
- Number and string parsing with commas.
- Singleton instance and default options.
- Fallback HTML generation for GM vs player and collapsed vs expanded states.
- Docked positioning calculations right next to `#dcc-floor-clock-hud`.
- DOM event handlers (collapse toggle, direct input change, delta adjustments).
- Crawler sheet `getData` context inclusion.
