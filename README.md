# WINNING TRADE — Smart Money Signal Engine

A live trading signal dashboard with SMC (Smart Money Concepts) analysis, Telegram alerts, and news-aware signal filtering.

## Features
- Live Binance WebSocket prices for 40+ pairs (Majors, Alts, Meme)
- Live Forex rates via open.er-api.com
- SMC signal detection: Order Blocks, FVG, BOS/CHoCH, Liquidity Sweeps
- 5-point confidence scoring system (only 4+/5 signals fire)
- News sentiment engine — suppresses signals during high-impact bearish news
- Telegram channel alerts for confirmed signals
- Signal history log with win/loss tracking
- Full mobile UI with bottom navigation

## Deploy to Vercel

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial deploy"
git remote add origin https://github.com/YOUR_USERNAME/winning-trade.git
git push -u origin main
```

### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com) → New Project
2. Import your GitHub repository
3. Framework Preset: **Other**
4. Root Directory: `/` (leave as default)
5. Click **Deploy**

### 3. Set Environment Variables (for server-side Telegram — optional)
In Vercel dashboard → Your Project → Settings → Environment Variables:
```
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
TELEGRAM_CHAT_ID=@your_channel_username
```
> Note: The app also supports browser-side Telegram sending (no server needed).
> Enter your bot token directly in the app's **📲 ALERTS** tab.

## Telegram Setup
1. Open Telegram → search **@BotFather** → `/newbot`
2. Name your bot and get the token
3. Create a channel → add your bot as **admin with post permission**
4. In the app's ALERTS tab → enter token + channel ID → Save
5. Test with the **TEST MESSAGE** button

## Project Structure
```
winning-trade/
├── index.html          # Main app
├── vercel.json         # Vercel proxy config (replaces _redirects)
├── api/
│   ├── send-signal.js  # Serverless: sends signal to Telegram
│   └── news.js         # Serverless: fetches + scores market news
└── README.md
```

## Signal Confidence Score (0–5)
| Score | Meaning | Action |
|-------|---------|--------|
| 5/5 | Perfect confluence | Signal fires + Telegram sent |
| 4/5 | High confidence | Signal fires + Telegram sent |
| 3/5 | Moderate | Signal fires in app, no Telegram |
| <3 | Weak | Suppressed entirely |

## News Logic
- Fetches CryptoPanic headlines every 5 minutes
- Scores each headline: bullish / bearish / neutral
- Calculates overall market bias
- **Suppresses LONG signals** if 2+ high-impact bearish events detected (war, ban, crash, SEC action etc.)
- News bias alignment adds +0.5 to signal confidence score
