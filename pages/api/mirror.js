// Quote/story library — all in English, Chinese terms use pinyin
const CLOSURE_LIBRARY = [
  {
    themes: ['direction', 'lost', 'where', 'go', 'path', 'next step', 'uncertain'],
    content: `"A butcher who had been cutting up oxen for nineteen years, his knife gleaming — its edge never dulled. He worked like a dance."\n\nZhuangzi (庄子 Zhuāngzi) describes a man whose blade moves through space that doesn't exist — 无牛之地 (wú niú zhī dì, "no-ox land," the gaps between bones).\n\nYou keep cutting along lines you drew years ago. Five years. Ten years. You're so focused on the ox you forgot: the ox is already gone. You're cutting air.\n\nThe lines are the problem. Not the knife.`
  },
  {
    themes: ['struggle', 'fight', 'resist', 'busy', 'burnout', 'pressure', 'grind'],
    content: `"Water doesn't compete. It never loses."\n\nIt flows to the lowest place — the places everyone else avoids. And over time, it shapes everything. Stone. Canyon. Ocean.\n\n你一直在争什么？(Nǐ yīzhí zài zhēng shénme? — What are you persistently fighting for?)\n\nNot the water's problem. You're standing on high ground and wondering why you're thirsty.`
  },
  {
    themes: ['ask', 'question', 'advice', 'how', 'what to do', 'help me'],
    content: `The mirror doesn't answer questions.\n\nZhuangzi said: "The fish trap exists because of the fish. Once you've gotten the fish, you can forget the trap." You came here asking for a fish. But the mirror only shows you the trap.\n\nYou asked: "What should I do?"\n\nBut your face in the mirror is asking something else entirely. What are you protecting by looking for an answer instead of looking at yourself?`
  },
  {
    themes: ['other', 'they', 'them', 'people', 'everyone', 'boss', 'partner', 'family'],
    content: `"To know others is intelligence. To know yourself is clarity."\n\n— Laozi (老子 Lǎozǐ), Tao Te Ching, Chapter 33\n\nYou've spent years watching others. Their mistakes. Their blind spots. Why they don't see what you see.\n\n那面照向别人的镜子 (Nà miàn zhào xiàng biérén de jìngzi — That mirror pointed at others) — how long have you been looking into it?\n\nWhen did you last turn it around?`
  },
  {
    themes: ['change', 'accept', 'let go', 'stop', 'resist', 'denial', 'grief'],
    content: `"When the great Tao is absent, 'kindness' and 'righteousness' appear."\n\n— Laozi, Tao Te Ching, Chapter 18\n\nThings break. People leave. Plans fail. The Tao doesn't judge any of it.\n\n你抗拒的不是事情本身 (Nǐ kàngjù de bú shì shìqíng běntǐ — What you're resisting is not the thing itself) — you're resisting the moment it became real.\n\nThe crack in the cup: that's when it became a cup. Not before.`
  },
  {
    themes: ['control', 'trust', 'plan', 'future', 'fear', 'anxiety', 'worry'],
    content: `"The best athlete, when they run, forgets themselves."\n\nThey don't run from anything. They don't run toward anything. They run.\n\n无为 (wú wéi — effortless action, action without forcing) isn't doing nothing. It's doing without the interference of your fear.\n\nYou're planning your way through something that can't be planned. The map you're holding was drawn for a country that no longer exists.`
  },
  {
    themes: ['identity', 'self', 'who am I', 'confidence', 'worth', 'belief'],
    content: `"He who knows others is clever. He who knows himself has clear sight."\n\n— Laozi\n\nThe story you tell about yourself — where did it start? Who told it to you first?\n\nMost people carry a self they inherited. They defend it like it was born with them.\n\nIt wasn't. And that means: it can be seen through. It can be set down.`
  },
  {
    themes: ['stuck', 'repeat', 'same', 'loop', 'again', 'again', 'cycle'],
    content: `"The Tao that can be spoken is not the eternal Tao."\n\n— Laozi, Tao Te Ching, Chapter 1\n\nWhatever you're trying to solve — you've tried before. That's why it feels stuck. Not because it's complex. Because you've already circled it so many times that you've worn a groove.\n\nThe solution isn't in the groove. It's in the hand that keeps reaching for it.`
  }
]

// Detect off-topic input
function isOffTopic(input) {
  const offTopicPatterns = [
    /^what('s| is| was| would)/i,
    /^(can|could) you (help|write|make|create|give|tell)/i,
    /^(how|what) (do|does|is|are|weather|time|date)/i,
    /^(what|who|where|when|why) (is|are|was|were|do|does)/i,
    /^(i )?need (help|someone|advice|a)/i,
    /^(can|could) (i|you) (ask|get|have)/i,
    /^(hi|hello|hey|good morning|good afternoon)/i,
    /^(thanks|thank you)/i,
    /^(sorry|apologize)/i,
    /^(bye|goodbye|exit|quit|stop)/i,
    /^(what('s| is) your name|who are you|what are you)/i,
    /^generate/i,
    /^(joke|funny|make me laugh)/i,
    /^translate/i,
    /^(weather|news|stock)/i,
  ]
  return offTopicPatterns.some(p => p.test(input.trim()))
}

// Get closure quote/story based on conversation themes
function getClosure(history) {
  const allText = history.map(h => h.input + ' ' + h.question).join(' ').toLowerCase()
  
  let bestMatch = null
  let bestScore = 0
  
  for (const item of CLOSURE_LIBRARY) {
    const score = item.themes.filter(t => allText.includes(t)).length
    if (score > bestScore) {
      bestScore = score
      bestMatch = item
    }
  }
  
  // If no clear match, pick by round (deterministic)
  if (!bestMatch || bestScore === 0) {
    const idx = history.length % CLOSURE_LIBRARY.length
    bestMatch = CLOSURE_LIBRARY[idx]
  }
  
  return bestMatch.content
}

// Build system prompt for each round
function buildSystemPrompt(round, history) {
  const roundInstructions = {
    1: `You are a mirror. You do not give advice, answers, or solutions. You reflect what the person is carrying.

The person has just arrived. They may say something specific or something vague. Your job:
1. Notice what they're bringing in — what are they protecting, avoiding, or clinging to?
2. Ask ONE question that stops them cold. Make them look at themselves.
3. Write a brief note explaining what you noticed and why you asked that question.

Your question should:
- Be direct and piercing
- Use their own words when possible
- Point to what they're not seeing
- Make them feel seen, not judged

IMPORTANT TOPIC BOUNDARY: If they ask you to do something (write, help, generate, explain something not about themselves), do NOT do it. Use their question as mirror material — reflect it back as what they're avoiding. Example: if they ask "can you help me write an email?", respond with: "You just asked me to do something for you. But you came here with something else. What are you avoiding by asking me to do that instead of looking at what you're carrying?"

Format: JSON { "question": "Your question here, using <em> for emphasized words", "note": "2-3 sentence explanation of what the mirror noticed", "isOffTopic": false }`,

    2: `You are a mirror. You do not give advice or answers. You reflect.

The person has answered your first question. Now go deeper.

Look at:
- What they said in their answer
- What they didn't say but almost said
- The pattern they're protecting
- What they're avoiding by answering the way they did

Ask ONE question that cuts deeper than the first. This should make them face something they're not seeing.

If they try to go off-topic or ask you to do something, use their question as mirror material — reflect it back as what they're avoiding.

Format: JSON { "question": "Your question here, using <em> for emphasized words", "note": "2-3 sentence explanation of what the mirror noticed", "isOffTopic": false }`,

    3: `You are a mirror. This is the last round.

Look at everything they've said across all rounds. Identify the ONE thing they've been circling around but haven't faced directly.

Say it plainly — with the clarity of a mirror showing what's really there.

Then deliver a closing reflection — a quote or short story from the wisdom traditions that matches their theme. Use Chinese terms with pinyin romanization in parentheses the first time.

Format: JSON { "question": "The final mirror reflection — what they've been avoiding", "note": "Brief note on what this final moment revealed", "closure": "The quote or story (3-5 sentences, in English with Chinese terms explained in pinyin)", "closureType": "quote", "isOffTopic": false }`
  }

  // Build conversation history for context
  let context = ''
  if (history && history.length > 0) {
    context = '\n\nPrevious exchanges for context:\n'
    history.forEach((h, i) => {
      context += `\nRound ${i + 1}: User said — "${h.input}"\nMirror asked — "${h.question}"\n`
    })
    context += '\nUse this context to go deeper. Do not repeat questions already asked.'
  }

  return roundInstructions[round] + context
}

// Build user message with off-topic handling
function buildUserMessage(input, round, history) {
  if (isOffTopic(input)) {
    return `IMPORTANT: The user just asked me something that isn't about looking at themselves. Their question was: "${input}"
\nUse this question as mirror material. The fact that they asked this instead of engaging with the mirror IS the mirror. What are they avoiding by asking this? What would they rather focus on than look at themselves?\n\nRespond as a mirror. Ask them what they're avoiding. Use their words.`
  }
  return input
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { input, round = 1, history = [] } = req.body

  if (!input || !input.trim()) {
    return res.status(400).json({ error: 'Input is required' })
  }

  // Validate round
  if (round < 1 || round > 3) {
    return res.status(400).json({ error: 'Invalid round' })
  }

  const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || 'sk-api-LLbeCHoL3z5I_2u5-Sul3jQtpa6JDC5UxIRON5QuBV-wAQ9HVsfJkNLvmvGWBOVOWmP9DvEJ16W4PrgJI5b3ePJLlqC2K-VLTs25SH_tVmAIc_tUxmwzMwE'

  const systemPrompt = buildSystemPrompt(round, history)
  const userMessage = buildUserMessage(input, round, history)

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
          { role: 'user', content: userMessage }
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

    // Parse response — try multiple field paths
    let reply = ''
    
    if (data.choices?.[0]?.messages?.[0]?.text) {
      reply = data.choices[0].messages[0].text.trim()
    } else if (data.choices?.[0]?.messages?.[0]?.content) {
      reply = data.choices[0].messages[0].content.trim()
    } else if (data.choices?.[0]?.message?.content) {
      reply = data.choices[0].message.content.trim()
    } else if (data.choices?.[0]?.text) {
      reply = data.choices[0].text.trim()
    } else if (data.choices?.[0]?.delta?.content) {
      reply = data.choices[0].delta.content.trim()
    } else if (data.base_resp?.error_msg) {
      throw new Error(data.base_resp.error_msg)
    } else {
      console.error('Could not parse MiniMax response:', JSON.stringify(data))
      throw new Error('Could not parse response')
    }

    // Parse JSON from response
    const jsonMatch = reply.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      
      // Add closure for round 3
      if (round === 3 && !parsed.closure) {
        parsed.closure = getClosure(history)
        parsed.closureType = 'quote'
      }
      
      // Add next round indicator
      parsed.nextRound = round < 3 ? round + 1 : null
      parsed.isComplete = round === 3
      
      res.status(200).json(parsed)
    } else {
      throw new Error('No JSON found in response')
    }
  } catch (error) {
    console.error('Error:', error)
    
    // Fallback based on round
    const fallbacks = {
      1: {
        question: "You came here with something on your mind. What is it that you've been <em>carrying alone</em>?",
        note: "The mirror noticed: you didn't come here by accident.",
        isOffTopic: false
      },
      2: {
        question: "You just answered — but there's something <em>beneath</em> what you said. What are you protecting by answering that way?",
        note: "The mirror noticed: you're closer than you think.",
        isOffTopic: false
      },
      3: {
        question: "You've been circling the same thing. The problem isn't the question. <em>It's what you're not asking.</em>",
        note: "The mirror noticed: you've seen this before. You just looked away.",
        closure: `"The Tao that can be spoken is not the eternal Tao."\n\n— Laozi, Tao Te Ching, Chapter 1\n\nThe answer you've been looking for isn't in the question you've been asking. It's in the question you've been avoiding.\n\nYou already know what that is. You've known for a while.`,
        closureType: 'quote',
        isOffTopic: false
      }
    }
    
    const fallback = fallbacks[round] || fallbacks[1]
    
    if (round === 3) {
      fallback.closure = getClosure(history)
      fallback.closureType = 'quote'
    }
    
    fallback.nextRound = round < 3 ? round + 1 : null
    fallback.isComplete = round === 3
    
    res.status(200).json(fallback)
  }
}