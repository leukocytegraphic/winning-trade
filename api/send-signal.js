// api/send-signal.js
// Vercel serverless function — sends signal alerts to your Telegram channel
// Environment variables required (set in Vercel dashboard):
//   TELEGRAM_BOT_TOKEN  — from @BotFather
//   TELEGRAM_CHAT_ID    — your channel ID e.g. @WinningTradeSignals or -100xxxxxxxxxx

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { signal } = req.body;
  if (!signal) return res.status(400).json({ error: 'No signal provided' });

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID   = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    return res.status(500).json({ error: 'Telegram credentials not configured' });
  }

  // Format signal message with Telegram MarkdownV2
  const dir      = signal.dir === 'long' ? '🟢 LONG' : '🔴 SHORT';
  const rr       = signal.rr || '—';
  const score    = signal.score ? `${signal.score}/5` : '—';
  const htf      = signal.htf  || '—';
  const newsNote = signal.newsNote ? `\n📰 *News:* ${escMd(signal.newsNote)}` : '';

  const msg = [
    `⚡ *WINNING TRADE SIGNAL*`,
    ``,
    `${dir} — *${escMd(signal.pair)}*`,
    `📊 Timeframe: ${escMd(signal.tf)} \\| R:R: *${escMd(rr)}* \\| Score: *${escMd(score)}*`,
    ``,
    `🎯 Entry:  \`${escMd(String(signal.entry))}\``,
    `🛑 SL:     \`${escMd(String(signal.sl))}\``,
    `✅ TP1:    \`${escMd(String(signal.tp1))}\``,
    `🏆 TP2:    \`${escMd(String(signal.tp2))}\``,
    ``,
    `📐 *Confluence:*`,
    ...(signal.pattern || []).map(p => `  • ${escMd(p)}`),
    `  • ${escMd(signal.candle || '—')}`,
    `  • ${escMd(htf)}`,
    newsNote,
    ``,
    `_Signal generated at ${escMd(signal.time || new Date().toLocaleTimeString())}_`,
    `_[WINNING TRADE — Smart Money Engine](https://winningtrade.netlify.app)_`,
  ].filter(l => l !== undefined).join('\n');

  try {
    const tgRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id:    CHAT_ID,
          text:       msg,
          parse_mode: 'MarkdownV2',
          disable_web_page_preview: true,
        }),
      }
    );
    const tgData = await tgRes.json();
    if (!tgData.ok) throw new Error(tgData.description || 'Telegram error');
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Telegram send error:', err);
    return res.status(500).json({ error: err.message });
  }
}

// Escape special chars for Telegram MarkdownV2
function escMd(str) {
  return String(str).replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
}
