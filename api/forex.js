// api/forex.js  
// Serverless function — proxies open.er-api.com for forex rates
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { base } = req.query;
  if (!base) return res.status(400).json({ error: 'missing base currency' });

  try {
    const upstream = await fetch(`https://open.er-api.com/v6/latest/${base}`);
    const data = await upstream.json();
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return res.status(200).json(data);
  } catch(err) {
    // Frankfurter fallback
    try {
      const to = req.query.to || '';
      const fb = await fetch(`https://api.frankfurter.app/latest?from=${base}&to=${to}`);
      const data = await fb.json();
      return res.status(200).json({ result: 'success', rates: data.rates });
    } catch(e2) {
      return res.status(500).json({ error: err.message });
    }
  }
}
