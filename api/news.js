// api/news.js
// Fetches crypto + macro market news, scores sentiment, returns to frontend
// Uses CryptoPanic (free, no key needed for basic) + RSS feeds

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300'); // cache 5 min on Vercel edge

  try {
    // Fetch from CryptoPanic public feed (no key needed for basic)
    const cpRes  = await fetch(
      'https://cryptopanic.com/api/v1/posts/?auth_token=free&public=true&kind=news&filter=important',
      { headers: { 'User-Agent': 'WinningTrade/1.0' } }
    );
    const cpData = await cpRes.json();
    const results = cpData.results || [];

    // Score each headline for market sentiment
    const scored = results.slice(0, 20).map(item => ({
      title:     item.title,
      url:       item.url,
      source:    item.source?.title || 'News',
      published: item.published_at,
      sentiment: scoreSentiment(item.title),
      impact:    scoreImpact(item.title),
    }));

    // Overall market bias from top headlines
    const sentiments = scored.map(s => s.sentiment);
    const bullCount  = sentiments.filter(s => s === 'bullish').length;
    const bearCount  = sentiments.filter(s => s === 'bearish').length;
    const bias = bullCount > bearCount + 2 ? 'bullish'
               : bearCount > bullCount + 2 ? 'bearish'
               : 'neutral';

    // High-impact events that should suppress or boost signals
    const highImpact = scored.filter(s => s.impact === 'high');

    return res.status(200).json({
      ok:         true,
      bias,
      highImpact,
      headlines:  scored.slice(0, 10),
      fetchedAt:  new Date().toISOString(),
    });
  } catch (err) {
    // Return neutral if news fetch fails — never block signal engine
    return res.status(200).json({
      ok:        false,
      bias:      'neutral',
      highImpact: [],
      headlines: [],
      fetchedAt: new Date().toISOString(),
    });
  }
}

// Keyword-based sentiment scoring
function scoreSentiment(title) {
  const t = title.toLowerCase();
  const bullKeywords = [
    'surge','rally','pump','bull','breakout','record','high','gain',
    'rise','recovery','positive','approved','etf','adoption','buy',
    'accumulate','support','bounce','rebound','green','moon'
  ];
  const bearKeywords = [
    'crash','dump','bear','drop','fall','sell','ban','hack','breach',
    'regulation','lawsuit','sec','fraud','collapse','loss','fear',
    'liquidation','red','war','sanction','restrict','suspend','shut'
  ];
  const bScore = bullKeywords.filter(k => t.includes(k)).length;
  const beScore = bearKeywords.filter(k => t.includes(k)).length;
  if (bScore > beScore) return 'bullish';
  if (beScore > bScore) return 'bearish';
  return 'neutral';
}

// Score how market-moving a headline is
function scoreImpact(title) {
  const t = title.toLowerCase();
  const highImpactKeywords = [
    'fed','federal reserve','interest rate','inflation','cpi','fomc',
    'war','conflict','missile','attack','sanction','nuclear',
    'sec','ban','regulation','congress','senate','president',
    'trump','powell','bitcoin etf','binance','tether','hack',
    'billion','massive','emergency','crash','all-time','record'
  ];
  const hits = highImpactKeywords.filter(k => t.includes(k)).length;
  return hits >= 2 ? 'high' : hits === 1 ? 'medium' : 'low';
}
