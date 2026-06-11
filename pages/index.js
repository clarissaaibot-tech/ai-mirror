import { useState, useEffect, useRef } from 'react'
import Head from 'next/head'

export default function Home() {
  const [step, setStep] = useState('landing')
  const [input, setInput] = useState('')
  const [mirrorQuestion, setMirrorQuestion] = useState('')
  const [mirrorNote, setMirrorNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [ripples, setRipples] = useState([])
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 })
  const canvasRef = useRef(null)
  const rippleCanvasRef = useRef(null)
  const cursorRef = useRef({ x: -100, y: -100, tx: -100, ty: -100 })

  // Water background animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let time = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      time += 0.008

      for (let i = 0; i < 5; i++) {
        ctx.beginPath()
        ctx.moveTo(0, canvas.height * 0.4 + Math.sin(time + i * 0.5) * 15)
        for (let x = 0; x <= canvas.width; x += 5) {
          const y = canvas.height * 0.4 + Math.sin(x * 0.008 + time + i * 0.5) * (12 + i * 3)
          ctx.lineTo(x, y)
        }
        ctx.strokeStyle = `rgba(107, 183, 178, ${0.04 - i * 0.006})`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      requestAnimationFrame(animate)
    }
    animate()

    return () => window.removeEventListener('resize', resize)
  }, [])

  // Ripple animation
  useEffect(() => {
    const canvas = rippleCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      setRipples(prev => {
        const updated = prev.map(r => ({ ...r, r: r.r + 1.5, opacity: r.opacity * 0.985 }))
        return updated.filter(r => r.opacity > 0.01)
      })

      ripples.forEach(ripple => {
        ctx.beginPath()
        ctx.arc(ripple.x, ripple.y, ripple.r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(150, 230, 240, ${ripple.opacity * 0.5})`
        ctx.lineWidth = 1.5
        ctx.stroke()

        if (ripple.r > 15) {
          ctx.beginPath()
          ctx.arc(ripple.x, ripple.y, ripple.r - 15, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(107, 183, 178, ${ripple.opacity * 0.3})`
          ctx.lineWidth = 1
          ctx.stroke()
        }
      })

      requestAnimationFrame(animate)
    }
    animate()
  }, [ripples.length])

  // Smooth cursor
  useEffect(() => {
    let raf
    const move = () => {
      cursorRef.current.x += (cursorRef.current.tx - cursorRef.current.x) * 0.25
      cursorRef.current.y += (cursorRef.current.ty - cursorRef.current.y) * 0.25
      setCursorPos({ x: cursorRef.current.x, y: cursorRef.current.y })
      raf = requestAnimationFrame(move)
    }
    raf = requestAnimationFrame(move)
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e) => {
      cursorRef.current.tx = e.clientX
      cursorRef.current.ty = e.clientY
      if (Math.random() < 0.025) {
        setRipples(prev => [...prev, { x: e.clientX, y: e.clientY, r: 0, opacity: 0.7 }])
      }
    }

    const handleClick = (e) => {
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2
        const dist = 25 + i * 20
        setRipples(prev => [...prev, {
          x: e.clientX + Math.cos(angle) * dist,
          y: e.clientY + Math.sin(angle) * dist,
          r: 0,
          opacity: 0.7
        }])
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('click', handleClick)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
    }
  }, [])

  const handleSubmit = async () => {
    if (!input.trim() || loading) return
    setLoading(true)

    try {
      const res = await fetch('/api/mirror', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
      })
      const data = await res.json()
      setMirrorQuestion(data.question)
      setMirrorNote(data.note)
      setStep('mirror')
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const handleReset = () => {
    setInput('')
    setMirrorQuestion('')
    setMirrorNote('')
    setStep('question')
  }

  return (
    <>
      <Head>
        <title>AI as Mirror — Clarity</title>
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
        `}</style>
      </Head>

      {/* Water background canvas */}
      <canvas
        ref={canvasRef}
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}
      />

      {/* Ripple canvas */}
      <canvas
        ref={rippleCanvasRef}
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2, pointerEvents: 'none' }}
      />

      {/* Dark overlay */}
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'radial-gradient(ellipse at center, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.7) 100%)',
        zIndex: 1, pointerEvents: 'none'
      }} />

      {/* Custom cursor */}
      <div style={{
        position: 'fixed',
        left: cursorPos.x,
        top: cursorPos.y,
        width: 24,
        height: 24,
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          border: '1px solid rgba(158, 224, 224, 0.6)',
          borderRadius: '50%',
          animation: 'cursorPulse 2s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: 5, height: 5,
          background: '#9ee0e0',
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
        }} />
      </div>

      {/* Top bar */}
      <div style={{
        position: 'relative', zIndex: 10,
        padding: '20px 32px',
        display: 'flex', justifyContent: 'flex-end',
      }}>
        <a
          href="https://mirrorstreams.substack.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: 17,
            letterSpacing: 1,
            color: '#9ee0e0',
            textDecoration: 'none',
            opacity: 1,
            transition: 'opacity 0.3s',
          }}
        >
          dive into the why
        </a>
      </div>

      {/* Main content */}
      <main style={{
        position: 'relative', zIndex: 10,
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: '85vh', padding: '0 24px',
        textAlign: 'center',
      }}>

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
                color: '#9ee0e0',
                padding: '18px 56px',
                borderRadius: 100,
                fontSize: 14,
                letterSpacing: 3,
                textTransform: 'uppercase',
                cursor: 'none',
                transition: 'all 0.4s',
              }}
            >
              Enter the mirror
            </button>
          </div>
        )}

        {step === 'question' && (
          <div style={{ animation: 'fadeIn 0.8s ease forwards', width: '100%', maxWidth: 560 }}>
            <h2 style={{
              fontSize: 28, fontWeight: 400, marginBottom: 14,
              color: 'rgba(158, 224, 224, 0.8)',
              fontFamily: "'Cormorant Garamond', serif",
            }}>
              What are you going through?
            </h2>
            <p style={{
              fontSize: 16, color: 'rgba(158, 224, 224, 0.35)',
              marginBottom: 36,
            }}>
              Tell me what&apos;s on your mind. I&apos;ll reflect it back.
            </p>
            <div style={{
              border: '1px solid rgba(158, 224, 224, 0.2)',
              borderRadius: 12, overflow: 'hidden',
              marginBottom: 20, transition: 'border-color 0.3s',
            }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Type whatever comes to mind..."
                style={{
                  width: '100%', background: 'rgba(158, 224, 224, 0.03)',
                  border: 'none', padding: '26px 28px',
                  color: '#9ee0e0', fontSize: 17,
                  fontFamily: "'Cormorant Garamond', serif",
                  resize: 'none', outline: 'none',
                  minHeight: 200, lineHeight: 1.7,
                }}
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                background: 'transparent',
                border: '1px solid rgba(158, 224, 224, 0.3)',
                color: '#9ee0e0',
                padding: '16px 40px',
                borderRadius: 6,
                fontSize: 13,
                letterSpacing: 2,
                textTransform: 'uppercase',
                cursor: loading ? 'wait' : 'none',
                transition: 'all 0.3s',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Reflecting...' : 'Go deeper'}
            </button>
          </div>
        )}

        {step === 'mirror' && (
          <div style={{ animation: 'fadeIn 0.8s ease forwards', width: '100%', maxWidth: 600 }}>
            <p style={{
              fontSize: 12, letterSpacing: 3, textTransform: 'uppercase',
              color: 'rgba(158, 224, 224, 0.4)', marginBottom: 24,
            }}>
              The mirror reflects
            </p>
            <p style={{
              fontSize: 26, fontWeight: 400, lineHeight: 1.6,
              color: '#9ee0e0', marginBottom: 36,
              fontFamily: "'Cormorant Garamond', serif",
            }}
              dangerouslySetInnerHTML={{ __html: mirrorQuestion }}
            />
            <p style={{
              fontSize: 15, color: 'rgba(158, 224, 224, 0.35)',
              padding: '24px 28px',
              borderLeft: '2px solid rgba(158, 224, 224, 0.25)',
              background: 'rgba(158, 224, 224, 0.03)',
              lineHeight: 1.9, marginBottom: 36, textAlign: 'left',
            }}>
              {mirrorNote}
            </p>
            <button
              onClick={handleReset}
              style={{
                background: 'transparent',
                border: '1px solid rgba(158, 224, 224, 0.15)',
                color: 'rgba(158, 224, 224, 0.35)',
                padding: '12px 28px',
                borderRadius: 8,
                fontSize: 11,
                letterSpacing: 2,
                textTransform: 'uppercase',
                cursor: 'none',
                transition: 'all 0.3s',
              }}
            >
              Look again
            </button>
          </div>
        )}
      </main>
    </>
  )
}