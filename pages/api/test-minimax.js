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
          content: '直接输出: {"q":"你害怕什么","n":"你在保护什么"}' 
        }],
        max_tokens: 200,
        temperature: 0.3
      }),
      signal: controller.signal
    })
    
    clearTimeout(timeout)
    const data = await response.json()
    
    const textBlock = data.content?.find(c => c.type === 'text')
    const reply = textBlock?.text?.trim() || ''
    
    res.status(200).json({ 
      ok: true, 
      reply: reply,
      replyRepr: reply.replace(/\n/g, '\\n')
    })
  } catch (e) {
    clearTimeout(timeout)
    res.status(200).json({ error: e.name === 'AbortError' ? 'timeout' : e.message })
  }
}