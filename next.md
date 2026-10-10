# Next Tasks

All previous tasks completed:
- [x] **Accurate Attack To-Hit Formula Display**: The evaluated to-hit formula (e.g. `1d20 + 14` or `2d20kl + 4`) is now accurately displayed on character sheets with full context tooltips and custom weapon skill resolution.
- [x] **Tag System & Content Creation Journal Guide**: Created the official 7-page in-game Journal Entry (`CarlRPG — Tag System & Content Creation Guide`), automated world creation hook via `ensureTagSystemJournal()`, `carl.openTagGuide()` macro, Tag Manager `📖 Tag Guide` UI button, and compendium pack.
- [x] **Tag-Driven Effects Engine, Structured Item Grants & 3.2.0 Migrations**: Reworked consumables (mana & health potions), damage reduction, and item definitions granting stats, skills, spells, and tag-query bonuses to leverage the Unified Tag System (`resource.*`, `element.*`, `action.*`) without name matching or regex. Implemented comprehensive 3.2.0 world and compendium item migration pipeline (`migrateWorld320()`) and rebuilt all packs.
