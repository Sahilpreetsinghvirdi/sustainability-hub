# Energy Capture Flow - Bill Entry & Audit

## Flow Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ENTRY MODE    │───▶│  BILL DETAILS   │───▶│  APPLIANCE      │───▶│  AUDIT RESULTS  │
│                 │    │                 │    │  SURVEY         │    │                 │
│  [Scan Bill]    │    │  [Parse + Edit] │    │  [Quick Add]    │    │  [Recommendations]│
│  [Manual Entry] │    │                 │    │  [Skip]         │    │  [Save]         │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## Screen 1: Entry Mode

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back                      Add Energy Bill         Next   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  How would you like to add your bill?                      │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  📄  SCAN PAPER BILL                                │   │
│  │     Use camera to capture your utility bill         │   │
│  │     Auto-extracts: usage, costs, dates              │   │
│  │                                                     │   │
│  │     [  📷  Open Camera  ]                           │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  📁  IMPORT PDF/IMAGE                               │   │
│  │     Select from Files app or email attachment       │   │
│  │                                                     │   │
│  │     [  📎  Choose File  ]                           │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │  ✏️  MANUAL ENTRY                                    │   │
│  │     Enter readings directly from your bill          │   │
│  │     Works offline, no camera needed                 │   │
│  │                                                     │   │
│  │     [  Enter Manually  ]                            │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  💡 Tip: Scan first, then verify. Manual entry for corrections. │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Screen 2: Bill Details (After Scan/Import or Manual)

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back                      Bill Details              Save │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Utility Provider: [Pacific Gas & Electric    ▼]   │   │
│  │  Account #: [________________________] (optional)   │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  Billing Period                                     │   │
│  │  From: [Jan 1, 2025 ▼]    To: [Jan 31, 2025 ▼]     │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  ⚡ ELECTRICITY                                     │   │
│  │  Usage: [423] [kWh ▼]                               │   │
│  │  Tier 1 (0-300): [300] kWh @ $0.18                 │   │
│  │  Tier 2 (301+):  [123] kWh @ $0.28                 │   │
│  │  Cost: [$102.34]                                    │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  🔥 NATURAL GAS (optional)                          │   │
│  │  Usage: [45] [therms ▼]                             │   │
  │  Cost: [$67.89]                                       │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  💧 WATER (optional)                                │   │
│  │  Usage: [3,200] [gallons ▼]                         │   │
│  │  Cost: [$34.56]                                     │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  Total Bill Amount: [$204.79]                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📊 QUICK COMPARISON                                 │   │
│  │  vs Last Month:  ▼ 12 kWh (-3%)   ▼ $8.45 (-4%)     │   │
│  │  vs Same Month Last Year: ▲ 23 kWh (+6%)            │   │
│  │  vs Neighborhood Avg:  ▼ 45 kWh (-10%) 🏆           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [← Back: Rescan]    [Next: Appliances ▶]    [Save Only]   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Parsed Bill Review (if scanned)
- **Pre-filled fields** from OCR with confidence indicators
- **Low confidence fields** highlighted in yellow
- **Edit any field** by tapping
- **Add missing tiers** for time-of-use rates

---

## Screen 3: Appliance Survey (Optional but Recommended)

```
┌─────────────────────────────────────────────────────────────┐
│  ← Skip                    Appliance Survey           Next  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Help us give better recommendations. Takes 2 minutes.     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  MAJOR APPLIANCES                                    │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  🧊 Refrigerator          [12 yrs] [725W] [24h/7d] │   │
│  │  Brand: [GE_______]  Model: [GTS22________]        │   │
│  │  ★ Energy Star: [Yes ▼]  Location: [Kitchen ▼]     │   │
│  │  Smart/WiFi: [No ▼]                                 │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  🧊 Freezer               [8 yrs]  [500W] [24h/7d] │   │
│  │  Brand: [Frigidaire]  Model: [FFC05_______]        │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  ♨️ Water Heater           [15 yrs] [4500W] [3h/7d]│   │
│  │  Type: [Electric Tank ▼]  Gallons: [50]            │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  🌡️ HVAC System             [10 yrs] [3500W] [8h/7d]│
│  │  Type: [Heat Pump ▼]  Tonnage: [3]                 │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  🍳 Oven/Stove              [7 yrs]  [2400W] [1h/3d]│   │
│  │  Type: [Gas Range ▼]                                 │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  🍽️ Dishwasher             [5 yrs]  [1200W] [1h/4d]│   │
│  │  ★ Energy Star: [Yes ▼]                             │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  🧺 Washer                  [4 yrs]  [500W] [1h/3d] │   │
│  │  Type: [Front Load ▼]  ★ Energy Star: [Yes ▼]      │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  🌪️ Dryer                   [4 yrs] [3000W] [1h/3d]│   │
│  │  Type: [Electric ▼]  ★ Energy Star: [No ▼]         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [+ Add Another Appliance]                                 │
│                                                             │
│  Quick-add presets: [🏠 Typical 2BR] [🏡 Large Home] [🏢 Apartment] │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Appliance Row (Collapsed/Expanded)
- **Collapsed**: Icon, name, age, power, usage
- **Expanded**: All fields + efficiency rating, location, smart status
- **Presets**: Populate typical appliances for home type
- **Smart detection**: If user has smart plugs, offer to import

---

## Screen 4: Audit Results

```
┌─────────────────────────────────────────────────────────────┐
│  ✓ Audit Complete                               View Dashboard│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🏠 HOME ENERGY AUDIT - JAN 2025                     │   │
│  │                                                     │   │
│  │  Annual Usage: 12,400 kWh  (Baseline: 10,800 kWh)  │   │
│  │  Annual Cost: $2,458                                │   │
│  │  Carbon Footprint: 4.2 metric tons CO₂e/yr         │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  💡 TOP RECOMMENDATIONS                              │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  🥇 REPLACE REFRIGERATOR (12 yrs old)                │   │
│  │     Save: 680 kWh/yr  •  $134/yr  •  280 kg CO₂e   │   │
│  │     Cost: $1,200  •  Payback: 9 years  •  🟢 HIGH  │   │
│  │     [View Details]  [Schedule Reminder]             │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  🥈 UPGRADE TO HEAT PUMP WATER HEATER              │   │
│  │     Save: 1,800 kWh/yr  •  $354/yr  •  740 kg CO₂e │   │
│  │     Cost: $2,800  •  Payback: 8 years  •  🟢 HIGH  │   │
│  │     [View Details]  [Find Rebates]                  │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  🥉 ENABLE SMART THERMOSTAT SCHEDULE                │   │
│  │     Save: 420 kWh/yr  •  $82/yr  •  170 kg CO₂e    │   │
│  │     Cost: $0 (you have Nest)  •  Payback: Immediate│   │
│  │     [Enable Now]  [Learn More]                      │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  💡 SWITCH TO LED BULBS (12 remaining)              │   │
│  │     Save: 340 kWh/yr  •  $67/yr  •  140 kg CO₂e    │   │
│  │     Cost: $48  •  Payback: 0.7 years  •  🟡 MEDIUM │   │
│  │     [Order Bulbs]  [Mark Done]                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📊 POTENTIAL ANNUAL SAVINGS                         │   │
│  │  ┌──────────────┬──────────┬──────────┬────────────┐ │   │
│  │  │ If All Done  │  3,240   │  $637    │  1,330 kg  │ │   │
│  │  │              │   kWh    │          │   CO₂e     │ │   │
│  │  └──────────────┴──────────┴──────────┴────────────┘ │   │
│  │  That's 26% reduction! 🎯                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Save & View Dashboard]    [Export PDF Report]           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Recommendation Card Details (Expandable)
- **Why this recommendation**: Algorithm explanation
- **Calculation details**: Current vs efficient model specs
- **Rebates/Incentives**: Local utility + federal (IRA) links
- **Contractor finder**: Link to local installers
- **DIY vs Pro**: Difficulty rating
- **Timeline**: Best season to implement

---

## Manual Entry Form (Alternative to Scan)

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back                      Manual Entry              Save │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Utility: [Pacific Gas & Electric            ▼]     │   │
│  │  Billing Period: [Jan 1, 2025 ▼] to [Jan 31, 2025 ▼]│   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  ⚡ Electricity: [423] kWh   Cost: [$102.34]        │   │
│  │  🔥 Gas: [45] therms         Cost: [$67.89]         │   │
│  │  💧 Water: [3200] gallons    Cost: [$34.56]         │   │
│  │  Total: [$204.79]                                     │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  📝 Notes: [____________________________________]   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Save Bill]    [Save + Add Appliances]                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Error States

| Error | UI | Recovery |
|-------|----|----------|
| PDF parse failed | "Could not read PDF. Try manual entry or photo." | Switch to manual |
| Dates invalid | Red highlight on date fields | Date picker |
| Usage negative | Inline error "Must be positive" | Clear + re-enter |
| Duplicate period | "Bill for this period exists. Replace?" | Confirm replace |
| No appliances | "Add at least 1 for accurate audit" | Skip allowed |

---

## Accessibility

- **Screen Reader**: "Electricity usage, 423 kilowatt hours, editable"
- **Keyboard**: Tab through all fields, arrow keys for number inputs
- **Voice Control**: "Tap Electricity", "Tap Save"
- **Cognitive**: Progressive disclosure (basic → advanced)
- **Visual**: High contrast mode for outdoor bill reading