export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { symbol } = req.query;
  const pair = symbol.replace('/', '');
  
  // Using a public endpoint for candles
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${pair}=X?interval=1m&range=1d`;

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const data = await response.json();
    const result = data.chart.result[0];
    const quotes = result.indicators.quote[0];
    
    // Convert Yahoo format to your [time, o, h, l, c, v] format
    const candles = result.timestamp.map((t, i) => [
      t * 1000,
      quotes.open[i],
      quotes.high[i],
      quotes.low[i],
      quotes.close[i],
      quotes.volume[i] || 0
    ]).filter(c => c[1] !== null);

    return res.status(200).json(candles.slice(-100));
  } catch (err) {
    return res.status(200).json([]); // Return empty array on failure
  }
}