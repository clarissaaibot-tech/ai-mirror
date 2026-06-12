export default async function handler(req, res) {
  const key = process.env.MINIMAX_API_KEY || 'NOT SET'
  const masked = key.substring(0, 8) + '...' + key.substring(key.length - 4)
  res.status(200).json({ 
    keyPrefix: masked,
    keyLength: key.length,
    hasKey: !!key && key !== 'NOT SET'
  })
}
