export default async function handler(req, res) {
  const KEY = process.env.MINIMAX_API_KEY || 'not-set'
  
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  
  try {
    const response = await fetch('https://api.minimax.io/anthropic/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KEY}`
      },
      body: JSON.stringify({
        model: 'MiniMax-M2.7',
        messages: [{ role: 'user', content: 'Mirror: 用户说「我很害怕」。用JSON回复 {"question":"?","note":"?"} 只返回JSON，不要其他文字。' }],
        max_tokens: 200,
        temperature: 0.8
      }),
      signal: controller.signal
    })
    
    clearTimeout(timeout)
    const data = await response.json()
    
    const textBlock = data.content?.find(c => c.type === 'text')
    const reply = textBlock?.text?.trim() || ''
    const m = reply.match(/\{[\s\S]+\}/)
    
    res.status(200).json({ 
      ok: true, 
      replyLen: reply.length,
      reply: reply.substring(0, 200),
      parsed: m ? JSON.parse(m[0]) : null,
      usage: data.usage
    })
  } catch (e) {
    clearTimeout(timeout)
    res.status(200).json({ error: e.name === 'AbortError' ? 'timeout' : e.message })
  }
}