import { useState, useRef, useEffect } from 'react'
import { verifyPin, MAX_PIN_LENGTH } from '../lib/pin'
import { useTheme } from '../ui/theme'

export type PinMode = 'setup' | 'verify'

interface Props {
  mode: PinMode
  pinHash?: string
  prompt?: string
  onVerified?: () => void
  onSetupComplete?: (pin: string) => void
  onCancel: () => void
}

// Pin gate: fullscreen sheet over the popup. Same logic as the old overlay
// (create+confirm >= 4 digits, shake on mismatch, fade on success) in the
// new visual language: plain prompt, wide tracking input, one accent CTA.
export function PinGate({ mode, pinHash = '', prompt, onVerified, onSetupComplete, onCancel }: Props) {
  const t = useTheme()
  const [value, setValue] = useState('')
  const [confirm, setConfirm] = useState('')
  const [step, setStep] = useState<'create' | 'confirm'>('create')
  const [shakeKey, setShakeKey] = useState(0)
  const [done, setDone] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    inputRef.current?.focus()
    return () => clearTimeout(timer.current)
  }, [step])

  const shake = () => {
    setShakeKey((k) => k + 1)
    setValue('')
    setConfirm('')
  }

  const succeed = (fn?: () => void) => {
    setDone(true)
    timer.current = setTimeout(() => fn?.(), 280)
  }

  const verify = async (input: string) => {
    if (!input) return
    if (await verifyPin(input, pinHash)) succeed(onVerified)
    else shake()
  }

  const change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '')
    if (digits.length > MAX_PIN_LENGTH) return
    if (mode === 'setup' && step === 'confirm') {
      setConfirm(digits)
      if (digits.length === value.length && digits.length >= 4) {
        if (digits === value) succeed(() => onSetupComplete?.(digits))
        else {
          setShakeKey((k) => k + 1)
          setConfirm('')
        }
      }
      return
    }
    setValue(digits)
  }

  const next = () => {
    if (value.length < 4) {
      shake()
      return
    }
    setConfirm('')
    setStep('confirm')
  }

  const key = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') onCancel()
    if (e.key === 'Enter' && mode === 'setup' && step === 'create') next()
    if (e.key === 'Enter' && mode === 'verify') void verify(value)
  }

  const text =
    prompt ??
    (mode === 'setup'
      ? step === 'create'
        ? 'choose a pin'
        : 'enter it again'
      : 'enter your pin')

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
        padding: 24,
        backgroundColor: t.bgApp,
        opacity: done ? 0 : 1,
        transition: 'opacity 280ms ease-out',
      }}
    >
      <style>{`@keyframes curfew-shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-7px)}40%{transform:translateX(7px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}`}</style>
      <svg width={34} height={34} viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: t.textPrimary, textAlign: 'center' }}>
        {text}
      </p>
      <input
        ref={inputRef}
        type="password"
        inputMode="numeric"
        autoFocus
        value={step === 'confirm' ? confirm : value}
        onChange={change}
        onKeyDown={key}
        maxLength={MAX_PIN_LENGTH}
        aria-label="pin"
        style={{
          width: 150,
          padding: '10px 14px',
          fontSize: 20,
          fontWeight: 500,
          letterSpacing: 8,
          textAlign: 'center',
          color: t.textPrimary,
          backgroundColor: t.bgSurface,
          border: `1px solid ${t.border}`,
          borderRadius: 12,
          outline: 'none',
          caretColor: t.accent,
          animation: shakeKey > 0 ? 'curfew-shake 400ms ease-out' : 'none',
        }}
        key={shakeKey}
      />
      {mode === 'setup' && step === 'create' && (
        <button
          type="button"
          onClick={next}
          style={{
            padding: '10px 28px',
            border: 'none',
            borderRadius: 10,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            backgroundColor: t.accent,
            color: t.onAccent,
          }}
        >
          next
        </button>
      )}
      {mode === 'verify' && (
        <button
          type="button"
          onClick={() => void verify(value)}
          style={{
            padding: '10px 28px',
            border: 'none',
            borderRadius: 10,
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            backgroundColor: t.accent,
            color: t.onAccent,
          }}
        >
          unlock
        </button>
      )}
      <button
        type="button"
        onClick={onCancel}
        style={{
          border: 'none',
          background: 'none',
          cursor: 'pointer',
          padding: '4px 8px',
          fontSize: 13,
          fontWeight: 500,
          color: t.textSecondary,
        }}
      >
        cancel
      </button>
    </div>
  )
}
