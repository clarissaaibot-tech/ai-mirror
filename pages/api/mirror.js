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

function isChinese(text) {
  return /[\u4e00-\u9fff]/.test(text)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { input, round = 1, history = [] } = req.body

  if (!input || !input.trim()) {
    return res.status(400).json({ error: 'Input is required' })
  }

  if (round < 1 || round > 3) {
    return res.status(400).json({ error: 'Invalid round' })
  }

  // Reject unsupported languages
  if (isUnsupportedLanguage(input)) {
    return res.status(200).json({
      question: 'Please respond in English or 华文.',
      note: 'This mirror only speaks English and Chinese.',
      isOffTopic: false,
      nextRound: round,
      isComplete: false
    })
  }

  const useCN = isChinese(input) || (history.length > 0 && history.some(h => isChinese(h.input)))

  // Build context from history
  let context = ''
  if (history && history.length > 0) {
    context = history.map((h, i) => `用户${i+1}说: "${h.input}" | 镜子问: "${h.question}"`).join(' | ')
  }

  // Simple, direct prompt — avoid reasoning mode
  let prompt
  if (round === 1) {
    prompt = useCN
      ? `镜子反映用户的话，然后问一个更深入的问题。直接输出JSON，不要解释。\n用户说: "${input}"\n输出: {"question":"...","note":"..."}`
      : `Mirror reflects user's words, then asks one deeper question. Output JSON only, no explanation.\nUser: "${input}"\nOutput: {"question":"...","note":"..."}`
  } else if (round === 2) {
    prompt = useCN
      ? `镜子继续深入。上下文: ${context} | 用户最新回应: "${input}"\n直接输出JSON: {"question":"...","note":"..."}`
      : `Mirror goes deeper. Context: ${context} | Latest user response: "${input}"\nOutput JSON only: {"question":"...","note":"..."}`
  } else {
    prompt = useCN
      ? `镜子做最后反映。上下文: ${context} | 用户最后说: "${input}"\n直接输出JSON: {"question":"...","note":"..."}`
      : `Mirror final reflection. Context: ${context} | Final user words: "${input}"\nOutput JSON only: {"question":"...","note":"..."}`
  }

  const KEY = process.env.MINIMAX_API_KEY
  if (!KEY) {
    return res.status(500).json({ error: 'API key not configured' })
  }

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
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 400,
        temperature: 0.7
      }),
      signal: controller.signal
    })

    clearTimeout(timeout)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('MiniMax API error:', response.status, errorText)
      throw new Error('API error: ' + response.status)
    }

    const data = await response.json()

    // Find text block (skip thinking blocks)
    const textBlock = data.content?.find(c => c.type === 'text')
    const reply = textBlock?.text?.trim() || ''

    if (!reply) {
      throw new Error('No text block in response')
    }

    // Extract JSON
    const jsonMatch = reply.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('No JSON in reply:', reply.substring(0, 300))
      throw new Error('No JSON found')
    }

    const parsed = JSON.parse(jsonMatch[0])
    
    if (!parsed.question) {
      throw new Error('Missing question field')
    }

    parsed.nextRound = round < 3 ? round + 1 : null
    parsed.isComplete = round === 3

    res.status(200).json(parsed)

  } catch (error) {
    console.error('Mirror error:', error.message)
    
    // Fallback responses
    const fallbacks = {
      1: {
        question: useCN ? "你带着什么来到这里？" : "What are you carrying?",
        note: useCN ? "镜子注意到：你不是偶然来到这里的。" : "The mirror noticed: you didn't come here by accident."
      },
      2: {
        question: useCN ? "你刚才的回答背后——你在保护什么？" : "Beneath your answer — what are you protecting?",
        note: useCN ? "镜子注意到：你比你自己想的更接近答案。" : "The mirror noticed: you're closer than you think."
      },
      3: {
        question: useCN ? "你一直在绕同一个东西。问题不在于问题本身——而是你没问的那个问题。" : "You've been circling the same thing. The problem isn't the question. It's what you're not asking.",
        note: useCN ? "镜子注意到：你见过这个。只是移开了视线。" : "The mirror noticed: you've seen this before. You just looked away."
      }
    }

    const fallback = fallbacks[round] || fallbacks[1]
    fallback.nextRound = round < 3 ? round + 1 : null
    fallback.isComplete = round === 3

    res.status(200).json(fallback)
  }
}