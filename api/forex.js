export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { symbol } = req.query;
  
  // TO ADJUST: Replace 'YOUR_API_KEY' with your free key from polygon.io
  const API_KEY = process.env.POLYGON_API_KEY || 'G2epf8MO6tWK5nNwhb6R2xBcdPMK8SAb'; 
  
  // Format EUR/USD to C:EURUSD
  const polySym = "C:" + symbol.replace('/', '');
  const to = Date.now();
  const from = to - (24 * 60 * 60 * 1000); // Get last 24 hours of 1-minute data

  const url = `https://api.polygon.io/v2/aggs/ticker/${polySym}/range/1/minute/${from}/${to}?adjusted=true&sort=asc&limit=100&apiKey=${API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.results) return res.status(200).json([]);

    // Map Polygon data to your [time, open, high, low, close, volume] format
    const candles = data.results.map(r => [
      r.t, 
      parseFloat(r.o), 
      parseFloat(r.h), 
      parseFloat(r.l), 
      parseFloat(r.c), 
      Math.round(r.v)
    ]);

    return res.status(200).json(candles);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}