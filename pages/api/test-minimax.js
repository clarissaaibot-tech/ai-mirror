export default async function handler(req, res) {
  const KEY = process.env.MINIMAX_API_KEY || 'not-set'
  
  try {
    const response = await fetch('https://api.minimax.io/anthropic/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KEY}`
      },
      body: JSON.stringify({
        model: 'MiniMax-M2.7',
        messages: [{ role: 'user', content: 'Say hello in JSON format {"greeting":"..."}' }],
        max_tokens: 1500,
        temperature: 0.8
      })
    })
    
    const data = await response.json()
    const textBlock = data.content?.find(c => c.type === 'text')
    
    res.status(200).json({
      status: response.status,
      ok: response.ok,
      keyPrefix: KEY.substring(0, 15) + '...',
      textBlock: textBlock?.text?.substring(0, 100) || 'MISSING'
    })
  } catch (e) {
    res.status(500).json({ error: e.message, stack: e.stack })
  }
}