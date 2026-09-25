# Crawler Token Selection Action HUDs

The Dungeon Crawler Carl RPG system provides real-time, interactive Heads-Up Displays (HUDs) whenever a **Crawler** token is selected on the canvas.

---

## 1. Overview & Mechanics

When a token representing an actor of type `crawler` is controlled by a player or GM:
1. **Hotbar Action HUD**: Appears directly above Foundry's bottom macro bar (`#hotbar`).
2. **Left Action Panel HUD**: Appears on the left side of the screen, dynamically docked directly below the Scene Navigation bar (`#navigation` / `#scene-list`).

When the selection changes to a non-crawler token (such as a Mob, Vehicle, or NPC) or when all tokens are deselected, both HUDs automatically close and clean up.

---

## 2. Crawler Hotbar HUD (Above Macro Bar)

Located in `#ui-bottom` directly above the standard Foundry macro hotbar (`#hotbar`), the Hotbar HUD mirrors the 10 quick-access slots configured in the character sheet's Hotlist (`actor.system.hotlist`):

- **10 Dedicated Slots**: Numbered 1 through 10, aligning with the hotbar slots below.
- **Usable Actions by Item Type**:
  - **Attacks**: **Hit** (d20 attack check vs target DC) and **Dmg** (rolls damage packet with typed breakdown).
  - **Spells**: **Cast** (verifies and deducts MP) and **Dmg** (scales rank damage and displays damage chat card).
  - **Gear**: **Equip / Unequip** toggle updating `item.system.equipped`.
  - **Loot / Items**: **Use** triggering consumables or inventory items.
  - **Skills**: **Hit / Dmg** for combat skills or **Roll** for utility skills.
- **Direct Interaction**:
  - **Quick Clear**: An `x` button on populated slots allows clearing the slot assignment with one click.
  - **Drag-and-Drop**: Drag any item from compendiums, world items, or the character sheet directly onto a slot box to assign it.
- **Collapsible Header**: A sleek DCC header bar with the crawler's name and a toggle button to minimize or expand the bar as needed.

---

## 3. Left Action Panel HUD (Below Scene Navigation)

Docked dynamically below the Scene Navigation bar on the left side of the screen, this panel provides immediate access to all active combat actions:

- **Attacks Section**:
  - Automatically indexes all attack items (`item.type === 'attack'`) on the crawler.
  - Displays attack icon, name, damage formula, and quick **Hit** and **Dmg** action buttons.
- **Active Skills Section**:
  - Automatically indexes all non-passive skills on the crawler.
  - **Automatic Passive Filtering**: Excludes all passive skills (skills marked with `category: "Passive"`, `checkType` containing "passive" or "no roll", or `skillType: "Passive"`).
  - Displays skill icon, name, modified rank, and total modifier.
  - Provides **Check / Hit** and **Dmg** buttons for combat skills and **Roll** buttons for utility skills.
- **Dynamic Docking**:
  - Binds to `renderSceneNavigation` and window resize hooks to ensure it always docks cleanly directly beneath the scene list tabs.
- **Scrollable & Collapsible**:
  - Scrollable content area with custom DCC scrollbar, capped at `calc(100vh - 120px)`.
  - Toggle button on the header to minimize the panel when extra canvas space is required.

---

## 4. Lifecycle & Reactivity (`DCCCrawlerTokenHUD`)

The HUD subsystem is managed by `DCCCrawlerTokenHUD` (`src/apps/crawler-token-hud.mjs`):
- **Hook Integration**:
  - `controlToken`: Automatically triggers upon token selection or deselection.
  - `updateActor`: Re-renders HUDs in real time when the crawler's attributes, abilities, or hotlist change.
  - `createItem`, `updateItem`, `deleteItem`: Re-renders HUDs when weapons, spells, skills, or items change.
  - `deleteToken`: Closes HUDs if the controlled token is deleted from the canvas.
  - `canvasReady`: Synchronizes HUDs with canvas state on scene changes or canvas loads.

---

## 5. Developer & Macro Access

The HUD system is exposed under `window.carl`:
```javascript
// Access master token HUD manager
window.carl.tokenHUD;

// Inspect currently active actor and token
window.carl.tokenHUD.activeActor;
window.carl.tokenHUD.activeToken;

// Manually open or test HUDs
window.carl.openHotbarHUD(actor, token);
window.carl.openActionHUD(actor, token);
```
