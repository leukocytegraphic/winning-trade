// api/binance.js
// Runs on Vercel's server — no CORS restriction
// Proxies Binance REST so the browser can get real historical candles

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { path, ...params } = req.query;
  if (!path) return res.status(400).json({ error: 'missing path' });

  const qs = new URLSearchParams(params).toString();
  const url = `https://api.binance.com/api/${path}${qs ? '?' + qs : ''}`;

  try {
    const upstream = await fetch(url, {
      headers: { 'User-Agent': 'WinningTrade/2.0' }
    });
    const data = await upstream.json();
    res.setHeader('Cache-Control', 's-maxage=5');
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
