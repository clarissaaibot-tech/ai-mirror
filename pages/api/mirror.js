// Detect unsupported language (not English, not Chinese)
function isUnsupportedLanguage(text) {
  const chineseChars = text.match(/[\u4e00-\u9fff]/g) || []
  const englishWords = text.match(/[a-zA-Z]+/g) || []
  const hasChinese = chineseChars.length > 0
  const hasEnglish = englishWords.length > 0
  if (!hasChinese && !hasEnglish) return true
  if (hasChinese && !hasEnglish) return false
  if (hasEnglish && !hasChinese) return false
  return false
}

// Detect if text contains Chinese
function isChinese(text) {
  return /[\u4e00-\u9fff]/.test(text)
}

// Quote/story library — mixed traditions, bilingual (en + cn)
const CLOSURE_LIBRARY = [
  {
    themes: ['direction', 'lost', 'where', 'go', 'path', 'next step', 'uncertain', '迷茫', '方向', '不知道'],
    en: {
      quote: `"A butcher who had been cutting up oxen for nineteen years, his knife gleaming — its edge never dulled. He worked like a dance."\n\nZhuangzi (庄子) describes a man whose blade moves through space that doesn't exist — 无牛之地 (wú niú zhī dì, "no-ox land," the gaps between bones).\n\nYou keep cutting along lines you drew years ago. Five years. Ten years. You're so focused on the ox you forgot: the ox is already gone. You're cutting air.\n\nThe lines are the problem. Not the knife.`,
      label: '— Zhuangzi (庄子)'
    },
    cn: {
      quote: `「庖丁解牛十九年，刀刃常新。动刀之时，如舞。」\n\n庄子里讲的这位庖丁，他看见的不是牛——是牛与牛之间的空隙。无牛之地。\n\n你一直在切你五年前、十年前画的线。你以为你在解决问题，其实你一直在切空气。\n\n问题不是刀。是那些线。`,
      label: '— 《庄子》'
    }
  },
  {
    themes: ['struggle', 'fight', 'resist', 'busy', 'burnout', 'pressure', 'grind', '累', '忙', '挣扎', '压力'],
    en: {
      quote: `"Water doesn't compete. It never loses."\n\nIt flows to the lowest place — the places everyone else avoids. And over time, it shapes everything. Stone. Canyon. Ocean.\n\nWhat are you persistently fighting for? Not the water's problem. You're standing on high ground and wondering why you're thirsty.`,
      label: '— Tao Te Ching'
    },
    cn: {
      quote: `「上善若水。水善利万物而不争。」\n\n水从不争。它流向最低的地方——所有人都避开的地方。然后它塑造了一切：石头、峡谷、海。\n\n你一直在争什么？不是水的问题。是你站在高处，却纳闷自己为什么口渴。`,
      label: '— 《道德经》'
    }
  },
  {
    themes: ['ask', 'question', 'advice', 'how', 'what to do', 'help me', '怎么办', '怎么', '帮'],
    en: {
      quote: `The mirror doesn't answer questions.\n\nZhuangzi said: "The fish trap exists because of the fish. Once you've gotten the fish, you can forget the trap." You came here asking for a fish. But the mirror only shows you the trap.\n\nYou asked: "What should I do?"\n\nBut your face in the mirror is asking something else entirely. What are you protecting by looking for an answer instead of looking at yourself?`,
      label: '— Zhuangzi (庄子)'
    },
    cn: {
      quote: `镜子不回答问题。\n\n「筌者所以在鱼，得鱼而忘筌。」你来这里要鱼，但镜子只给你看筌。\n\n你问：「我应该怎么做？」\n\n但你脸上的问题不是这个。你在找答案，却不肯看自己——你在保护什么？`,
      label: '— 《庄子》'
    }
  },
  {
    themes: ['other', 'they', 'them', 'people', 'everyone', 'boss', 'partner', 'family', '别人', '他们', '家人'],
    en: {
      quote: `"To know others is intelligence. To know yourself is clarity."\n\n— Laozi, Tao Te Ching, Chapter 33\n\nYou've spent years watching others. Their mistakes. Their blind spots. Why they don't see what you see.\n\nThat mirror pointed at others — how long have you been looking into it?\n\nWhen did you last turn it around?`,
      label: '— Laozi (老子)'
    },
    cn: {
      quote: `「知人者智，自知者明。」\n\n你花了很多年看别人——他们的错、他们的盲点、他们为什么看不清。\n\n那面照向别人的镜子，你看了多少年了？\n\n什么时候转过来一次？`,
      label: '— 《道德经》'
    }
  },
  {
    themes: ['change', 'accept', 'let go', 'stop', 'resist', 'denial', 'grief', '接受', '放下', '改变', '抗拒'],
    en: {
      quote: `"When the great Tao is absent, 'kindness' and 'righteousness' appear."\n\n— Laozi, Tao Te Ching, Chapter 18\n\nThings break. People leave. Plans fail. The Tao doesn't judge any of it.\n\nWhat you're resisting is not the thing itself — you're resisting the moment it became real.\n\nThe crack in the cup: that's when it became a cup. Not before.`,
      label: '— Laozi (老子)'
    },
    cn: {
      quote: `「大道废，有仁义。」\n\n事情破裂。人离开。计划落空。道不评判任何一样。\n\n你抗拒的不是事情本身——你抗拒的是它变成现实的那一刻。\n\n杯子的裂缝：那是它成为杯子的时刻。不是之前。`,
      label: '— 《道德经》'
    }
  },
  {
    themes: ['control', 'trust', 'plan', 'future', 'fear', 'anxiety', 'worry', '控制', '担心', '焦虑', '计划'],
    en: {
      quote: `"The best athlete, when they run, forgets themselves."\n\nThey don't run from anything. They don't run toward anything. They run.\n\nWu wei (无为 wú wéi) — effortless action, action without forcing — isn't doing nothing. It's doing without the interference of your fear.\n\nYou're planning your way through something that can't be planned. The map you're holding was drawn for a country that no longer exists.`,
      label: '— Tao Te Ching'
    },
    cn: {
      quote: `「上士闻道，勤而行之。」\n\n最好的跑者，跑的时候忘记了自己。他不逃避什么，也不追求什么。他只是跑。\n\n无为，不是无所作为——是不让恐惧介入你的行动。\n\n你一直在用一张已经不存在的地图，规划一条无法规划的路。`,
      label: '— 《道德经》'
    }
  },
  {
    themes: ['identity', 'self', 'who am I', 'confidence', 'worth', 'belief', '身份', '自我', '我是谁', '自信'],
    en: {
      quote: `"He who knows others is clever. He who knows himself has clear sight."\n\n— Laozi\n\nThe story you tell about yourself — where did it start? Who told it to you first?\n\nMost people carry a self they inherited. They defend it like it was born with them.\n\nIt wasn't. And that means: it can be seen through. It can be set down.`,
      label: '— Laozi (老子)'
    },
    cn: {
      quote: `「知人者智，自知者明。」\n\n你讲给自己的那个故事——从哪里开始的？谁先告诉你的？\n\n大多数人的自我，是继承来的。他们像保护与生俱来的东西一样保护它。\n\n但那不是与生俱来的。所以，它可以看穿。它可以放下。`,
      label: '— 《道德经》'
    }
  },
  {
    themes: ['stuck', 'repeat', 'same', 'loop', 'again', 'again', 'cycle', '重复', '循环', '卡住'],
    en: {
      quote: `"The Tao that can be spoken is not the eternal Tao."\n\n— Laozi, Tao Te Ching, Chapter 1\n\nWhatever you're trying to solve — you've tried before. That's why it feels stuck. Not because it's complex. Because you've already circled it so many times that you've worn a groove.\n\nThe solution isn't in the groove. It's in the hand that keeps reaching for it.`,
      label: '— Laozi (老子)'
    },
    cn: {
      quote: `「道可道，非常道。」\n\n无论你在试着解决什么——你之前已经试过了。所以你觉得卡住了。不是因为它复杂。是因为你已经绕了太多圈，磨出了一条沟。\n\n答案不在沟里。在那只不断伸手去拿它的手里。`,
      label: '— 《道德经》'
    }
  },
  {
    themes: ['fear', 'courage', 'brave', 'risk', '敢', '怕', '勇气', '风险'],
    en: {
      quote: `"It is not the mountain we conquer, but ourselves."\n\n— Sir Edmund Hillary\n\nThe thing you're afraid of has a shape you gave it. The fear is the story. Not the mountain.\n\nSisyphus rolled the boulder up the mountain every day — not because it would stay, but because the rolling was the point. The meaning wasn't at the top. It was in the movement.\n\nWhat would you do if you stopped believing the fear's ending?`,
      label: '— Greek Wisdom'
    },
    cn: {
      quote: `「我们征服的不是山，是我们自己。」\n\n— 埃德蒙·希拉里\n\n你害怕的那件事，有一个你赋予它的形状。恐惧是故事本身。不是山。\n\n西西弗斯每天把石头推上山——不是因为石头会留在那里，而是因为推本身就是意义。意义不在山顶。在动作里。\n\n如果你不再相信恐惧的结局，你会做什么？`,
      label: '— 希腊智慧'
    }
  },
  {
    themes: ['attachment', 'love', 'relationship', 'bond', '连接', '爱', '关系', '依恋', '执着'],
    en: {
      quote: `"The wound is the place where the Light enters you."\n\n— Rumi (鲁米)\n\nYou've been protecting yourself from being wounded. That's kept you safe. But safety isn't the same as whole.\n\nRumi wrote: "Grief is the fire of loss that burns through everything until nothing remains but what cannot be burned — the real self."\n\nWhat you lost didn't diminish you. It revealed what was always bigger than what you could lose.`,
      label: '— Rumi (鲁米)'
    },
    cn: {
      quote: `「伤口是光进入你的地方。」\n\n— 鲁米 (Rumi，波斯苏菲诗人)\n\n你一直在保护自己不受伤害。这让你安全。但安全不等于完整。\n\n鲁米写道：「悲伤是失落之火，烧尽一切，直到剩下的只有烧不掉的东西——真正的自己。」\n\n你失去的没有减少你。它揭示了那个永远大于你所失去的东西。`,
      label: '— 鲁米'
    }
  },
  {
    themes: ['purpose', 'meaning', 'life', 'exist', '活着', '意义', '目的', '人生'],
    en: {
      quote: `"The unexamined life is not worth living."\n\n— Socrates (苏格拉底)\n\nYou don't need to find your purpose. You need to find the questions you've been avoiding about the purpose you've already chosen.\n\nSocrates believed: the examined life is the path. Not the answer at the end. The asking itself.\n\nWhat question have you been avoiding that would change everything if you finally asked it?`,
      label: '— Socrates (苏格拉底)'
    },
    cn: {
      quote: `「不经审视的人生，不值得过。」\n\n— 苏格拉底 (Socrates)\n\n你不需要找到你的目的。你需要找到那些你一直在回避的问题——关于你已经选择的目的。\n\n苏格拉底相信：经过审视的人生才是路。不是终点的答案。是问本身。\n\n你一直在回避哪个问题——如果终于问出来，会改变一切的那个？`,
      label: '— 苏格拉底'
    }
  },
  {
    themes: ['ego', 'defense', 'mask', 'true self', '假我', '防御', '面具', '真我'],
    en: {
      quote: `"The ego is not who you really are. It is who you think you need to be."\n\n— Carl Jung (卡尔·荣格)\n\nJung called it the shadow — the parts of yourself you've had to hide to survive. You built the ego to protect the shadow. And now you defend the ego like it IS you.\n\nBut the ego is a strategy. Not an identity. It was built for a reason. And it can be seen through.\n\nWhat would you be if you stopped needing to be anything?`,
      label: '— Carl Jung (卡尔·荣格)'
    },
    cn: {
      quote: `「小我不是你真正是谁。小我是你认为你必须成为的样子。」\n\n— 卡尔·荣格 (Carl Jung)\n\n荣格称之为阴影——那些为了活下去而不得不藏起来的部分。你建造了小我来保护阴影。现在你保护小我，就像它就是你一样。\n\n但小我是一个策略。不是身份。它因为某个原因被建造。它可以被看穿。\n\n如果你不再需要成为任何东西，你会是什么？`,
      label: '— 卡尔·荣格'
    }
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

// Get closure quote/story based on conversation themes + language
function getClosure(history, userInput) {
  const allText = (history.map(h => h.input + ' ' + h.question).join(' ') + ' ' + userInput).toLowerCase()
  const useCN = isChinese(userInput) || history.some(h => isChinese(h.input))

  let bestMatch = null
  let bestScore = 0

  for (const item of CLOSURE_LIBRARY) {
    const score = item.themes.filter(t => allText.includes(t)).length
    if (score > bestScore) {
      bestScore = score
      bestMatch = item
    }
  }

  if (!bestMatch || bestScore === 0) {
    const idx = (history.length + (useCN ? 1 : 0)) % CLOSURE_LIBRARY.length
    bestMatch = CLOSURE_LIBRARY[idx]
  }

  const lang = useCN ? 'cn' : 'en'
  return {
    quote: bestMatch[lang].quote,
    label: bestMatch[lang].label,
    lang
  }
}

// Build system prompt for each round
function buildSystemPrompt(round, history, userInput) {
  const useCN = isChinese(userInput) || (history.length > 0 && history.some(h => isChinese(h.input)))

  const langInstruction = useCN
    ? '你用华语回应。'
    : 'You respond in English.'

  const roundInstructions = {
    1: `You are a mirror. You do not give advice, answers, or solutions. You reflect what the person is carrying.

${langInstruction}

The person has just arrived and said: "${input}"

Your job:
1. FIRST: Reflect back what you heard — in their words, show them you really heard it
2. Then: Ask ONE question that goes deeper than what they just told you — something they're protecting, avoiding, or haven't faced yet
3. Write a brief note explaining what you noticed beneath their words

Example: If they say "I'm scared" — don't just ask "what are you afraid of?" First reflect: "You said you're scared — not of something specific, but scared in general." Then ask a question that cuts deeper.

Your question should:
- Acknowledge what they actually said (not a generic opener)
- Use their own words when possible
- Be direct and piercing
- Point to what they're not seeing
- Make them feel seen, not judged

IMPORTANT TOPIC BOUNDARY: If they ask you to do something (write, help, generate, explain something not about themselves), do NOT do it. Use their question as mirror material — reflect it back as what they're avoiding.

Format: JSON { "question": "Your question here, using <em> for emphasized words", "note": "2-3 sentence explanation of what the mirror noticed", "isOffTopic": false }`,

    2: `You are a mirror. You do not give advice or answers. You reflect.

${langInstruction}

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

${langInstruction}

Look at everything they've said across all rounds. Identify the ONE thing they've been circling around but haven't faced directly.

Say it plainly — with the clarity of a mirror showing what's really there.

Then deliver a closing reflection — a quote or short story from the wisdom traditions that matches their theme. If they wrote in Chinese, use Chinese for the closing quote. If they wrote in English, use English.

Format: JSON { "question": "The final mirror reflection — what they've been avoiding", "note": "Brief note on what this final moment revealed", "closure": "The quote or story (3-5 sentences)", "closureLabel": "Source attribution", "isOffTopic": false }`
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

  // Reject unsupported languages (only EN + CN allowed)
  if (isUnsupportedLanguage(input)) {
    return res.status(200).json({
      question: 'Please respond in English or 华文.',
      note: 'This mirror only speaks English and Chinese.',
      isOffTopic: false,
      nextRound: round,
      isComplete: false
    })
  }

  const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY || 'sk-api-LLbeCHoL3z5I_2u5-Sul3jQtpa6JDC5UxIRON5QuBV-wAQ9HVsfJkNLvmvGWBOVOWmP9DvEJ16W4PrgJI5b3ePJLlqC2K-VLTs25SH_tVmAIc_tUxmwzMwE'

  const systemPrompt = buildSystemPrompt(round, history, input)
  const userMessage = buildUserMessage(input, round, history)

  try {
    // Use MiniMax-M2.7 via Anthropic-compatible endpoint
    const response = await fetch('https://api.minimax.io/anthropic/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MINIMAX_API_KEY}`
      },
      body: JSON.stringify({
        model: 'MiniMax-M2.7',
        messages: [
          { role: 'user', content: systemPrompt + '\n\nUser: ' + userMessage }
        ],
        max_tokens: 512,
        temperature: 0.8
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('MiniMax API error:', response.status, errorText)
      return res.status(500).json({ error: 'AI service error', details: errorText })
    }

    const data = await response.json()
    console.log('MiniMax response:', JSON.stringify(data))

    // Parse response — Anthropic-compatible format
    let reply = ''
    
    if (data.content?.[0]?.text) {
      reply = data.content[0].text.trim()
    } else if (data.content?.[0]?.type === 'text') {
      reply = data.content[0].text.trim()
    } else if (data.content) {
      // Find first text block
      const textBlock = data.content.find(c => c.type === 'text')
      reply = textBlock?.text?.trim() || ''
    }
    
    if (!reply) {
      console.error('Could not parse MiniMax response:', JSON.stringify(data))
      throw new Error('Could not parse response')
    }

    // Parse JSON from response
    const jsonMatch = reply.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      
      // Add closure for round 3
      if (round === 3 && !parsed.closure) {
        const closureData = getClosure(history, input)
        parsed.closure = closureData.quote
        parsed.closureLabel = closureData.label
        parsed.closureLang = closureData.lang
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
    const useCN = isChinese(input) || (history && history.some(h => isChinese(h.input)))
    const closureData = getClosure(history || [], input)

    const fallbacks = {
      1: {
        question: useCN ? "你带着什么来到这里？" : "You came here with something on your mind. What is it that you've been <em>carrying alone</em>?",
        note: useCN ? "镜子注意到：你不是偶然来到这里的。" : "The mirror noticed: you didn't come here by accident.",
        isOffTopic: false
      },
      2: {
        question: useCN ? "你刚才的回答背后——你在保护什么？" : "You just answered — but there's something <em>beneath</em> what you said. What are you protecting by answering that way?",
        note: useCN ? "镜子注意到：你比你自己想的更接近答案。" : "The mirror noticed: you're closer than you think.",
        isOffTopic: false
      },
      3: {
        question: useCN ? "你一直在绕同一个东西。问题不在于问题本身——而是你没问的那个问题。" : "You've been circling the same thing. The problem isn't the question. <em>It's what you're not asking.</em>",
        note: useCN ? "镜子注意到：你见过这个。只是移开了视线。" : "The mirror noticed: you've seen this before. You just looked away.",
        isOffTopic: false
      }
    }

    const fallback = fallbacks[round] || fallbacks[1]

    if (round === 3) {
      fallback.closure = closureData.quote
      fallback.closureLabel = closureData.label
      fallback.closureLang = closureData.lang
      fallback.closureType = 'quote'
    }

    fallback.nextRound = round < 3 ? round + 1 : null
    fallback.isComplete = round === 3

    res.status(200).json(fallback)
  }
}