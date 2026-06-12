export default async function handler(req, res) {
  const KEY = process.env.MINIMAX_API_KEY || 'not-set'
  
  const systemPrompt = `You are a mirror. You do not give advice, answers, or solutions. You reflect what the person is carrying.

你用华语回应。

The person has just arrived and said: "我很害怕"

Your job:
1. FIRST: Reflect back what you heard — in their words, show them you really heard it
2. Then: Ask ONE question that goes deeper than what they just told you
3. Write a brief note explaining what you noticed beneath their words

Format: JSON { "question": "Your question here, using <em> for emphasized words", "note": "2-3 sentence explanation of what the mirror noticed", "isOffTopic": false }`

  const userMessage = '我很害怕'
  
  try {
    const response = await fetch('https://api.minimax.io/anthropic/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KEY}`
      },
      body: JSON.stringify({
        model: 'MiniMax-M2.7',
        messages: [{ role: 'user', content: systemPrompt + '\n\nUser: ' + userMessage }],
        max_tokens: 1500,
        temperature: 0.8
      })
    })
    
    const data = await response.json()
    console.log('MiniMax response:', JSON.stringify(data))
    
    // Parse the response like mirror.js does
    let reply = ''
    if (data.content && Array.isArray(data.content)) {
      const textBlock = data.content.find(c => c.type === 'text')
      if (textBlock?.text) {
        reply = textBlock.text.trim()
      }
    }
    
    if (!reply) {
      res.status(500).json({ error: 'no text block', content: data.content?.map(c => ({type: c.type})) })
      return
    }
    
    console.log('Reply length:', reply.length)
    
    // Try to parse JSON
    const jsonMatch = reply.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      res.status(200).json({
        status: response.status,
        replyLen: reply.length,
        question: parsed.question ? parsed.question.substring(0, 100) : 'MISSING',
        note: parsed.note ? parsed.note.substring(0, 80) : 'MISSING'
      })
    } else {
      res.status(500).json({ 
        error: 'no JSON found in reply',
        replyStart: reply.substring(0, 200)
      })
    }
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}