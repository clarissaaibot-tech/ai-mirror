'use client'

import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'

export default function Home() {
  const [step, setStep] = useState('landing') // landing | roundInput | mirror | complete
  const [round, setRound] = useState(1)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([]) // [{input, question}]
  const [mirrorQuestion, setMirrorQuestion] = useState('')
  const [mirrorNote, setMirrorNote] = useState('')
  const [closure, setClosure] = useState('')
  const [closureLabel, setClosureLabel] = useState('')
  const [loading, setLoading] = useState(false)
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 })
  const [mounted, setMounted] = useState(false)
  const [ripplesVersion, setRipplesVersion] = useState(0)
  const canvasRef = useRef(null)
  const rippleCanvasRef = useRef(null)
  const cursorRef = useRef({ x: -100, y: -100, tx: -100, ty: -100 })
  const ripplesRef = useRef([])
  const conversationRef = useRef([]) // full conversation log for display

  useEffect(() => {
    setMounted(true)
  }, [])

  // Water background animation
  useEffect(() => {
    if (!mounted) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let time = 0
    let animationId

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      time += 0.008

      for (let i = 0; i < 6; i++) {
        ctx.beginPath()
        for (let x = 0; x <= canvas.width; x += 3) {
          const baseY = canvas.height * (0.35 + i * 0.04)
          const y = baseY + Math.sin(x * 0.006 + time + i * 0.7) * (8 + i * 2)
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        const alpha = 0.06 - i * 0.008
        ctx.strokeStyle = `rgba(158, 224, 224, ${alpha})`
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [mounted])

  // Ripple animation
  useEffect(() => {
    if (!mounted) return
    const canvas = rippleCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    let animationId

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      ripplesRef.current = ripplesRef.current
        .map(r => ({ ...r, r: r.r + 1.2, opacity: r.opacity * 0.988 }))
        .filter(r => r.opacity > 0.01)

      ripplesRef.current.forEach(ripple => {
        ctx.beginPath()
        ctx.arc(ripple.x, ripple.y, ripple.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(158, 224, 240, ${ripple.opacity * 0.6})`
        ctx.lineWidth = 1.5
        ctx.stroke()

        if (ripple.r > 12) {
          ctx.beginPath()
          ctx.arc(ripple.x, ripple.y, ripple.r - 12, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(107, 183, 178, ${ripple.opacity * 0.35})`
          ctx.lineWidth = 1
          ctx.stroke()
        }
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [mounted])

  // Smooth cursor
  useEffect(() => {
    if (!mounted) return
    let raf

    const move = () => {
      cursorRef.current.x += (cursorRef.current.tx - cursorRef.current.x) * 0.28
      cursorRef.current.y += (cursorRef.current.ty - cursorRef.current.y) * 0.28
      setCursorPos({ x: cursorRef.current.x, y: cursorRef.current.y })
      raf = requestAnimationFrame(move)
    }
    raf = requestAnimationFrame(move)
    return () => cancelAnimationFrame(raf)
  }, [mounted])

  // Mouse events
  useEffect(() => {
    if (!mounted) return

    const handleMouseMove = (e) => {
      cursorRef.current.tx = e.clientX
      cursorRef.current.ty = e.clientY
      if (Math.random() < 0.025) {
        ripplesRef.current = [...ripplesRef.current, { x: e.clientX, y: e.clientY, r: 0, opacity: 0.7 }]
      }
    }

    const handleClick = (e) => {
      const count = Math.floor(Math.random() * 3) + 1
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2
        const dist = 25 + i * 20
        ripplesRef.current = [...ripplesRef.current, {
          x: e.clientX + Math.cos(angle) * dist,
          y: e.clientY + Math.sin(angle) * dist,
          r: 0,
          opacity: 0.7
        }]
      }
      setRipplesVersion(v => v + 1)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
    }
  }, [mounted])

  // Submit to mirror API
  const submitToMirror = async (userInput, currentRound, currentHistory) => {
    setLoading(true)
    try {
      const res = await fetch('/api/mirror', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: userInput,
          round: currentRound,
          history: currentHistory
        })
      })
      const data = await res.json()

      // Update conversation log
      conversationRef.current = [
        ...conversationRef.current,
        { role: 'user', text: userInput },
        { role: 'mirror', question: data.question, note: data.note }
      ]

      setMirrorQuestion(data.question)
      setMirrorNote(data.note)
      setClosure(data.closure || '')
      setClosureLabel(data.closureLabel || '')
      setStep('mirror')
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  // First screen: user enters what they're going through
  const handleFirstSubmit = async () => {
    if (!input.trim() || loading) return
    const currentHistory = [...history]
    await submitToMirror(input, 1, currentHistory)
    setRound(2)
  }

  // Subsequent rounds: user answers mirror's question
  const handleRoundSubmit = async () => {
    if (!input.trim() || loading) return
    const newHistoryEntry = { input, question: mirrorQuestion }
    const currentHistory = [...history, newHistoryEntry]
    await submitToMirror(input, round, currentHistory)

    if (round < 3) {
      setRound(round + 1)
    }
  }

  // After seeing mirror's question, user answers it
  const handleAnswerSubmit = async () => {
    if (!input.trim() || loading) return
    const newHistoryEntry = { input, question: mirrorQuestion }
    const currentHistory = [...history, newHistoryEntry]
    await submitToMirror(input, round, currentHistory)

    if (round < 3) {
      setRound(round + 1)
    }
  }

  const handleReset = () => {
    setInput('')
    setMirrorQuestion('')
    setMirrorNote('')
    setClosure('')
    setClosureLabel('')
    setRound(1)
    setHistory([])
    conversationRef.current = []
    setStep('question')
  }

  const handleComplete = () => {
    setStep('complete')
  }

  // Start over from complete screen
  const handleStartOver = () => {
    setInput('')
    setMirrorQuestion('')
    setMirrorNote('')
    setClosure('')
    setClosureLabel('')
    setRound(1)
    setHistory([])
    conversationRef.current = []
    setStep('landing')
  }

  // Round labels
  const roundLabel = round === 1 ? 'Round one' : round === 2 ? 'Round two' : 'Round three'

  return (
    <>
      <Head>
        <title>AI as Mirror — Clarity</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Inter:wght@300;400&display=swap" rel="stylesheet" />
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body {
            background: #0a0a0a;
            color: #9ee0e0;
            font-family: 'Inter', -apple-system, sans-serif;
            min-height: 100vh;
            overflow: hidden;
            cursor: none;
            user-select: none;
            -webkit-user-select: none;
          }
          ::selection { background: transparent; }
          textarea { user-select: text; -webkit-user-select: text; cursor: text !important; }
          button { cursor: none !important; }
          a { cursor: none !important; }
          @keyframes cursorPulse {
            0%, 100% { transform: scale(1); opacity: 0.6; }
            50% { transform: scale(1.4); opacity: 0.3; }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}</style>
      </Head>

      {/* Water background */}
      <div style={{
        position: 'fixed', top: 0, left: 0,
        width: '100vw', height: '100vh', zIndex: 0,
        backgroundImage: 'url(/water-bg.jpg)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        animation: 'waterFlow 25s ease-in-out infinite',
      }} />

      <style>{`
        @keyframes waterFlow {
          0%, 100% { transform: scale(1.05) translateY(0); }
          50% { transform: scale(1.08) translateY(-2%); }
        }
      `}</style>

      {/* Ripple canvas */}
      <canvas
        ref={rippleCanvasRef}
        style={{
          position: 'fixed', top: 0, left: 0,
          width: '100vw', height: '100vh', zIndex: 2,
          pointerEvents: 'none'
        }}
      />

      {/* Dark overlay */}
      <div style={{
        position: 'fixed', top: 0, left: 0,
        width: '100vw', height: '100vh',
        background: 'radial-gradient(ellipse at center, rgba(10,10,10,0.4) 0%, rgba(10,10,10,0.85) 100%)',
        zIndex: 1, pointerEvents: 'none'
      }} />

      {/* Custom cursor */}
      {mounted && (
        <div style={{
          position: 'fixed', left: cursorPos.x, top: cursorPos.y,
          width: 24, height: 24, transform: 'translate(-50%, -50%)',
          zIndex: 9999, pointerEvents: 'none',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0,
            width: '100%', height: '100%',
            border: '1px solid rgba(158, 224, 224, 0.6)',
            borderRadius: '50%',
            animation: 'cursorPulse 2s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 5, height: 5, background: '#9ee0e0',
            borderRadius: '50%', transform: 'translate(-50%, -50%)',
          }} />
        </div>
      )}

      {/* Top bar */}
      <div style={{
        position: 'relative', zIndex: 10,
        padding: '20px 32px', display: 'flex', justifyContent: 'flex-end',
      }}>
        <a
          href="https://mirrorstreams.substack.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 17, letterSpacing: 1, color: '#9ee0e0',
            textDecoration: 'none', opacity: 1, transition: 'opacity 0.3s',
          }}
        >
          dive into the why
        </a>
      </div>

      {/* Main content */}
      <main style={{
        position: 'relative', zIndex: 10, flex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: '85vh', padding: '0 24px', textAlign: 'center',
      }}>

        {/* LANDING */}
        {step === 'landing' && (
          <div style={{ animation: 'fadeIn 0.8s ease forwards' }}>
            <h1 style={{
              fontSize: 34, fontWeight: 400, lineHeight: 1.4,
              marginBottom: 24, color: 'rgba(158, 224, 224, 0.85)',
              fontFamily: "'Cormorant Garamond', serif",
            }}>
              AI as Mirror
            </h1>
            <p style={{
              fontSize: 17, color: 'rgba(158, 224, 224, 0.5)',
              lineHeight: 1.9, maxWidth: 520, marginBottom: 16,
            }}>
              AI answers only reflect <strong style={{ color: 'rgba(158, 224, 224, 0.8)', fontWeight: 500 }}>where you are now</strong>.<br />
              It doesn&apos;t give you the real answer.<br />
              The real answer comes from <strong style={{ color: 'rgba(158, 224, 224, 0.8)', fontWeight: 500 }}>within you</strong>.
            </p>
            <p style={{
              fontSize: 15, color: 'rgba(158, 224, 224, 0.4)',
              fontStyle: 'italic', marginBottom: 40,
              fontFamily: "'Cormorant Garamond', serif",
            }}>
              — Clarissa C.
            </p>
            <button
              onClick={() => setStep('question')}
              style={{
                background: 'transparent',
                border: '1px solid rgba(158, 224, 224, 0.35)',
                color: '#9ee0e0', padding: '18px 56px',
                borderRadius: 100, fontSize: 14, letterSpacing: 3,
                textTransform: 'uppercase', cursor: 'none',
                transition: 'all 0.4s',
              }}
            >
              Enter the mirror
            </button>
          </div>
        )}

        {/* QUESTION (first input) */}
        {step === 'question' && (
          <div style={{ animation: 'fadeIn 0.8s ease forwards', width: '100%', maxWidth: 560 }}>
            <p style={{
              fontSize: 12, letterSpacing: 3, textTransform: 'uppercase',
              color: 'rgba(158, 224, 224, 0.4)', marginBottom: 24,
            }}>
              Round one
            </p>
            <h2 style={{
              fontSize: 28, fontWeight: 400, marginBottom: 14,
              color: 'rgba(158, 224, 224, 0.8)',
              fontFamily: "'Cormorant Garamond', serif",
            }}>
              What are you going through?
            </h2>
            <p style={{
              fontSize: 16, color: 'rgba(158, 224, 224, 0.35)', marginBottom: 36,
            }}>
              Tell me what&apos;s on your mind. I&apos;ll reflect it back.
            </p>
            <div style={{
              border: '1px solid rgba(158, 224, 224, 0.2)',
              borderRadius: 12, overflow: 'hidden', marginBottom: 20,
              transition: 'border-color 0.3s',
            }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type whatever comes to mind..."
                style={{
                  width: '100%', background: 'rgba(158, 224, 224, 0.03)',
                  border: 'none', padding: '26px 28px', color: '#9ee0e0',
                  fontSize: 17, fontFamily: "'Cormorant Garamond', serif",
                  resize: 'none', outline: 'none', minHeight: 200,
                  lineHeight: 1.7,
                }}
              />
            </div>
            <button
              onClick={handleFirstSubmit}
              disabled={loading}
              style={{
                background: 'transparent',
                border: '1px solid rgba(158, 224, 224, 0.3)',
                color: '#9ee0e0', padding: '16px 40px',
                borderRadius: 6, fontSize: 13, letterSpacing: 2,
                textTransform: 'uppercase', cursor: loading ? 'wait' : 'none',
                transition: 'all 0.3s', opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Reflecting...' : 'Go deeper'}
            </button>
          </div>
        )}

        {/* MIRROR (showing question + note, user answers) */}
        {step === 'mirror' && (
          <div style={{ animation: 'fadeIn 0.8s ease forwards', width: '100%', maxWidth: 600 }}>

            {/* Conversation history */}
            {conversationRef.current.map((entry, i) => (
              <div key={i} style={{ marginBottom: 32, textAlign: 'left', animation: 'fadeInUp 0.6s ease forwards' }}>
                {entry.role === 'user' ? (
                  <div>
                    <p style={{
                      fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
                      color: 'rgba(158, 224, 224, 0.3)', marginBottom: 10,
                    }}>
                      You said
                    </p>
                    <p style={{
                      fontSize: 17, color: 'rgba(158, 224, 224, 0.6)',
                      fontFamily: "'Cormorant Garamond', serif",
                      lineHeight: 1.7, fontStyle: 'italic',
                    }}>
                      "{entry.text}"
                    </p>
                  </div>
                ) : (
                  <div style={{ paddingLeft: 16, borderLeft: '2px solid rgba(158, 224, 224, 0.15)' }}>
                    <p style={{
                      fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
                      color: 'rgba(158, 224, 224, 0.3)', marginBottom: 10,
                    }}>
                      The mirror asks
                    </p>
                    <p style={{
                      fontSize: 22, fontWeight: 400, lineHeight: 1.5,
                      color: '#9ee0e0', fontFamily: "'Cormorant Garamond', serif",
                      marginBottom: 16,
                    }}
                      dangerouslySetInnerHTML={{ __html: entry.question }}
                    />
                    <p style={{
                      fontSize: 14, color: 'rgba(158, 224, 224, 0.35)',
                      lineHeight: 1.8,
                    }}>
                      {entry.note}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {/* Divider */}
            {conversationRef.current.length > 0 && (
              <div style={{
                width: 40, height: 1,
                background: 'rgba(158, 224, 224, 0.2)',
                margin: '32px auto',
              }} />
            )}

            {/* Current round indicator */}
            <p style={{
              fontSize: 11, letterSpacing: 3, textTransform: 'uppercase',
              color: 'rgba(158, 224, 224, 0.3)', marginBottom: 20,
            }}>
              {roundLabel}
            </p>

            {/* Prompt label */}
            {round === 1 && (
              <p style={{
                fontSize: 16, color: 'rgba(158, 224, 224, 0.35)', marginBottom: 28,
              }}>
                What are you going through?
              </p>
            )}
            {round > 1 && (
              <p style={{
                fontSize: 16, color: 'rgba(158, 224, 224, 0.35)', marginBottom: 28,
                fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic',
              }}>
                Your answer
              </p>
            )}

            {/* Input for current round */}
            <div style={{
              border: '1px solid rgba(158, 224, 224, 0.2)',
              borderRadius: 12, overflow: 'hidden', marginBottom: 20,
            }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={round === 1 ? "Type whatever comes to mind..." : "Your answer..."}
                style={{
                  width: '100%', background: 'rgba(158, 224, 224, 0.03)',
                  border: 'none', padding: '26px 28px', color: '#9ee0e0',
                  fontSize: 17, fontFamily: "'Cormorant Garamond', serif",
                  resize: 'none', outline: 'none', minHeight: 160,
                  lineHeight: 1.7,
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              {round < 3 ? (
                <button
                  onClick={round === 1 ? handleFirstSubmit : handleRoundSubmit}
                  disabled={loading}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(158, 224, 224, 0.3)',
                    color: '#9ee0e0', padding: '16px 40px',
                    borderRadius: 6, fontSize: 13, letterSpacing: 2,
                    textTransform: 'uppercase', cursor: loading ? 'wait' : 'none',
                    transition: 'all 0.3s', opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? 'Reflecting...' : 'Go deeper'}
                </button>
              ) : (
                <button
                  onClick={handleAnswerSubmit}
                  disabled={loading}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(158, 224, 224, 0.3)',
                    color: '#9ee0e0', padding: '16px 40px',
                    borderRadius: 6, fontSize: 13, letterSpacing: 2,
                    textTransform: 'uppercase', cursor: loading ? 'wait' : 'none',
                    transition: 'all 0.3s', opacity: loading ? 0.6 : 1,
                  }}
                >
                  {loading ? 'Completing...' : 'See what the mirror found'}
                </button>
              )}
            </div>

            {/* Look again link */}
            <button
              onClick={handleReset}
              style={{
                background: 'transparent', border: 'none',
                color: 'rgba(158, 224, 224, 0.25)',
                fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
                marginTop: 40, cursor: 'none',
              }}
            >
              Look again
            </button>
          </div>
        )}

        {/* COMPLETE (final closure) */}
        {step === 'complete' && (
          <div style={{ animation: 'fadeIn 0.8s ease forwards', width: '100%', maxWidth: 640 }}>

            {/* Final mirror reflection */}
            <p style={{
              fontSize: 11, letterSpacing: 3, textTransform: 'uppercase',
              color: 'rgba(158, 224, 224, 0.4)', marginBottom: 24,
            }}>
              The mirror closes
            </p>

            {mirrorQuestion && (
              <p style={{
                fontSize: 26, fontWeight: 400, lineHeight: 1.6,
                color: '#9ee0e0', fontFamily: "'Cormorant Garamond', serif",
                marginBottom: 32,
              }}
                dangerouslySetInnerHTML={{ __html: mirrorQuestion }}
              />
            )}

            {mirrorNote && (
              <p style={{
                fontSize: 15, color: 'rgba(158, 224, 224, 0.4)',
                lineHeight: 1.9, marginBottom: 48,
                padding: '24px 28px',
                borderLeft: '2px solid rgba(158, 224, 224, 0.2)',
                background: 'rgba(158, 224, 224, 0.02)',
                textAlign: 'left',
              }}>
                {mirrorNote}
              </p>
            )}

            {/* Closure quote/story */}
            {closure && (
              <div style={{
                padding: '36px 40px',
                background: 'rgba(158, 224, 224, 0.03)',
                border: '1px solid rgba(158, 224, 224, 0.12)',
                borderRadius: 12,
                marginBottom: 48,
                textAlign: 'left',
              }}>
                <p style={{
                  fontSize: 15, color: 'rgba(158, 224, 224, 0.55)',
                  lineHeight: 1.95, fontFamily: "'Cormorant Garamond', serif",
                  whiteSpace: 'pre-wrap', marginBottom: 16,
                }}>
                  {closure}
                </p>
                {closureLabel && (
                  <p style={{
                    fontSize: 12, color: 'rgba(158, 224, 224, 0.3)',
                    letterSpacing: 1, fontStyle: 'italic',
                  }}>
                    {closureLabel}
                  </p>
                )}
              </div>
            )}

            {/* Start over */}
            <button
              onClick={handleStartOver}
              style={{
                background: 'transparent',
                border: '1px solid rgba(158, 224, 224, 0.2)',
                color: 'rgba(158, 224, 224, 0.5)',
                padding: '14px 36px', borderRadius: 100,
                fontSize: 12, letterSpacing: 2,
                textTransform: 'uppercase', cursor: 'none',
                transition: 'all 0.3s',
              }}
            >
              Return to the mirror
            </button>
          </div>
        )}

      </main>
    </>
  )
}