export default async function handler(req, res) {
  const KEY = process.env.MINIMAX_API_KEY || 'not-set'
  
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)
  
  try {
    const response = await fetch('https://api.minimax.io/anthropic/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KEY}`
      },
      body: JSON.stringify({
        model: 'MiniMax-M2.7',
        messages: [{ role: 'user', content: 'Mirror. Ask one question. JSON {"question":"?","note":"?"} User: 我很害怕' }],
        max_tokens: 1500,
        temperature: 0.8
      }),
      signal: controller.signal
    })
    
    clearTimeout(timeout)
    const data = await response.json()
    
    const textBlock = data.content?.find(c => c.type === 'text')
    const reply = textBlock?.text?.trim() || ''
    const m = reply.match(/\{[\s\S]+\}/)
    
    if (m) {
      const p = JSON.parse(m[0])
      res.status(200).json({
        ok: true,
        question: p.question ? p.question.substring(0, 80) : 'MISSING',
        note: p.note ? p.note.substring(0, 80) : 'MISSING'
      })
    } else {
      res.status(200).json({ ok: true, replyLen: reply.length, replyStart: reply.substring(0, 100) })
    }
  } catch (e) {
    clearTimeout(timeout)
    if (e.name === 'AbortError') {
      res.status(200).json({ error: 'timeout', keyPrefix: KEY.substring(0, 15) })
    } else {
      res.status(500).json({ error: e.message })
    }
  }
}