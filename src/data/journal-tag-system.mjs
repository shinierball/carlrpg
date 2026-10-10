/**
 * CarlRPG — Tag System & Content Creation Guide
 *
 * Official multi-page in-game Journal Entry and reference documentation
 * explaining the data-driven Unified Tagging System, item creation,
 * secondary skill mechanics, favored spells, and structured grants.
 */

export const TAG_SYSTEM_JOURNAL_DATA = {
  name: "CarlRPG — Tag System & Content Creation Guide",
  flags: {
    "carl-rpg": {
      guideKey: "tagSystemGuide",
      version: "3.0.1"
    }
  },
  pages: [
    {
      name: "1. Overview & Tag Taxonomy",
      type: "text",
      title: { show: true, level: 1 },
      text: {
        format: 1,
        content: `
<div class="dcc-journal-page" style="font-family: var(--font-primary, sans-serif); line-height: 1.5; color: #222;">
  <h2 style="font-family: 'Oswald', sans-serif; text-transform: uppercase; color: #c0392b; border-bottom: 2px solid #c0392b; padding-bottom: 4px; margin-top: 0;">
    CarlRPG 3.0.0 — Unified Tagging Architecture
  </h2>
  <p>
    Welcome to the <strong>CarlRPG Tagging System</strong>! In CarlRPG, all game mechanics, weapon associations, technique activations, spell mana costs, and character progression are powered by <em>exact, namespaced tags</em> rather than hardcoded text, magic strings, or fragile regular expressions.
  </p>

  <div style="background: #eaf2f8; border-left: 4px solid #2980b9; padding: 10px 14px; margin: 12px 0; border-radius: 2px;">
    <strong style="color: #1b4f72;">Core Principle (Rule 0):</strong>
    CarlRPG assumes that players and GMs will constantly invent custom items, races, classes, and spells. Every mechanic relies on querying structured data tags (e.g. <code>element.fire</code>, <code>weapon.shotgun</code>) so that user-created content immediately interacts seamlessly with existing rules.
  </div>

  <h3 style="font-family: 'Oswald', sans-serif; text-transform: uppercase; color: #111; margin-top: 16px;">
    Tag Syntax & Notation
  </h3>
  <p>
    All tags follow the lowercase, dot-separated schema: <code>&lt;namespace&gt;.&lt;identifier&gt;</code>. Multi-word identifiers use hyphens (e.g., <code>rule.requires-weapon</code>, <code>weaponClass.two-handed</code>).
  </p>

  <h3 style="font-family: 'Oswald', sans-serif; text-transform: uppercase; color: #111; margin-top: 16px;">
    The 12 Official Tag Namespaces
  </h3>
  <table style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px;">
    <thead>
      <tr style="background: #2c3e50; color: #fff; font-family: 'Oswald', sans-serif; text-transform: uppercase; text-align: left;">
        <th style="padding: 6px 10px; border: 1px solid #1a252f;">Namespace</th>
        <th style="padding: 6px 10px; border: 1px solid #1a252f;">Purpose & Description</th>
        <th style="padding: 6px 10px; border: 1px solid #1a252f;">Examples</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background: #fdfaf2; border-bottom: 1px solid #e0d8c3;">
        <td style="padding: 6px 10px; font-weight: bold; font-family: monospace;">kind</td>
        <td style="padding: 6px 10px;">Primary entity type in Foundry VTT</td>
        <td style="padding: 6px 10px;"><code>kind.gear</code>, <code>kind.skill</code>, <code>kind.spell</code>, <code>kind.class</code>, <code>kind.race</code></td>
      </tr>
      <tr style="background: #fff; border-bottom: 1px solid #e0d8c3;">
        <td style="padding: 6px 10px; font-weight: bold; font-family: monospace;">action</td>
        <td style="padding: 6px 10px;">Operational category and action economy behavior</td>
        <td style="padding: 6px 10px;"><code>action.attack</code>, <code>action.passive</code>, <code>action.heal</code>, <code>action.interrupt</code></td>
      </tr>
      <tr style="background: #fdfaf2; border-bottom: 1px solid #e0d8c3;">
        <td style="padding: 6px 10px; font-weight: bold; font-family: monospace;">element</td>
        <td style="padding: 6px 10px;">Damage type, spell school, and elemental affinity</td>
        <td style="padding: 6px 10px;"><code>element.fire</code>, <code>element.ice</code>, <code>element.acid</code>, <code>element.poison</code>, <code>element.electric</code>, <code>element.holy</code></td>
      </tr>
      <tr style="background: #fff; border-bottom: 1px solid #e0d8c3;">
        <td style="padding: 6px 10px; font-weight: bold; font-family: monospace;">archetype</td>
        <td style="padding: 6px 10px;">Core character class role granted to crawlers</td>
        <td style="padding: 6px 10px;"><code>archetype.mage</code>, <code>archetype.fighter</code>, <code>archetype.cleric</code>, <code>archetype.rogue</code></td>
      </tr>
      <tr style="background: #fdfaf2; border-bottom: 1px solid #e0d8c3;">
        <td style="padding: 6px 10px; font-weight: bold; font-family: monospace;">favored</td>
        <td style="padding: 6px 10px;">Favored class archetype for spells (exempt from +1 MP penalty)</td>
        <td style="padding: 6px 10px;"><code>favored.mage</code>, <code>favored.cleric</code>, <code>favored.druid</code></td>
      </tr>
      <tr style="background: #fff; border-bottom: 1px solid #e0d8c3;">
        <td style="padding: 6px 10px; font-weight: bold; font-family: monospace;">weapon</td>
        <td style="padding: 6px 10px;">Specific weapon family or weapon proficiency</td>
        <td style="padding: 6px 10px;"><code>weapon.bow</code>, <code>weapon.shotgun</code>, <code>weapon.sword</code>, <code>weapon.dagger</code>, <code>weapon.unarmed</code></td>
      </tr>
      <tr style="background: #fdfaf2; border-bottom: 1px solid #e0d8c3;">
        <td style="padding: 6px 10px; font-weight: bold; font-family: monospace;">weaponClass</td>
        <td style="padding: 6px 10px;">Broad weapon classification category</td>
        <td style="padding: 6px 10px;"><code>weaponClass.melee</code>, <code>weaponClass.ranged</code>, <code>weaponClass.unarmed</code>, <code>weaponClass.natural</code></td>
      </tr>
      <tr style="background: #fff; border-bottom: 1px solid #e0d8c3;">
        <td style="padding: 6px 10px; font-weight: bold; font-family: monospace;">weaponProp</td>
        <td style="padding: 6px 10px;">Physical handling traits and wield properties</td>
        <td style="padding: 6px 10px;"><code>weaponProp.two-handed</code>, <code>weaponProp.reach</code>, <code>weaponProp.versatile</code>, <code>weaponProp.finesse</code></td>
      </tr>
      <tr style="background: #fdfaf2; border-bottom: 1px solid #e0d8c3;">
        <td style="padding: 6px 10px; font-weight: bold; font-family: monospace;">skillGroup</td>
        <td style="padding: 6px 10px;">Discipline category for skill checks and training</td>
        <td style="padding: 6px 10px;"><code>skillGroup.combat</code>, <code>skillGroup.magic</code>, <code>skillGroup.survival</code>, <code>skillGroup.crafting</code></td>
      </tr>
      <tr style="background: #fff; border-bottom: 1px solid #e0d8c3;">
        <td style="padding: 6px 10px; font-weight: bold; font-family: monospace;">technique</td>
        <td style="padding: 6px 10px;">Target weapon or combat style for specialized techniques</td>
        <td style="padding: 6px 10px;"><code>technique.unarmed</code>, <code>technique.pugilism</code>, <code>technique.wrasslin</code></td>
      </tr>
      <tr style="background: #fdfaf2; border-bottom: 1px solid #e0d8c3;">
        <td style="padding: 6px 10px; font-weight: bold; font-family: monospace;">rule</td>
        <td style="padding: 6px 10px;">Engine-level mechanical constraints and triggers</td>
        <td style="padding: 6px 10px;"><code>rule.requires-weapon</code>, <code>rule.no-damage-effects</code>, <code>rule.cooldown-hours</code></td>
      </tr>
      <tr style="background: #fff; border-bottom: 1px solid #e0d8c3;">
        <td style="padding: 6px 10px; font-weight: bold; font-family: monospace;">id</td>
        <td style="padding: 6px 10px;">Canonical unique item identifier for references and grants</td>
        <td style="padding: 6px 10px;"><code>id.skill.aiming</code>, <code>id.spell.fireball</code>, <code>id.class.boring-ol-mage</code></td>
      </tr>
      <tr style="background: #fdfaf2; border-bottom: 1px solid #e0d8c3;">
        <td style="padding: 6px 10px; font-weight: bold; font-family: monospace;">custom</td>
        <td style="padding: 6px 10px;">User-defined world tags for unique campaign mechanics</td>
        <td style="padding: 6px 10px;"><code>custom.hellfire-charge</code>, <code>custom.cybernetic-implant</code></td>
      </tr>
    </tbody>
  </table>
</div>
`
      }
    },
    {
      name: "2. Tag Manager & Item Tag Editor",
      type: "text",
      title: { show: true, level: 1 },
      text: {
        format: 1,
        content: `
<div class="dcc-journal-page" style="font-family: var(--font-primary, sans-serif); line-height: 1.5; color: #222;">
  <h2 style="font-family: 'Oswald', sans-serif; text-transform: uppercase; color: #c0392b; border-bottom: 2px solid #c0392b; padding-bottom: 4px; margin-top: 0;">
    Managing Tags in Foundry VTT
  </h2>
  <p>
    CarlRPG provides two synchronized interfaces for managing tags: the <strong>Global Tag Manager & Taxonomy</strong> and the <strong>Item Sheet Tag Editor</strong>.
  </p>

  <h3 style="font-family: 'Oswald', sans-serif; text-transform: uppercase; color: #111; margin-top: 16px;">
    1. The Global Tag Manager (<code>DCCTagManager</code>)
  </h3>
  <p>
    To open the Tag Manager at any time:
  </p>
  <ul>
    <li>Navigate to the <strong>Items Directory</strong> in the Foundry sidebar and click the <strong style="color: #c0392b;"><i class="fa-solid fa-tags"></i> Tag Taxonomy</strong> header button.</li>
    <li>Or execute in the browser console / macro: <code>carl.openTagManager()</code>.</li>
  </ul>
  <p>
    <strong>Key Features:</strong>
  </p>
  <ul>
    <li><strong>Namespace Filtering:</strong> Click any namespace tab (<code>kind</code>, <code>element</code>, <code>weapon</code>, <code>rule</code>, etc.) to immediately isolate matching tags.</li>
    <li><strong>Real-Time Search:</strong> Type in the search bar to filter by tag ID, label, or description.</li>
    <li><strong>Live Usage Counts:</strong> The engine queries <code>tagIndex</code> in real time, displaying exactly how many world and compendium items currently use each tag.</li>
    <li><strong>Custom Tag Registration:</strong> Scroll to the bottom of the window to register new world tags with custom labels, auto-persisted to your world settings.</li>
  </ul>

  <h3 style="font-family: 'Oswald', sans-serif; text-transform: uppercase; color: #111; margin-top: 16px;">
    2. Item Sheet Tag Editor & 1-Click Assignment
  </h3>
  <p>
    Every Item sheet in CarlRPG features a dedicated <strong>Tag Editor</strong> tab and a Tag Manager header action:
  </p>
  <ol>
    <li>Open any Item sheet (Weapon, Armor, Spell, Skill, Class, Race, Buff, Loot).</li>
    <li>Click the <strong>Tags</strong> tab on the sheet to view:
      <ul>
        <li><strong style="color: #27ae60;">Explicit Tags:</strong> Assigned tags that you can add or remove via input.</li>
        <li><strong style="color: #2980b9;">Derived Tags:</strong> Auto-computed tags inferred from item type, damage parts, and categories (e.g. <code>element.fire</code> from a Fire damage packet).</li>
        <li><strong style="color: #8e44ad;">Identity Tags:</strong> Unique canonical ID tag (e.g. <code>id.gear.boom-stick</code>).</li>
      </ul>
    </li>
    <li>Click the <strong style="color: #c0392b;"><i class="fa-solid fa-tags"></i> Manage Tags</strong> button in the Item sheet header:
      <ul>
        <li>The Tag Manager opens bound directly to your active item.</li>
        <li>An <strong>Apply</strong> checkbox column appears in the tag list.</li>
        <li>Click any checkbox to immediately assign or unassign the tag on your item — changes save instantaneously!</li>
      </ul>
    </li>
  </ol>
</div>
`
      }
    },
    {
      name: "3. Creating Custom Weapons & Gear",
      type: "text",
      title: { show: true, level: 1 },
      text: {
        format: 1,
        content: `
<div class="dcc-journal-page" style="font-family: var(--font-primary, sans-serif); line-height: 1.5; color: #222;">
  <h2 style="font-family: 'Oswald', sans-serif; text-transform: uppercase; color: #c0392b; border-bottom: 2px solid #c0392b; padding-bottom: 4px; margin-top: 0;">
    Creating Custom Weapons with Tags
  </h2>
  <p>
    When creating a custom weapon in CarlRPG, you combine <strong>weapon classification tags</strong>, <strong>damage packets</strong>, and <strong>associated skills</strong> to give the weapon full system automation.
  </p>

  <h3 style="font-family: 'Oswald', sans-serif; text-transform: uppercase; color: #111; margin-top: 16px;">
    Walkthrough: The "Goblin Boom Stick"
  </h3>
  <p>
    Let's create a custom sawed-off incendiary weapon named <em>"Goblin Boom Stick"</em>:
  </p>
  <div style="background: #fdfaf2; border: 1px solid #d4cbb3; padding: 12px; border-radius: 4px; margin: 12px 0;">
    <h4 style="margin-top: 0; color: #c0392b; font-family: 'Oswald', sans-serif;">Item Configuration:</h4>
    <ul>
      <li><strong>Type:</strong> Gear (Slot: <code>hands</code>, Hands required: <code>2</code>)</li>
      <li><strong>Weapon Category:</strong> <code>ranged</code></li>
      <li><strong>Weapon Type:</strong> <code>shotgun</code></li>
      <li><strong>Associated Skills (<code>system.associatedSkills</code>):</strong> <code>Shotgun, Aiming</code></li>
      <li><strong>Damage Parts:</strong>
        <ul>
          <li>Part 1: <code>1d6 Fire</code> (Incendiary payload)</li>
        </ul>
      </li>
      <li><strong>Tags:</strong>
        <code style="background: #eee; padding: 2px 4px;">kind.gear</code>,
        <code style="background: #eee; padding: 2px 4px;">weaponClass.ranged</code>,
        <code style="background: #eee; padding: 2px 4px;">weapon.shotgun</code>,
        <code style="background: #eee; padding: 2px 4px;">weaponProp.two-handed</code>,
        <code style="background: #eee; padding: 2px 4px;">element.fire</code>
      </li>
    </ul>
  </div>

  <h3 style="font-family: 'Oswald', sans-serif; text-transform: uppercase; color: #111; margin-top: 16px;">
    How the Engine Resolves Weapon Attacks
  </h3>
  <p>
    When a crawler equips the <em>Goblin Boom Stick</em>:
  </p>
  <ol>
    <li>
      <strong>Primary Skill vs Auxiliary Skill:</strong>
      The system runs <code>actor._resolveWeaponSkills()</code>. Because <em>Shotgun</em> is a combat attack skill (carrying <code>rule.requires-weapon</code> and <code>action.attack</code>), it becomes the <strong>Primary Matching Skill</strong>.
      Because <em>Aiming</em> is tagged with <code>action.passive</code>, it is identified as an <strong>Auxiliary Skill</strong>.
    </li>
    <li>
      <strong>Strictly Additive Damage Scaling:</strong>
      Unlike traditional systems that overwrite dice, CarlRPG uses <em>strictly additive</em> damage calculation:
      <pre style="background: #2c3e50; color: #ecf0f1; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
Total Damage = Skill Base Damage (Shotgun: 3d10 Piercing)
             + Weapon Item Damage (Boom Stick: 1d6 Fire)
             + Official Rank Damage Die (Rank 10: +1d10)
             + Auxiliary Skill Damage (Aiming Rank 5+: +2d4)
             + Stat Modifier (DEX Mod)
      </pre>
      All typed packets roll and display in chat cards with distinct damage types!
    </li>
    <li>
      <strong>To-Hit Formula Display:</strong>
      The crawler sheet displays the full formula: <code>1d20 + 14</code> (DEX Mod +4 + Shotgun Rank 10).
    </li>
  </ol>
</div>
`
      }
    },
    {
      name: "4. Secondary Skills & Disadvantage Offsets",
      type: "text",
      title: { show: true, level: 1 },
      text: {
        format: 1,
        content: `
<div class="dcc-journal-page" style="font-family: var(--font-primary, sans-serif); line-height: 1.5; color: #222;">
  <h2 style="font-family: 'Oswald', sans-serif; text-transform: uppercase; color: #c0392b; border-bottom: 2px solid #c0392b; padding-bottom: 4px; margin-top: 0;">
    Secondary Skills & Complex Interactions
  </h2>
  <p>
    In CarlRPG, characters often possess secondary or passive skills that modify attack rolls and damage output under specific conditions.
  </p>

  <h3 style="font-family: 'Oswald', sans-serif; text-transform: uppercase; color: #111; margin-top: 16px;">
    The "Aiming" Skill Mechanics
  </h3>
  <p>
    The canonical <em>Aiming</em> skill (notes: <em>"Used only with Ranged Attacks. Add Ranks to Attack check if made with Disadvantage. On Success, add 1d4 to damage."</em>) illustrates how the tag engine works:
  </p>
  <ul>
    <li>
      <strong>Disadvantage To-Hit Offset:</strong>
      When a ranged attack is rolled at disadvantage (e.g., target has partial cover, or attacker is blinded, or wields a two-handed weapon in one hand), the roll die becomes <code>2d20kl</code> (keep lowest).
      The engine detects <code>action.passive</code> on <em>Aiming</em> and adds the crawler's Aiming rank directly to the to-hit total:
      <div style="background: #2c3e50; color: #ecf0f1; padding: 8px 12px; border-radius: 4px; font-family: monospace; font-size: 13px; margin: 8px 0;">
        Normal Attack: 1d20 + 9 (DEX +4 + Bow Rank 5)<br>
        Disadvantage Attack: 2d20kl + 12 (DEX +4 + Bow Rank 5 + Aiming Rank 3)
      </div>
    </li>
    <li>
      <strong>Success Damage Bonus:</strong>
      Whenever the attack hits, Aiming automatically appends bonus damage dice based on its rank tier:
      <ul>
        <li>Rank 1–4: <code>+1d4 Piercing</code></li>
        <li>Rank 5–9: <code>+2d4 Piercing</code></li>
        <li>Rank 10–14: <code>+3d4 Piercing</code></li>
        <li>Rank 15+: <code>+4d4 Piercing</code></li>
      </ul>
    </li>
  </ul>

  <h3 style="font-family: 'Oswald', sans-serif; text-transform: uppercase; color: #111; margin-top: 16px;">
    Equipped Weapon Filtering (<code>rule.requires-weapon</code>)
  </h3>
  <p>
    To prevent character sheets from cluttering with dozens of attack buttons for weapons the character is not carrying:
  </p>
  <ul>
    <li>All weapon skills (e.g., <em>Rapier</em>, <em>Shotgun</em>, <em>Crossbow</em>) are tagged with <code>rule.requires-weapon</code>.</li>
    <li>If a crawler has Rank 15 in <em>Shotgun</em> but has no shotgun equipped (or has it stowed in their backpack), <strong>no shotgun attack is synthesized</strong> on the sheet.</li>
    <li><strong>Unarmed & Natural Attacks:</strong> Skills tagged with <code>weaponClass.unarmed</code> or <code>weaponClass.natural</code> (like <em>Pugilism</em>, <em>Bite</em>, <em>Claws</em>) do NOT require an equipped weapon and remain available at all times.</li>
  </ul>

  <h3 style="font-family: 'Oswald', sans-serif; text-transform: uppercase; color: #111; margin-top: 16px;">
    Items with Special Cooldown Grants
  </h3>
  <p>
    High-tier magical gear frequently grants a skill or spell that normal crawlers cannot acquire, balanced by strict cooldowns:
  </p>
  <div style="background: #fdfaf2; border-left: 4px solid #c0392b; padding: 10px 14px; margin: 8px 0;">
    <strong>Example: Iron Shell Bracers</strong><br>
    Grants the <em>Iron Shell</em> spell at Rank 15. In CarlRPG, items granting abilities impose a cooldown of <strong>2 hours per granted rank</strong>.
    Tagging the grant with <code>rule.cooldown-hours</code> calculates a 30-hour cooldown (15 ranks &times; 2 hours) tracked by the Session Manager.
  </div>
</div>
`
      }
    },
    {
      name: "5. Custom Spells & Favored Spell Costs",
      type: "text",
      title: { show: true, level: 1 },
      text: {
        format: 1,
        content: `
<div class="dcc-journal-page" style="font-family: var(--font-primary, sans-serif); line-height: 1.5; color: #222;">
  <h2 style="font-family: 'Oswald', sans-serif; text-transform: uppercase; color: #c0392b; border-bottom: 2px solid #c0392b; padding-bottom: 4px; margin-top: 0;">
    Custom Spells & Favored Archetypes
  </h2>
  <p>
    In CarlRPG, magic operates strictly under official DCC RPG mechanics:
    <strong>no spell slots, no cantrips, and no D&amp;D rules</strong>. All spells cost Mana Points (MP) and can be cast at will provided the crawler has sufficient MP.
  </p>

  <h3 style="font-family: 'Oswald', sans-serif; text-transform: uppercase; color: #111; margin-top: 16px;">
    The Favored Spell Tag System
  </h3>
  <p>
    Every spell belongs to one or more favored caster archetypes via <code>favored.&lt;archetype&gt;</code> tags:
  </p>
  <ul>
    <li><code>favored.mage</code> &rarr; Wizard, Sorcerer, Pyromancer, Boring Ol' Mage</li>
    <li><code>favored.cleric</code> &rarr; Priest, Paladin, War Priest, Crusader</li>
    <li><code>favored.druid</code> &rarr; Shaman, Warden, Nature Warden</li>
    <li><code>favored.rogue</code> &rarr; Desperado, Shadow Rogue, Trickster</li>
  </ul>

  <h3 style="font-family: 'Oswald', sans-serif; text-transform: uppercase; color: #111; margin-top: 16px;">
    The +1 MP Non-Favored Penalty Calculation
  </h3>
  <p>
    When a crawler casts a spell (via <code>actor.rollSpell(item)</code>):
  </p>
  <ol>
    <li>
      <strong>Reference Expansion:</strong> The tag engine expands <code>favored.mage</code> to match <code>archetype.mage</code> using <code>expandTagReferences()</code>.
    </li>
    <li>
      <strong>Caster Check:</strong> The engine inspects the crawler's active class archetype tags (<code>actor.getArchetypeTags()</code>).
    </li>
    <li>
      <strong>Penalty Evaluation:</strong>
      <ul>
        <li>If the crawler has a class and its archetype matches one of the spell's favored archetypes &rarr; <strong>Normal MP cost</strong> (e.g. 5 MP for Fireball).</li>
        <li>If the crawler has a class but does NOT match any favored archetype (e.g. a Fighter casting Fireball) &rarr; <strong>+1 MP Penalty</strong> (6 MP total).</li>
        <li><strong style="color: #27ae60;">Canonical Exemption:</strong> Classless crawlers (Levels 1–2 before class selection) and pet companions are <em>completely exempt</em> from the penalty and pay base MP cost!</li>
      </ul>
    </li>
  </ol>

  <h3 style="font-family: 'Oswald', sans-serif; text-transform: uppercase; color: #111; margin-top: 16px;">
    Walkthrough: Creating "Frostfire Lance"
  </h3>
  <div style="background: #fdfaf2; border: 1px solid #d4cbb3; padding: 12px; border-radius: 4px; margin: 12px 0;">
    <h4 style="margin-top: 0; color: #c0392b; font-family: 'Oswald', sans-serif;">Spell Setup:</h4>
    <ul>
      <li><strong>Name:</strong> Frostfire Lance</li>
      <li><strong>Type:</strong> <code>spell</code></li>
      <li><strong>MP Cost:</strong> 4 MP</li>
      <li><strong>Base Damage:</strong> <code>2d8</code> (Damage Type: <code>Cold</code>)</li>
      <li><strong>Extra Damage Parts:</strong> <code>1d6 Fire</code></li>
      <li><strong>Tags:</strong>
        <code style="background: #eee; padding: 2px 4px;">kind.spell</code>,
        <code style="background: #eee; padding: 2px 4px;">element.ice</code>,
        <code style="background: #eee; padding: 2px 4px;">element.fire</code>,
        <code style="background: #eee; padding: 2px 4px;">favored.mage</code>
      </li>
    </ul>
    <p style="margin-bottom: 0; font-size: 13px;">
      A Mage pays 4 MP. A Rogue or Fighter casting this pays 5 MP. A Level 1 classless crawler pays 4 MP.
    </p>
  </div>
</div>
`
      }
    },
    {
      name: "6. Custom Classes, Races & Structured Grants",
      type: "text",
      title: { show: true, level: 1 },
      text: {
        format: 1,
        content: `
<div class="dcc-journal-page" style="font-family: var(--font-primary, sans-serif); line-height: 1.5; color: #222;">
  <h2 style="font-family: 'Oswald', sans-serif; text-transform: uppercase; color: #c0392b; border-bottom: 2px solid #c0392b; padding-bottom: 4px; margin-top: 0;">
    Creating Custom Classes & Races with Structured Grants
  </h2>
  <p>
    In CarlRPG 3.0.0, Class and Race documents do not rely on fragile text descriptions to apply benefits. Instead, they define a <code>system.grants</code> array that automatically applies stats, skills, spells, and choices upon selection.
  </p>

  <h3 style="font-family: 'Oswald', sans-serif; text-transform: uppercase; color: #111; margin-top: 16px;">
    The Grant Kinds
  </h3>
  <table style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px;">
    <thead>
      <tr style="background: #2c3e50; color: #fff; font-family: 'Oswald', sans-serif; text-transform: uppercase; text-align: left;">
        <th style="padding: 6px 10px; border: 1px solid #1a252f;">Kind</th>
        <th style="padding: 6px 10px; border: 1px solid #1a252f;">Schema & Payload</th>
        <th style="padding: 6px 10px; border: 1px solid #1a252f;">Effect</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background: #fdfaf2; border-bottom: 1px solid #e0d8c3;">
        <td style="padding: 6px 10px; font-weight: bold; font-family: monospace;">stat</td>
        <td style="padding: 6px 10px;"><code>{ "kind": "stat", "stats": { "str": 4, "dex": 2, "int": -2 } }</code></td>
        <td style="padding: 6px 10px;">Modifies base unenhanced ability scores directly.</td>
      </tr>
      <tr style="background: #fff; border-bottom: 1px solid #e0d8c3;">
        <td style="padding: 6px 10px; font-weight: bold; font-family: monospace;">skill</td>
        <td style="padding: 6px 10px;"><code>{ "kind": "skill", "name": "Aiming", "rank": 2, "ref": "id.skill.aiming" }</code></td>
        <td style="padding: 6px 10px;">Grants or levels up the target skill by the specified rank.</td>
      </tr>
      <tr style="background: #fdfaf2; border-bottom: 1px solid #e0d8c3;">
        <td style="padding: 6px 10px; font-weight: bold; font-family: monospace;">spell</td>
        <td style="padding: 6px 10px;"><code>{ "kind": "spell", "name": "Fireball", "rank": 1, "ref": "id.spell.fireball" }</code></td>
        <td style="padding: 6px 10px;">Grants the specified spell to the character.</td>
      </tr>
      <tr style="background: #fff; border-bottom: 1px solid #e0d8c3;">
        <td style="padding: 6px 10px; font-weight: bold; font-family: monospace;">choice</td>
        <td style="padding: 6px 10px;"><code>{ "kind": "choice", "count": 1, "query": { "all": ["kind.spell"], "any": ["element.fire", "element.ice"] }, "rank": 2 }</code></td>
        <td style="padding: 6px 10px;">Prompts the player with an interactive modal to pick from items matching the Tag Query!</td>
      </tr>
      <tr style="background: #fdfaf2; border-bottom: 1px solid #e0d8c3;">
        <td style="padding: 6px 10px; font-weight: bold; font-family: monospace;">archetype</td>
        <td style="padding: 6px 10px;"><code>{ "kind": "archetype", "tags": ["archetype.mage"] }</code></td>
        <td style="padding: 6px 10px;">Assigns caster archetype tags to the crawler.</td>
      </tr>
    </tbody>
  </table>

  <h3 style="font-family: 'Oswald', sans-serif; text-transform: uppercase; color: #111; margin-top: 16px;">
    Tag Queries in Choice Grants
  </h3>
  <p>
    When a class allows a player to <em>"Choose any 1 Fire or Ice spell at Rank 2"</em>, you define a structured boolean query:
  </p>
  <pre style="background: #2c3e50; color: #ecf0f1; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
{
  "kind": "choice",
  "count": 1,
  "rank": 2,
  "query": {
    "all": ["kind.spell"],
    "any": ["element.fire", "element.ice"],
    "none": ["rule.secret-spell"]
  }
}
  </pre>
  <p>
    The engine automatically filters all world and compendium spells matching this criteria and presents them in the Level Up &amp; Class Selection dialog.
  </p>
</div>
`
      }
    },
    {
      name: "7. Rule Breaking & Engine Principles",
      type: "text",
      title: { show: true, level: 1 },
      text: {
        format: 1,
        content: `
<div class="dcc-journal-page" style="font-family: var(--font-primary, sans-serif); line-height: 1.5; color: #222;">
  <h2 style="font-family: 'Oswald', sans-serif; text-transform: uppercase; color: #c0392b; border-bottom: 2px solid #c0392b; padding-bottom: 4px; margin-top: 0;">
    Rule Breaking & Dungeon Crawler Carl Philosophy
  </h2>

  <div style="background: #f9ebea; border-left: 4px solid #c0392b; padding: 12px 16px; margin: 12px 0;">
    <h3 style="margin-top: 0; color: #962d22; font-family: 'Oswald', sans-serif; text-transform: uppercase;">
      "All rules will be broken. When players break the rules, they should be rewarded."
    </h3>
    <p style="margin-bottom: 0;">
      A fundamental tenet of the Dungeon Crawler Carl universe is that crawlers exploit exploits, find loophole combinations, and disrupt the system AI's expectations.
    </p>
  </div>

  <h3 style="font-family: 'Oswald', sans-serif; text-transform: uppercase; color: #111; margin-top: 16px;">
    System Design Guidelines for GMs & Creators
  </h3>
  <ul>
    <li>
      <strong>No Artificial Hard Gates:</strong>
      If a player creates a custom Class with 100 stat points instead of the standard 30, the system calculates and honors the exact values without crashing or throwing blocking validation errors.
    </li>
    <li>
      <strong>Strict CarlRPG Math Only:</strong>
      Never use D&amp;D math <code>(stat - 10) / 2</code> or proficiency bonuses. The system always maps stat scores through the official DCC Table (e.g., 10&ndash;19 &rarr; <code>+4</code>, 20&ndash;49 &rarr; <code>+5</code>, 50&ndash;99 &rarr; <code>+6</code>).
    </li>
    <li>
      <strong>No Negative Ability Modifiers:</strong>
      In CarlRPG, ability scores can never produce negative modifiers. Modifiers bottom out at <code>+0</code>.
    </li>
    <li>
      <strong>Evade DC:</strong>
      Evade is always calculated as <code>DEX Mod + Gear + Buffs</code>, and the target DC to hit a crawler is <code>10 + Foe DEX Mod + Floor Number</code>. It is never <code>10 + DEX Mod</code> as base armor class.
    </li>
    <li>
      <strong>Damage Bars:</strong>
      Crawlers have 10 separate damage bars of <code>CON Mod</code> HP each. Damage flows through bars sequentially, triggering bar break effects when exhausted.
    </li>
  </ul>

  <h3 style="font-family: 'Oswald', sans-serif; text-transform: uppercase; color: #111; margin-top: 16px;">
    Quick Reference API
  </h3>
  <table style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px;">
    <tbody>
      <tr style="background: #fdfaf2; border-bottom: 1px solid #e0d8c3;">
        <td style="padding: 6px 10px; font-weight: bold; font-family: monospace;">carl.openTagManager()</td>
        <td style="padding: 6px 10px;">Opens the interactive Tag Taxonomy and Management interface.</td>
      </tr>
      <tr style="background: #fff; border-bottom: 1px solid #e0d8c3;">
        <td style="padding: 6px 10px; font-weight: bold; font-family: monospace;">carl.openTagGuide()</td>
        <td style="padding: 6px 10px;">Opens this in-game Tag System &amp; Content Creation Journal Entry.</td>
      </tr>
      <tr style="background: #fdfaf2; border-bottom: 1px solid #e0d8c3;">
        <td style="padding: 6px 10px; font-weight: bold; font-family: monospace;">game.dcc.tags.find('element.fire')</td>
        <td style="padding: 6px 10px;">Queries the in-memory TagIndex for all items matching a tag.</td>
      </tr>
    </tbody>
  </table>
</div>
`
      }
    }
  ]
};

/**
 * Ensure the official Tag System Guide JournalEntry exists in the world.
 * If missing, creates it. If present, ensures pages are up to date.
 * @returns {Promise<JournalEntry|null>}
 */
export async function ensureTagSystemJournal() {
  const JournalEntryClass = CONFIG.JournalEntry?.documentClass
    ?? globalThis.foundry?.documents?.JournalEntry
    ?? globalThis.JournalEntry;

  if (!JournalEntryClass || !globalThis.game?.journal) {
    return null;
  }

  // Only GM users should attempt to create or populate world documents
  if (globalThis.game?.user && !globalThis.game.user.isGM) {
    const existing = globalThis.game.journal.find(j =>
      j.name === TAG_SYSTEM_JOURNAL_DATA.name ||
      j.flags?.["carl-rpg"]?.guideKey === "tagSystemGuide"
    );
    return existing || null;
  }

  let existing = null;
  if (typeof globalThis.game.journal.find === "function") {
    existing = globalThis.game.journal.find(j =>
      j.name === TAG_SYSTEM_JOURNAL_DATA.name ||
      j.flags?.["carl-rpg"]?.guideKey === "tagSystemGuide"
    );
  } else if (Array.isArray(globalThis.game.journal)) {
    existing = globalThis.game.journal.find(j =>
      j.name === TAG_SYSTEM_JOURNAL_DATA.name ||
      j.flags?.["carl-rpg"]?.guideKey === "tagSystemGuide"
    );
  }

  if (existing) {
    const pageCount = existing.pages?.size ?? (Array.isArray(existing.pages) ? existing.pages.length : 0);
    if (pageCount === 0 && typeof existing.createEmbeddedDocuments === "function") {
      try {
        await existing.createEmbeddedDocuments("JournalEntryPage", TAG_SYSTEM_JOURNAL_DATA.pages);
      } catch (err) {
        console.warn("DCC RPG | Could not populate pages for Tag System Journal:", err);
      }
    }
    return existing;
  }

  if (typeof JournalEntryClass.create === "function") {
    try {
      const entry = await JournalEntryClass.create(TAG_SYSTEM_JOURNAL_DATA, { renderSheet: false });
      return entry;
    } catch (err) {
      console.warn("DCC RPG | Could not create Tag System Journal:", err);
    }
  }

  return null;
}

/**
 * Opens and renders the Tag System Guide journal entry sheet.
 * @returns {Promise<JournalEntrySheet|null>}
 */
export async function openTagSystemJournal() {
  let entry = null;
  if (globalThis.game?.journal) {
    if (typeof globalThis.game.journal.find === "function") {
      entry = globalThis.game.journal.find(j =>
        j.name === TAG_SYSTEM_JOURNAL_DATA.name ||
        j.flags?.["carl-rpg"]?.guideKey === "tagSystemGuide"
      );
    } else if (Array.isArray(globalThis.game.journal)) {
      entry = globalThis.game.journal.find(j =>
        j.name === TAG_SYSTEM_JOURNAL_DATA.name ||
        j.flags?.["carl-rpg"]?.guideKey === "tagSystemGuide"
      );
    }
  }

  if (!entry) {
    entry = await ensureTagSystemJournal();
  }

  if (entry?.sheet) {
    entry.sheet.render(true);
    return entry.sheet;
  }
  return null;
}
