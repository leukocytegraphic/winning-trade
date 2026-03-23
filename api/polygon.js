// api/polygon.js
// Vercel serverless — proxies Polygon.io REST API with multi-key rotation
// Keys are stored in Vercel environment variables

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const keys = [
    process.env.POLYGON_KEY_1,
    process.env.POLYGON_KEY_2,
    process.env.POLYGON_KEY_3,
    process.env.POLYGON_KEY_4,
  ].filter(Boolean);

  if (!keys.length) {
    return res.status(500).json({ error: 'No Polygon API keys configured' });
  }

  const { ticker, multiplier, from, to, limit, keyIdx } = req.query;

  if (!ticker || !multiplier) {
    return res.status(400).json({ error: 'Missing ticker or multiplier' });
  }

  // Parse multiplier like "5/minute" into parts
  const [multVal, timespan] = (multiplier || '5/minute').split('/');

  // Build Polygon aggs URL
  const baseUrl = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/${multVal}/${timespan}/${from}/${to}`;

  // Try keys starting from the requested index, rotating on failure
  const startIdx = parseInt(keyIdx) || 0;
  for (let attempt = 0; attempt < keys.length; attempt++) {
    const idx = (startIdx + attempt) % keys.length;
    const apiKey = keys[idx];
    const url = `${baseUrl}?adjusted=true&sort=asc&limit=${limit || 80}&apiKey=${apiKey}`;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const upstream = await fetch(url, {
        headers: { 'User-Agent': 'WinningTrade/2.0' },
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (upstream.status === 429 || upstream.status === 403) {
        // Rate limited or forbidden — try next key
        continue;
      }

      const data = await upstream.json();
      res.setHeader('Cache-Control', 's-maxage=10');
      return res.status(upstream.status).json(data);
    } catch (err) {
      if (attempt === keys.length - 1) {
        return res.status(500).json({ error: 'All Polygon keys exhausted: ' + err.message });
      }
      // Try next key
    }
  }

  return res.status(500).json({ error: 'All Polygon API keys failed' });
}
