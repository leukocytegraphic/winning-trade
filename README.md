# ⚡ WINNING TRADE

> Real-time trade signal tracker powered by **Smart Money Concepts** (SMC) — Break of Structure, CHoCH, Fair Value Gaps, Order Blocks, and Liquidity Sweeps. Built for crypto, forex, and meme coins.

[![Live Demo](https://img.shields.io/badge/LIVE-winning--trade.vercel.app-00f5a0?style=for-the-badge&logo=vercel)](https://winning-trade.vercel.app/)

---

## 📸 Preview

A sleek, dark-themed trading dashboard featuring:
- Live candlestick charts with SMC overlays
- Real-time signal generation with multi-confluence confirmation
- Risk calculator with position sizing
- Telegram integration for instant alerts
- Mobile-first responsive design

---

## 🚀 Features

### 📊 Live Charts
- **Binance WebSocket** streams for real-time crypto candlestick data
- **Polygon.io REST API** fallback with 4-key rotation for reliability
- **Frankfurter API** for live forex rates
- Timeframe switching (5m, 15m)
- SMC overlays: Order Blocks, FVG zones, BOS/CHoCH lines, Liquidity Sweeps, Entry markers

### ⚡ Signal Engine
- **Multi-confluence confirmation** — signals require 4/5+ score from:
  - Order Block detection
  - Break of Structure / Change of Character
  - Candle pattern confirmation (engulfing, pin bar)
  - Fair Value Gap presence
  - Liquidity sweep
  - HTF (Higher Time Frame) bias alignment
  - Session timing (London/NY overlap)
- **80%+ target accuracy** through strict confirmation gates
- 3-minute cooldown between signals per pair

### 🔔 Notifications
- In-browser toast notifications with signal details
- WebAudio API sound effects (ascending for LONG, descending for SHORT)
- Toggle sound on/off

### 📲 Telegram Alerts
- Connect your Telegram bot to receive signal alerts
- Configurable minimum score threshold (3/5, 4/5, 5/5)
- Formatted signal messages with entry, SL, TP1, TP2, R:R ratio
- Credentials stored locally in browser (never sent to server)

### ⚖ Risk Calculator
- Position size calculator based on account balance and risk percentage
- Support for both crypto and forex markets
- Auto-fill from any signal with "USE ↓" button
- Risk meter with safety classification (Safe / Moderate / High Risk)
- Calculates TP1/TP2 profit, SL distance, breakeven levels

### 📱 Responsive Design
- Desktop: side-by-side chart + signals layout
- Mobile: bottom navigation with 5 tabs (Chart, Signals, Scan, Risk, Alerts)
- Works on all screen sizes (375px to 1440px+)

---

## 🏗️ Architecture

```
winning-trade/
├── index.html          # Single-page app (HTML + CSS + JS)
├── api/
│   ├── binance.js      # Vercel serverless proxy for Binance REST API
│   └── polygon.js      # Vercel serverless proxy for Polygon.io with key rotation
├── package.json        # Node 20.x engine config
├── vercel.json         # Vercel deployment config
├── .gitignore          # Protects .env from commits
└── .env                # API keys (not committed)
```

### Data Flow

```
Browser                          Vercel Serverless              External APIs
┌─────────┐                     ┌──────────────┐              ┌─────────────┐
│ WebSocket├────────────────────►│              │              │ Binance WS  │
│ (direct) │  wss://stream...   │              │              └─────────────┘
└─────────┘                     │              │
                                │              │
┌─────────┐  /api/binance       │  binance.js  ├─────────────►Binance REST
│  fetch() ├───────────────────►│              │
└─────────┘                     │              │
                                │              │
┌─────────┐  /api/polygon       │  polygon.js  ├─────────────►Polygon.io
│  fetch() ├───────────────────►│  (4-key      │              (rate-limit
└─────────┘                     │   rotation)  │               rotation)
                                └──────────────┘
```

- **WebSockets** connect directly from the browser (no CORS issues)
- **REST APIs** go through Vercel serverless proxies to avoid CORS
- **Polygon fallback** activates when Binance REST returns errors (e.g. 451 geo-restricted)

---

## ⚙️ Setup & Deployment

### Prerequisites
- [Node.js](https://nodejs.org/) 20.x
- A [Vercel](https://vercel.com/) account
- [Polygon.io](https://polygon.io/) API keys (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/leukocytegraphic/winning-trade.git
cd winning-trade
```

### 2. Create `.env` File

```env
POLYGON_KEY_1=your_polygon_key_1
POLYGON_KEY_2=your_polygon_key_2
POLYGON_KEY_3=your_polygon_key_3
POLYGON_KEY_4=your_polygon_key_4
```

### 3. Add Environment Variables to Vercel

> **Important:** The `.env` file is for local reference only. You must add these keys to your Vercel project settings.

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select the **winning-trade** project
3. Go to **Settings** → **Environment Variables**
4. Add each key:
   - `POLYGON_KEY_1` = your key
   - `POLYGON_KEY_2` = your key
   - `POLYGON_KEY_3` = your key
   - `POLYGON_KEY_4` = your key
5. Click **Save** and **Redeploy**

### 4. Deploy

```bash
# Push to GitHub — Vercel auto-deploys from main branch
git push origin main
```

Or deploy manually:
```bash
npx -y vercel --prod
```

---

## 🔑 API Key Rotation

The Polygon.io proxy (`api/polygon.js`) implements automatic key rotation:

| Scenario | Behavior |
|----------|----------|
| Key returns **200 OK** | Uses response, same key next time |
| Key returns **429 Rate Limited** | Rotates to next key, retries |
| Key returns **403 Forbidden** | Rotates to next key, retries |
| All keys fail | Returns 500 error to client |

This ensures maximum uptime even with free-tier rate limits (5 calls/min per key → 20 calls/min total with 4 keys).

---

## 📡 Supported Markets

| Category | Pairs |
|----------|-------|
| **Majors** | BTC, ETH, BNB, SOL, XRP, ADA, DOGE, TRX |
| **Alts** | AVAX, DOT, LINK, LTC, UNI, ATOM, NEAR, ARB, OP, SUI, INJ, TON, APT, FIL, HBAR, STX, ALGO, VET |
| **Meme** | SHIB, PEPE, WIF, BONK, FLOKI |
| **Forex** | EUR/USD, GBP/USD, USD/JPY, AUD/USD, USD/CHF, GBP/JPY, EUR/GBP, NZD/USD |

---

## 🛡️ Signal Confidence Scoring

| Score | Label | Requirements |
|-------|-------|-------------|
| 5/5 | ★ PERFECT | OB + BOS + Candle + FVG + Sweep + HTF alignment |
| 4/5 | HIGH | OB + BOS + Candle + (FVG or Sweep) |
| 3/5 | MODERATE | Partial confluence (not pushed to feed) |
| 1-2/5 | LOW | Insufficient confluence (rejected) |

Only signals scoring **4/5 or higher** are displayed and notified.

---

## 🧪 Tech Stack

- **Frontend:** Vanilla HTML, CSS, JavaScript (zero dependencies)
- **Fonts:** [Syne](https://fonts.google.com/specimen/Syne) (headings), [Share Tech Mono](https://fonts.google.com/specimen/Share+Tech+Mono) (data), [Inter](https://fonts.google.com/specimen/Inter) (body)
- **Charts:** Custom Canvas 2D renderer
- **Backend:** Vercel Serverless Functions (Node.js 20.x)
- **Data:** Binance WebSocket + REST, Polygon.io REST, Frankfurter API
- **Notifications:** WebAudio API, Telegram Bot API
- **Hosting:** Vercel (auto-deploy from GitHub)

---

## 📄 License

This project is private and proprietary.

---

<p align="center">
  Built with ⚡ by <strong>WINNING TRADE</strong>
</p>
