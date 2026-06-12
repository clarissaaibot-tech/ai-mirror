export default async function handler(req, res) {
  const KEY = process.env.MINIMAX_API_KEY || 'not-set'
  
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000)
  
  try {
    const response = await fetch('https://api.minimax.io/anthropic/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KEY}`
      },
      body: JSON.stringify({
        model: 'MiniMax-M2.7',
        messages: [{ 
          role: 'user', 
          content: '你是一面镜子。用户说「我很害怕」。直接返回JSON，不要解释：{"question":"...","note":"..."}' 
        }],
        max_tokens: 300,
        temperature: 0.7
      }),
      signal: controller.signal
    })
    
    clearTimeout(timeout)
    const data = await response.json()
    
    const textBlock = data.content?.find(c => c.type === 'text')
    const reply = textBlock?.text?.trim() || ''
    
    // Try to extract JSON
    const m = reply.match(/\{[\s\S]+\}/)
    if (m) {
      const parsed = JSON.parse(m[0])
      res.status(200).json({ ok: true, question: parsed.question, note: parsed.note })
    } else {
      res.status(200).json({ ok: true, reply: reply.substring(0, 300) })
    }
  } catch (e) {
    clearTimeout(timeout)
    res.status(200).json({ error: e.name === 'AbortError' ? 'timeout' : e.message })
  }
}