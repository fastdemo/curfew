const SALT = 'curfew::pin::v1'

const encoder = new TextEncoder()

export function isValidPinHash(value: string): boolean {
  return /^[0-9a-f]{64}$/.test(value)
}

async function digest(pin: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', encoder.encode(SALT + pin))
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function hashPin(pin: string): Promise<string> {
  return digest(pin)
}

export async function verifyPin(pin: string, stored: string): Promise<boolean> {
  if (isValidPinHash(stored)) {
    return (await digest(pin)) === stored
  }
  return pin === stored
}

export const MAX_PIN_LENGTH = 10