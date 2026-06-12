export default async function handler(req, res) {
  const key = process.env.MINIMAX_API_KEY || 'NOT SET'
  
  const results = {}
  
  // Test 1: Standard endpoint
  try {
    const r1 = await fetch('https://api.minimax.chat/v1/text/chatcompletion_pro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({ model: 'abab6.5s-chat', tokens_to_generate: 20, messages: [{ role: 'user', content: 'hi' }] })
    })
    results.test1 = { status: r1.status, body: await r1.text() }
  } catch (e) { results.test1 = { error: e.message } }
  
  // Test 2: OpenAI compat endpoint  
  try {
    const r2 = await fetch('https://api.minimax.chat/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({ model: 'abab6.5-chat', messages: [{ role: 'user', content: 'hi' }], max_tokens: 20 })
    })
    results.test2 = { status: r2.status, body: await r2.text() }
  } catch (e) { results.test2 = { error: e.message } }
  
  // Test 3: With group_id
  try {
    const r3 = await fetch('https://api.minimax.chat/v1/text/chatcompletion_pro?group_id=default', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({ model: 'abab6.5s-chat', tokens_to_generate: 20, messages: [{ role: 'user', content: 'hi' }] })
    })
    results.test3 = { status: r3.status, body: await r3.text() }
  } catch (e) { results.test3 = { error: e.message } }
  
  // Test 4: Check env key prefix
  results.keyPrefix = key.substring(0, 10) + '...'
  results.keyLength = key.length
  
  res.status(200).json(results)
}
