# Dashboard Wireframe

## Main Dashboard Screen

```
┌─────────────────────────────────────────────────────────────┐
│  🌿 Sustainability Hub                    [≡] [🔔] [👤]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📊 THIS MONTH'S IMPACT                              │   │
│  │  ┌──────────────┬──────────────┬──────────────────┐  │   │
│  │  │  🛒 CARBON    │  ⚡ ENERGY    │  🍽️ FOOD WASTE  │  │   │
│  │  │  187 kg CO₂e  │  423 kWh      │  4.2 kg wasted   │  │   │
│  │  │  ▼ 12% vs Jan │  ▲ 8% vs Jan  │  ▼ 23% vs Jan    │  │   │
│  │  │  🎯 200 kg    │  🎯 400 kWh   │  🎯 3.5 kg       │  │   │
│  │  │  [94%]        │  [106%]       │  [120%]          │  │   │
│  │  └──────────────┴──────────────┴──────────────────┘  │   │
│  │                                                         │   │
│  │  🎯 TOTAL FOOTPRINT: 2,140 kg CO₂e/yr  (Target: <2t)  │   │
│  │  ┌─────────────────────────────────────────────────┐  │   │
│  │  │  ████████████████████████░░░░░░░░░░░░░░░░░░░░░  │  │   │
│  │  │  0t                    1t                    2t  │  │   │
│  │  └─────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📈 TRENDS (Last 30 Days)                           │   │
│  │  ┌─────────────────────────────────────────────────┐ │   │
│  │  │  Carbon  ████▁▂▃▅▆▇  ▁▂▃▅▆▇████▁▂▃▅▆▇          │ │   │
│  │  │  Energy  ▂▃▅▆▇█▆▅▃▂▁  ▂▃▅▆▇█▆▅▃▂▁▂▃▅           │ │   │
│  │  │  Waste   ▇█▆▅▃▂▁▂▃▅▆▇  ▇█▆▅▃▂▁▂▃▅▆▇█           │ │   │
│  │  └─────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  💡 SMART SUGGESTIONS                                │   │
│  │  • Replace 12-yr fridge → save $84/yr, 320 kg CO₂e │   │
│  │  • Meal prep Sundays → reduce food waste 40%        │   │
│  │  • Switch to LED bulbs → save $12/mo                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  🏠  📊  📷  🍽️  ⚙️                                        │
│  Home  Dash  Scan  Waste  Settings                         │
└─────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### 1. Header
- **App Title**: "Sustainability Hub" with leaf icon
- **Menu (≡)**: Side drawer with navigation, household switcher, profile
- **Notifications (🔔)**: Badge count for streak reminders, bill due, insights
- **Profile (👤)**: Quick access to settings, sync status, logout

### 2. Impact Cards (3-column grid)
Each card shows:
- **Icon + Label**: Category identifier
- **Current Value**: Primary metric with unit
- **Trend**: % change vs previous period (green down/red up)
- **Target**: Monthly goal with progress bar
- **Color coding**: Green (good), Yellow (caution), Red (over budget)

### 3. Total Footprint Progress
- **Annual projection** based on current month × 12
- **Visual progress bar** with target marker
- **Color transitions**: Green → Yellow → Red at thresholds

### 4. Trend Charts (Mini sparklines)
- **30-day rolling window**
- **One line per category** (color-matched)
- **Tap to expand** to full-screen chart view

### 5. Smart Suggestions
- **ML-driven recommendations** from backend
- **Prioritized by impact** (CO₂e savings × ease)
- **Dismissible** with "Don't show again"

### 6. Bottom Tab Bar
| Tab | Icon | Screen | Badge |
|-----|------|--------|-------|
| Home | 🏠 | Dashboard | - |
| Dashboard | 📊 | Detailed Analytics | - |
| Scan | 📷 | Receipt/Barcode Scanner | Pending scans |
| Waste | 🍽️ | Food Waste Logger | Streak day # |
| Settings | ⚙️ | App Settings | Sync status |

---

## Responsive Behavior

| Screen Width | Layout |
|--------------|--------|
| < 360px | Stack impact cards vertically |
| 360-480px | 3-column grid (as shown) |
| > 480px (tablet) | 2-row: 3 cards top, trends + suggestions bottom |

---

## States

### Empty State (New User)
```
┌─────────────────────────────────────────────────────────────┐
│  🌱 Welcome to Sustainability Hub!                          │
│                                                             │
│  Start tracking your impact in 3 areas:                    │
│                                                             │
│  [📷 Scan Receipt]    [⚡ Add Energy Bill]    [🍽️ Log Meal] │
│                                                             │
│  Your personalized dashboard will appear here.             │
└─────────────────────────────────────────────────────────────┘
```

### Loading State
- Skeleton loaders for each card
- Shimmer animation on progress bars
- "Analyzing your data..." message

### Error State
- Banner at top: "Unable to load data. Pull to refresh."
- Retry button on each card
- Offline indicator if no network

---

## Accessibility

- **VoiceOver/TalkBack**: All metrics announced with context
- **Dynamic Type**: Scales with system font size
- **Color Blind**: Patterns + labels, not just color
- **High Contrast**: Optional theme in settings
- **Touch Targets**: Minimum 48×48pt