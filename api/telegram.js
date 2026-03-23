export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, parse_mode } = req.body;
    
    // Get credentials from Vercel environment variables
    const token = process.env.TELEGRAM_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    // Check if credentials exist
    if (!token || !chatId) {
      return res.status(500).json({ 
        error: 'Telegram credentials missing in Vercel environment variables. Please add TELEGRAM_TOKEN and TELEGRAM_CHAT_ID.' 
      });
    }

    if (!text) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    // Send to Telegram API
    const tgUrl = `https://api.telegram.org/bot${token}/sendMessage`;
    const tgRes = await fetch(tgUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: parse_mode || 'HTML',
        disable_web_page_preview: true
      })
    });

    const data = await tgRes.json();
    
    if (!tgRes.ok) {
      return res.status(tgRes.status).json({ error: 'Telegram API error', details: data });
    }

    // Success
    return res.status(200).json({ success: true, messageId: data.result.message_id });
    
  } catch (error) {
    console.error('Telegram proxy error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
