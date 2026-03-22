export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { path, ...params } = req.query;
  const qs = new URLSearchParams(params).toString();
  const url = `https://api.binance.com/api/${path}${qs ? '?' + qs : ''}`;

  try {
    const upstream = await fetch(url, { headers: { 'User-Agent': 'WinningTrade/2.0' } });
    if (!upstream.ok) throw new Error(`Binance Status: ${upstream.status}`);
    const data = await upstream.json();
    res.setHeader('Cache-Control', 's-maxage=2');
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}