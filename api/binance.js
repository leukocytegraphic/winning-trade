export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { path, ...params } = req.query;
  const url = `https://api.binance.com/api/${path}?${new URLSearchParams(params)}`;

  try {
    const upstream = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const data = await upstream.json();
    return res.status(200).json(Array.isArray(data) ? data : []);
  } catch (e) {
    return res.status(200).json([]); // Return empty array instead of erroring out
  }
}