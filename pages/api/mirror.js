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
    const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_pro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MINIMAX_API_KEY}`
      },
      body: JSON.stringify({
        model: 'abab6.5s-chat',
        tokens_to_generate: 512,
        temperature: 0.8,
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
    console.log('MiniMax response:', JSON.stringify(data))

    // Try multiple parsing approaches
    let reply = ''
    
    // Try: choices[0].messages[0].text
    if (data.choices?.[0]?.messages?.[0]?.text) {
      reply = data.choices[0].messages[0].text.trim()
    }
    // Try: choices[0].messages[0].content  
    else if (data.choices?.[0]?.messages?.[0]?.content) {
      reply = data.choices[0].messages[0].content.trim()
    }
    // Try: choices[0].message.content
    else if (data.choices?.[0]?.message?.content) {
      reply = data.choices[0].message.content.trim()
    }
    // Try: choices[0].text
    else if (data.choices?.[0]?.text) {
      reply = data.choices[0].text.trim()
    }
    // Try: choices[0].delta.content
    else if (data.choices?.[0]?.delta?.content) {
      reply = data.choices[0].delta.content.trim()
    }
    // Try: base_resp (some MiniMax responses)
    else if (data.base_resp?.error_msg) {
      throw new Error(data.base_resp.error_msg)
    }
    // Fallback
    else {
      console.error('Could not parse MiniMax response:', JSON.stringify(data))
      throw new Error('Could not parse response')
    }

    // Parse the JSON response
    const jsonMatch = reply.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      res.status(200).json(parsed)
    } else {
      throw new Error('No JSON found in response')
    }
  } catch (error) {
    console.error('Error:', error)
    
    // Richer fallbacks based on input keywords
    const fallbacks = [
      {
        triggers: ['work', 'job', 'career', 'boss', 'office'],
        question: "What if the real problem isn't your job, but <em>why you chose it</em>?",
        note: "The mirror notices: you mentioned work. But you didn't say why you do it. Most people don't."
      },
      {
        triggers: ['relationship', 'partner', 'love', 'married', 'dating'],
        question: "What are you <em>avoiding</em> about this relationship by focusing on them?",
        note: "The mirror notices: when we talk about relationships, we're often talking about ourselves."
      },
      {
        triggers: ['family', 'parent', 'mother', 'father', 'sibling'],
        question: "What would you see if you looked at <em>your role</em> in this, not theirs?",
        note: "The mirror notices: family patterns repeat because we play our parts without asking why."
      },
      {
        triggers: ['money', 'financial', 'debt', 'business'],
        question: "What assumption are you making about <em>what you need</em>?",
        note: "The mirror notices: financial stress often hides a deeper question about security and self-worth."
      },
      {
        triggers: ['decision', 'choice', 'confused', 'stuck'],
        question: "What would you do if you weren't <em>afraid of being wrong</em>?",
        note: "The mirror notices: confusion is often fear dressed up in logic."
      },
      {
        triggers: ['anxious', 'anxiety', 'worry', 'stress', 'overwhelm'],
        question: "What are you <em>carrying that isn't yours</em>?",
        note: "The mirror notices: anxiety can be empathy taken too far — borrowed weight you forgot to put down."
      },
      {
        triggers: ['sad', 'depressed', 'empty', 'numb', 'lost'],
        question: "What did you <em>stop saying</em> that you needed to say?",
        note: "The mirror notices: sadness that has no name is often grief for something we never acknowledged."
      },
      {
        triggers: ['future', 'goal', 'plan', 'dream', 'purpose'],
        question: "What if <em>you're already living</em> the beginning of it, and you can't see it?",
        note: "The mirror notices: we often visualize the destination while avoiding the path we're already on."
      },
      {
        triggers: ['past', 'regret', 'memory', 'should have', 'would have'],
        question: "What are you <em>protecting</em> by holding onto this?",
        note: "The mirror notices: regret is often a story we tell ourselves to avoid the risk of trying again."
      },
      {
        triggers: ['self', 'identity', 'who am I', 'myself', 'confidence'],
        question: "When did you first <em>decide</em> that about yourself?",
        note: "The mirror notices: the stories we tell about ourselves were decisions we made — which means we can unmake them."
      }
    ]
    
    // Find matching fallback
    const lowerInput = input.toLowerCase()
    let matchedFallback = fallbacks[0]
    
    for (const fb of fallbacks) {
      if (fb.triggers.some(t => lowerInput.includes(t))) {
        matchedFallback = fb
        break
      }
    }
    
    res.status(200).json(matchedFallback)
  }
}