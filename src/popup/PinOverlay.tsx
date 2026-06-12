import { useState, useRef, useEffect } from 'react'

interface PinOverlayProps {
  mode: 'setup' | 'verify'
  pinHash?: string
  prompt?: string
  onVerified?: () => void
  onSetupComplete?: (pin: string) => void
  onCancel: () => void
}

export default function PinOverlay({ mode, pinHash = '', prompt, onVerified, onSetupComplete, onCancel }: PinOverlayProps) {
  const [value, setValue] = useState('')
  const [confirmValue, setConfirmValue] = useState('')
  const [isShaking, setIsShaking] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [step, setStep] = useState<'create' | 'confirm'>('create')
  const inputRef = useRef<HTMLInputElement>(null)
  const shakeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const verifyTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    inputRef.current?.focus()
    return () => {
      clearTimeout(shakeTimer.current)
      clearTimeout(verifyTimer.current)
    }
  }, [step])

  const triggerShake = () => {
    setIsShaking(true)
    setValue('')
    setConfirmValue('')
    shakeTimer.current = setTimeout(() => setIsShaking(false), 500)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mode === 'setup' && step === 'create') {
      const input = e.target.value.replace(/\D/g, '')
      if (input.length > 10) return
      setValue(input)
    } else if (mode === 'setup' && step === 'confirm') {
      const input = e.target.value.replace(/\D/g, '')
      if (input.length > 10) return
      setConfirmValue(input)
      if (input.length === value.length && input.length >= 4) {
        if (input === value) {
          setIsVerified(true)
          verifyTimer.current = setTimeout(() => onSetupComplete?.(input), 300)
        } else {
          triggerShake()
          setStep('create')
        }
      }
    } else if (mode === 'verify') {
      const input = e.target.value.replace(/\D/g, '')
      if (input.length > (pinHash.length || 4)) return
      setValue(input)
      if (input.length === (pinHash.length || 4)) {
        if (input === pinHash) {
          setIsVerified(true)
          verifyTimer.current = setTimeout(() => onVerified?.(), 300)
        } else {
          triggerShake()
        }
      }
    }
  }

  const handleCreateSubmit = () => {
    if (value.length < 4) {
      triggerShake()
      return
    }
    setConfirmValue('')
    setStep('confirm')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') onCancel()
    if (e.key === 'Enter' && mode === 'setup' && step === 'create') {
      handleCreateSubmit()
    }
  }

  const displayPrompt = prompt || (mode === 'setup'
    ? (step === 'create' ? 'create your security pin' : 'confirm your security pin')
    : 'enter pin to disable protection')

  return (
    <>
      <style>{`
        @keyframes curfew-shake {
          0%, 100% { transform: translateX(0) }
          20% { transform: translateX(-8px) }
          40% { transform: translateX(8px) }
          60% { transform: translateX(-6px) }
          80% { transform: translateX(6px) }
        }
      `}</style>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '20px',
          background: 'var(--color-surface)',
          zIndex: 50,
          opacity: isVerified ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out',
        }}
      >
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>

        <p style={{ fontSize: '14px', fontWeight: 400, color: 'var(--color-text-secondary)', margin: 0, textAlign: 'center' }}>
          {displayPrompt}
        </p>

        <input
          ref={inputRef}
          type="password"
          inputMode="numeric"
          autoFocus
          value={step === 'confirm' ? confirmValue : value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          maxLength={mode === 'setup' ? 10 : (pinHash.length || 4)}
          style={{
            width: '160px',
            padding: '12px 16px',
            fontSize: '20px',
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: 500,
            letterSpacing: '8px',
            textAlign: 'center',
            color: 'var(--color-text-primary)',
            background: 'var(--color-surface-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            outline: 'none',
            caretColor: 'var(--color-accent)',
            animation: isShaking ? 'curfew-shake 0.4s ease-in-out' : 'none',
          }}
        />

        {mode === 'setup' && step === 'create' && (
          <button
            onClick={handleCreateSubmit}
            style={{
              padding: '10px 24px',
              borderRadius: '12px',
              border: 'none',
              background: 'var(--color-accent)',
              color: '#F3EEEA',
              fontFamily: "'Sora', sans-serif",
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            next
          </button>
        )}

        <button
          onClick={onCancel}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--color-text-muted)',
            fontFamily: "'DM Sans', sans-serif",
            padding: '4px 8px',
          }}
        >
          cancel
        </button>
      </div>
    </>
  )
}
