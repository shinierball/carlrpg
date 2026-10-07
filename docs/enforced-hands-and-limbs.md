# Enforced Number of Hands and Limbs Subsystem

## Overview
In the **Dungeon Crawler Carl Roleplaying Game (CarlRPG)**, crawlers normally have 2 arms, 2 legs, and 2 hands for wielding gear and weapons. However, varying anatomies (e.g. quadrupeds, centaurs), traumatic injuries (severed hands, amputations), mutations, and cybernetic prosthetics can alter an actor's limbs and available wielding capacity.

The **Enforced Number of Hands and Limbs** subsystem provides:
1. **Configurable Limbs**: GM-adjustable base counts for Arms, Legs, and Hands (defaulting to 2 each for humanoids, 4 legs / 0 hands for quadrupeds, 4 legs / 2 arms / 2 hands for centaurs).
2. **Dynamic Buff/Debuff Modifications**: Status effects, permanent injuries, amputations, and mutations dynamically modify effective limbs (`maxArms`, `maxLegs`, `maxHands`).
3. **Canonical Condition Fallbacks**: Recognized conditions (e.g. "Severed Hand", "Amputated Arm", "Extra Arms", "Prosthetic Arm") provide automatic limb deltas when no custom overrides are supplied.
4. **Gear & Weapon Hand Tracking**: Equipped weapons and gear calculate required hands based on `wieldMode` (`one_handed` = 1, `two_handed` = 2, versatile `two_handed_disadv_1h` = 1 or 2) or explicit `handsRequired`. Non-hand gear (torso armor, helmets, boots) consumes 0 hands.
5. **Warning Banners & Visual Indicators**: When `usedHands > maxHands`, high-contrast warning banners display on Page 1 (Core Attacks header) and Page 4 (Gear/Inventory), alerting players and GMs without arbitrarily blocking player action.
6. **Security & Permissions**: Only Game Masters can edit base limb counts. Updates submitted by non-GM players are stripped server-side.

---

## Schema Architecture

### Actor Schema (`template.json` & `BaseActorDataModel`)
```json
"limbs": {
  "arms": 2,
  "legs": 2,
  "hands": 2
}
```
Derived attributes computed on `actor.system.attributes.limbs` (and accessible via `actor.limbs`):
- `arms`, `legs`, `hands`: Base counts set by GM.
- `maxArms`, `maxLegs`, `maxHands`: Effective totals taking active buffs and debuffs into account (`Math.max(0, base + delta)`).
- `deltaArms`, `deltaLegs`, `deltaHands`: Sum of active buff and debuff modifiers.
- `usedHands`: Total hands consumed by equipped weapons and gear.
- `equippedHandItems`: Array of equipped items consuming hands (`[{ id, name, hands }]`).
- `exceededHands`: Boolean flag indicating `usedHands > maxHands`.
- `handsWarning`: Descriptive warning message displayed when limit is exceeded.

### Gear & Attack Schema (`GearDataModel`, `AttackDataModel`)
- `handsRequired`: Number of hands required to wield (defaults to 1; derived from `wieldMode` or explicit setting).

### Buff & Debuff Schema (`BuffDataModel`, `DebuffDataModel`)
- `limbModifiers`: `{ arms: 0, legs: 0, hands: 0 }` (positive for buffs/prosthetics/mutations, negative for amputations/injuries).

---

## Canonical Condition Fallback Table

| Condition Name | Arms ($\Delta$) | Hands ($\Delta$) | Legs ($\Delta$) | Notes |
|:---|:---:|:---:|:---:|:---|
| **Severed Hand** / **Amputated Hand** / **Lost Hand** | 0 | -1 | 0 | Wielding capacity reduced by 1 |
| **Severed Arm** / **Amputated Arm** / **Lost Arm** | -1 | -1 | 0 | Arm and hand reduced by 1 |
| **Severed Leg** / **Amputated Leg** / **Lost Leg** | 0 | 0 | -1 | Leg count reduced by 1 |
| **Extra Arms** | +2 | +2 | 0 | Mutation granting 2 additional arms and hands |
| **Extra Arm** | +1 | +1 | 0 | Mutation granting 1 additional arm and hand |
| **Prosthetic Arm** | +1 | +1 | 0 | Replaces lost arm and hand |
| **Prosthetic Hand** | 0 | +1 | 0 | Replaces lost hand |
| **Prosthetic Leg** | 0 | 0 | +1 | Replaces lost leg |

---

## User Interface & Feedback

### Page 1 (Core Sheet)
- **Physiology & Limbs Block**: Quick summary showing Arms, Legs, and Hands with current versus maximum values. GMs can quickly edit base values.
- **Hands Limit Banner**: When exceeded, displays an alert banner right above Attacks:
  `⚠ HANDS LIMIT EXCEEDED: Wielding gear in X hands, but only Y hands available!`
- **Attacks Header Badge**: Shows `Hands: X/Y` badge, colored in alert red when exceeded.

### Page 4 (Inventory)
- **Limbs & Hands Bar**: Displays total hands used vs available, with items list and GM editable inputs.
- **Inventory Alert Banner**: Displays the full alert message at top of inventory when exceeded.

### Buff & Debuff Sheets
- **Limb Modifiers Section**: Numeric +/- inputs for Arms, Legs, and Hands.

---

## Verification & Testing
The subsystem is covered by 10 comprehensive automated unit tests in `tests/enforced-hands-and-limbs.test.mjs`:
- Default humanoid crawler initialization (2 arms, 2 legs, 2 hands, 0 used hands).
- Weapon equipping hand tallying (1-handed dagger = 1, 2-handed bow = 2, total = 3 > 2 triggers warning).
- Non-hand gear (torso armor, boots, helmets) consuming 0 hands.
- Versatile weapon handling (`two_handed_disadv_1h` consuming 1 hand when `oneHanded` is set).
- Quadruped physiology (4 legs, 0 arms, 0 hands; weapon triggers warning).
- Centaur physiology (4 legs, 2 arms, 2 hands; 2-handed weapon wielded within limit).
- GM 4-arm adjustment allowing dual two-handed weapons without warning.
- Dynamic Buff and Debuff modifications (amputation debuff reduces hands to 1, cybernetic buff restores to 2).
- Canonical condition fallback without explicit item limb fields.
- Security stripping preventing non-GM users from altering base limb counts via sheet submissions.
