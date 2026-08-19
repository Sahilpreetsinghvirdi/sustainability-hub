# Carbon Capture Flow - Receipt Scanner

## Flow Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   SCAN MODE     │───▶│  PROCESSING     │───▶│  REVIEW ITEMS   │───▶│  CONFIRMED      │
│                 │    │                 │    │                 │    │                 │
│  [Camera View]  │    │  [Spinner +     │    │  [Item List     │    │  [Summary +     │
│  [Gallery]      │    │   Progress]     │    │   w/ Carbon]    │    │   Insights]     │
│  [Manual Entry] │    │                 │    │  [Edit/Delete]  │    │  [Save]         │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## Screen 1: Scan Mode

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back                    Scan Receipt              ✓ Done │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │                   📷 CAMERA VIEW                    │   │
│  │                                                     │   │
│  │         ┌─────────────────────────────┐             │   │
│  │         │  ████████████████████████   │             │   │
│  │         │  █  POSITION RECEIPT HERE  █             │   │
│  │         │  █  ┌───────────────────┐  █             │   │
│  │         │  █  │  ░░░░░░░░░░░░░░  │  █             │   │
│  │         │  █  │  ░  RECEIPT   ░  │  █             │   │
│  │         │  █  │  ░░░░░░░░░░░░░░  │  █             │   │
│  │         │  █  └───────────────────┘  █             │   │
│  │         │  ████████████████████████   │             │   │
│  │         └─────────────────────────────┘             │   │
│  │                                                     │   │
│  │  [💡 Auto-capture when aligned]                     │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  📷 Camera   │  │  🖼️ Gallery  │  │  ✏️ Manual    │     │
│  │  (Default)   │  │  (Import)    │  │  Entry       │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
│  Recent scans:                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🛒 Whole Foods    $87.43   12.3 kg CO₂e   2h ago   │   │
│  │ 🛒 Target         $45.21   8.7 kg CO₂e    1d ago   │   │
│  │ 🛒 Costco         $156.80  34.2 kg CO₂e   3d ago   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Interactions
- **Auto-detect receipt edges** → show green overlay when aligned
- **Haptic feedback** on capture
- **Long press** gallery button → quick import last photo
- **Manual entry** opens item-by-item form (offline fallback)

---

## Screen 2: Processing

```
┌─────────────────────────────────────────────────────────────┐
│  ← Cancel                                           [✕]     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │                    🔄 PROCESSING                    │   │
│  │                                                     │   │
│  │              ┌─────────────────┐                    │   │
│  │              │      ⏳         │                    │   │
│  │              │   (spinner)     │                    │   │
│  │              └─────────────────┘                    │   │
│  │                                                     │   │
│  │              Extracting text...                     │   │
│  │              ████████░░░░░░░░░░░░░░░░░░░░░░░░░░    │   │
│  │                                                     │   │
│  │  Step 1 of 3: OCR Complete ✓                        │   │
│  │  Step 2 of 3: Matching items...                     │   │
│  │  Step 3 of 3: Calculating carbon...                 │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Processing typically takes 3-8 seconds]                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Progress Steps
1. **OCR** (PaddleOCR on-device) → extracts text lines
2. **Item Parsing** → regex + ML to split into items
3. **Carbon Matching** → barcode lookup → OpenFoodFacts → category mapping → carbon factor
4. **Confidence Scoring** → per-item confidence 0-100%

---

## Screen 3: Review Items

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back                    Review Items              Save   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Store: Whole Foods Market          Date: Jan 15, 2025     │
│  Total: $87.43                                                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🥩 Grass-fed Ground Beef      1.2 lb  $12.99      │   │
│  │  🌱 Category: Meat (Beef)  🌍 32.4 kg CO₂e  ▼       │   │
│  │  [Edit] [Delete]  Confidence: 92%  📦 Barcode ✓    │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  🥛 Organic Whole Milk         1 gal   $4.99       │   │
│  │  🌱 Category: Dairy (Milk)  🌍 1.9 kg CO₂e  ▼       │   │
│  │  [Edit] [Delete]  Confidence: 98%  📦 Barcode ✓    │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  🥦 Organic Broccoli           1 lb    $3.49       │   │
│  │  🌱 Category: Vegetables      🌍 0.3 kg CO₂e  ▼       │   │
│  │  [Edit] [Delete]  Confidence: 87%  ❓ No barcode   │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  🍞 Sourdough Bread            1 loaf  $5.99       │   │
│  │  🌱 Category: Grains (Bread)  🌍 1.1 kg CO₂e  ▼       │   │
│  │  [Edit] [Delete]  Confidence: 95%  📦 Barcode ✓    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🌍 TOTAL CARBON: 35.7 kg CO₂e                       │   │
│  │  📊 By Category:  Beef 91% | Dairy 5% | Veg 1% | Grain 3% │
│  │  🎯 Monthly Budget: 35.7 / 200 kg (18%)              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [+ Add Missing Item]    [📝 Edit Store/Date]              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Item Row Details
- **Expandable** (▼) to show:
  - Carbon factor source (OpenLCA, Ecoinvent, estimated)
  - Per-kg carbon intensity
  - Alternative lower-carbon options
- **Edit** opens modal:
  - Change category (dropdown with search)
  - Adjust quantity/unit
  - Override carbon (manual entry)
  - Mark as "non-food" (packaging, household)
- **Swipe left** → Delete
- **Pull to refresh** → Re-run OCR/matching

---

## Screen 4: Confirmed

```
┌─────────────────────────────────────────────────────────────┐
│  ✓ Saved!                                            Done   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │                    ✅ SCAN SAVED                    │   │
│  │                                                     │   │
│  │              ┌─────────────────┐                    │   │
│  │              │      ✓          │                    │   │
│  │              └─────────────────┘                    │   │
│  │                                                     │   │
│  │  Whole Foods Market  •  Jan 15, 2025               │   │
│  │  4 items  •  $87.43  •  35.7 kg CO₂e               │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📈 THIS SCAN'S IMPACT                               │   │
│  │  • Beef alone = 91% of this receipt's carbon        │   │
│  │  • Swapping beef for chicken would save 25 kg CO₂e │   │
│  │  • This receipt = 18% of your monthly budget        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  🏆 ACHIEVEMENT UNLOCKED!                            │   │
│  │  "Conscious Carnivore" - First beef-free week!      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Share Result]    [Scan Another]    [View Dashboard]     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Manual Entry Fallback (Screen 1B)

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back                    Manual Entry               Save  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Store: [Whole Foods Market        ▼]  Date: [Jan 15 ▼]    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Item 1                                              │   │
│  │  Name: [Ground Beef_______________]                 │   │
│  │  Qty: [1.2] [lb ▼]    Price: [$12.99]              │   │
│  │  Category: [Meat > Beef ▼]    Carbon: [32.4] kg    │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  Item 2                                              │   │
│  │  Name: [Organic Milk______________]                 │   │
│  │  Qty: [1] [gal ▼]     Price: [$4.99]               │   │
│  │  Category: [Dairy > Milk ▼]    Carbon: [1.9] kg    │   │
│  ├─────────────────────────────────────────────────────┤   │
│  │  [+ Add Another Item]                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  💡 Tip: Use barcode scanner for faster entry             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Error States

| Error | UI | Recovery |
|-------|----|----------|
| Camera permission denied | Banner + "Open Settings" button | Deep link to settings |
| OCR failed (blurry) | "Could not read receipt. Retry or manual entry" | Retry camera / Manual |
| No carbon match | Item shows "⚠️ Estimated" with edit button | User selects category |
| Network timeout | "Saved offline. Will sync when online." | Background sync queue |
| Storage full | "Free up space to save photos" | Clear cache option |

---

## Accessibility

- **VoiceOver**: "Camera view. Double tap to capture. Receipt detected."
- **Large Text**: All text scales, camera overlay remains functional
- **Voice Control**: "Tap Camera", "Tap Gallery", "Tap Manual Entry"
- **Motor**: Auto-capture reduces need for steady hands
- **Color Blind**: Carbon values shown as numbers + bars, not just colors