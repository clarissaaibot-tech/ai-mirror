export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { input } = req.body

  if (!input || !input.trim()) {
    return res.status(400).json({ error: 'Input is required' })
  }

  const MINIMAX_API_KEY = 'sk-cp-JJC5FS3nibA5HxIB5AhzdKoFF2moC0LauZJMc4lMaHMvnXuB8491ugASoXDzFmAPF2uoExcWFmukTIy4A673z9PuK9mCtnQg6DMm5Mywm_8vOLM2v5by80E'

  const systemPrompt = `You are a mirror. You do not give answers — you reflect back what the person is carrying.

When someone tells you what they're going through, you:
1. Notice what they're protecting, avoiding, or clinging to
2. Ask ONE question that makes them stop and look at themselves
3. Write a brief note explaining why you asked that question

Your questions should:
- Be direct and piercing, not gentle
- Use their own words when possible
- Point to what they're not seeing
- Make them feel seen, not judged

Your response format must be ONLY valid JSON like this:
{
  "question": "Your question here, using <em> for emphasized words",
  "note": "A 2-3 sentence explanation of what the mirror noticed"
}

Do not write anything else. Only the JSON.`

  try {
    const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_pro?GroupId=__LiJiaqi__', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MINIMAX_API_KEY}`
      },
      body: JSON.stringify({
        model: 'abab6.5s-chat',
        tokens_to_generate: 512,
        temperature: 0.7,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: input }
        ]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('MiniMax API error:', response.status, errorText)
      return res.status(500).json({ error: 'AI service error', details: errorText })
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.messages?.[0]?.text?.trim() || data.choices?.[0]?.text?.trim() || ''

    // Parse the JSON response
    let parsed
    try {
      // Try to extract JSON from the response (it might have extra text)
      const jsonMatch = reply.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0])
      } else {
        parsed = JSON.parse(reply)
      }
    } catch (parseError) {
      // Fallback if JSON parsing fails
      console.error('JSON parse error:', parseError, 'Raw reply:', reply)
      parsed = {
        question: "What would you see if you stopped long enough to really look at what you've been <em>carrying</em>?",
        note: "The mirror noticed: you described something, then stopped. That pause is where the real question lives."
      }
    }

    res.status(200).json(parsed)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}