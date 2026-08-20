# Sustainability Hub

A unified personal sustainability dashboard combining **carbon footprint tracking**, **home energy auditing**, and **food waste logging** — built for science fair 2026.

![Dashboard Screenshot](dashboard.png)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Mobile** | React Native + Expo Router, TypeScript, Zustand |
| **Desktop** | Tauri v2 + Vite + React + TypeScript + Tailwind CSS |
| **Backend** | FastAPI + SQLAlchemy + PostgreSQL |

## Features

- **Carbon Tracker** — Scan receipts (OCR) or manually log purchases to calculate kg CO₂e per item
- **Energy Monitor** — Parse utility bills, track kWh/gas/water usage, run home energy audits
- **Food Waste Logger** — Photo analysis of plate waste, daily streaks, waste-by-category breakdowns
- **Dashboard** — Real-time charts, stat cards, smart suggestions, and achievement badges
- **Settings** — Profile management, household settings, notification preferences, cloud sync

## Getting Started

### Mobile (Expo)

```bash
cd mobile
npm install
npx expo start --clear
```

Scan the QR code with Expo Go on your phone.

### Desktop (Tauri)

```bash
cd desktop
npm install
npm run dev       # Vite dev server only
npx tauri dev     # Full Tauri window (requires Rust)
```

### Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

> **Note:** Backend requires Python 3.12+, PostgreSQL, and native dependencies (pydantic-core).

## Project Structure

```
sustainability/
├── mobile/              # React Native Expo app
│   ├── app/             # Expo Router screens
│   ├── src/
│   │   ├── screens/     # Screen components
│   │   ├── components/  # Shared components
│   │   ├── hooks/       # Custom hooks (useCarbon, useEnergy, etc.)
│   │   ├── store/       # Zustand stores
│   │   ├── ui/          # UI primitives (Button, Card, Badge, etc.)
│   │   └── utils/       # Formatters, helpers
│   └── constants/       # Theme, config
├── desktop/             # Tauri desktop app
│   ├── src/
│   │   ├── pages/       # Dashboard, Carbon, Energy, FoodWaste, Settings
│   │   ├── lib/         # API client
│   │   └── types/       # TypeScript interfaces
│   └── src-tauri/       # Rust backend (Tauri)
├── backend/             # FastAPI server
│   ├── app/
│   │   ├── api/         # API v1 endpoints
│   │   ├── models/      # SQLAlchemy models
│   │   └── schemas/     # Pydantic schemas
│   └── requirements.txt
└── shared/              # Shared TypeScript types
```

## Three Pillars

### 1. Carbon Footprint
Track the environmental impact of every purchase. Scan a receipt or enter items manually — each product is categorized and assigned a CO₂e estimate.

### 2. Home Energy
Upload utility bills to extract electricity (kWh), gas (therms), and water (gallons) data. Run an energy audit to get personalized efficiency recommendations with estimated savings.

### 3. Food Waste
Log meals to track what gets wasted and why. Build zero-waste streaks, see waste broken down by category (plate waste, spoilage, preparation), and get tips to reduce waste.

## License

Science Fair 2026 — Sahil Virdi
