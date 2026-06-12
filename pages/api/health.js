export default async function handler(req, res) {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasKey: !!process.env.MINIMAX_API_KEY,
    nodeVersion: process.version
  })
}