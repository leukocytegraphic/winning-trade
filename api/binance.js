// api/binance.js
// Serverless function — proxies Binance REST API server-side (no CORS)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // e.g. /api/binance?path=v3/ticker/price&symbol=BTCUSDT
  const path = req.query.path;
  if (!path) return res.status(400).json({ error: 'missing path' });

  // Build query string from all params except 'path'
  const params = { ...req.query };
  delete params.path;
  const qs = new URLSearchParams(params).toString();
  const url = `https://api.binance.com/api/${path}${qs ? '?' + qs : ''}`;

  try {
    const upstream = await fetch(url, {
      headers: { 'User-Agent': 'WinningTrade/1.0' }
    });
    const data = await upstream.json();
    // Cache successful responses for 5 seconds
    res.setHeader('Cache-Control', 's-maxage=5, stale-while-revalidate=10');
    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
