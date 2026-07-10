import { FormEvent, useEffect, useState } from 'react'
import { Fingerprint, KeyRound, Loader2, ShieldCheck, Trash2, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

type Props = { onClose: () => void }

type PasskeyInfo = {
  id: string
  friendly_name?: string
  created_at: string
  last_used_at?: string
}

type TotpSetup = {
  id: string
  qr_code: string
  secret: string
}

export function SecurityPanel({ onClose }: Props) {
  const [passkeys, setPasskeys] = useState<PasskeyInfo[]>([])
  const [totpFactors, setTotpFactors] = useState<Array<{ id: string; friendly_name?: string; status: string }>>([])
  const [totpSetup, setTotpSetup] = useState<TotpSetup | null>(null)
  const [totpCode, setTotpCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { void refresh() }, [])

  async function refresh() {
    const passkeyApi = supabase.auth.passkey
    const [{ data: passkeyData, error: passkeyError }, { data: factorData, error: factorError }] = await Promise.all([
      passkeyApi.list(),
      supabase.auth.mfa.listFactors(),
    ])
    if (passkeyError) setMessage(passkeyError.message)
    else setPasskeys((passkeyData ?? []) as PasskeyInfo[])
    if (factorError) setMessage(factorError.message)
    else setTotpFactors(factorData.totp)
  }

  async function addPasskey() {
    setBusy(true)
    setMessage('')
    try {
      const { error } = await supabase.auth.registerPasskey()
      if (error) throw error
      setMessage('Passkey added successfully.')
      await refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not add the passkey.')
    } finally { setBusy(false) }
  }

  async function deletePasskey(id: string) {
    if (!window.confirm('Remove this passkey?')) return
    setBusy(true)
    const { error } = await supabase.auth.passkey.delete({ passkeyId: id })
    if (error) setMessage(error.message)
    else await refresh()
    setBusy(false)
  }

  async function beginTotp() {
    setBusy(true)
    setMessage('')
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'JRM authenticator',
      })
      if (error) throw error
      setTotpSetup({
        id: data.id,
        qr_code: data.totp.qr_code,
        secret: data.totp.secret,
      })
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not begin authenticator setup.')
    } finally { setBusy(false) }
  }

  async function verifyTotp(event: FormEvent) {
    event.preventDefault()
    if (!totpSetup) return
    setBusy(true)
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: totpSetup.id,
        code: totpCode.trim(),
      })
      if (error) throw error
      setTotpSetup(null)
      setTotpCode('')
      setMessage('Authenticator enabled successfully.')
      await refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'The authenticator code was not accepted.')
    } finally { setBusy(false) }
  }

  async function removeFactor(id: string) {
    if (!window.confirm('Remove this authenticator?')) return
    setBusy(true)
    const { error } = await supabase.auth.mfa.unenroll({ factorId: id })
    if (error) setMessage(error.message)
    else await refresh()
    setBusy(false)
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="security-modal">
        <header className="modal-header">
          <div><p className="eyebrow">ACCOUNT SECURITY</p><h2>Passkeys & authenticators</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Close"><X /></button>
        </header>

        <div className="security-grid">
          <article className="security-card">
            <div className="security-title"><Fingerprint /><div><h3>Passkeys</h3><p>Sign in using Windows Hello, Touch ID, a phone or security key.</p></div></div>
            <button className="primary-button compact" onClick={addPasskey} disabled={busy}>
              {busy ? <Loader2 className="spin" size={17} /> : <Fingerprint size={17} />} Add passkey
            </button>
            <div className="factor-list">
              {passkeys.length === 0 && <p className="empty-copy">No passkeys added yet.</p>}
              {passkeys.map((passkey) => (
                <div className="factor-row" key={passkey.id}>
                  <div><strong>{passkey.friendly_name || 'Passkey'}</strong><span>Added {new Date(passkey.created_at).toLocaleDateString('en-GB')}</span></div>
                  <button className="danger-icon" onClick={() => deletePasskey(passkey.id)} aria-label="Remove passkey"><Trash2 size={17} /></button>
                </div>
              ))}
            </div>
          </article>

          <article className="security-card">
            <div className="security-title"><ShieldCheck /><div><h3>Authenticator app</h3><p>Works with Google Authenticator, Microsoft Authenticator, Authy, 1Password and compatible TOTP apps.</p></div></div>
            {!totpSetup && (
              <button className="secondary-button compact" onClick={beginTotp} disabled={busy}>
                <KeyRound size={17} /> Add authenticator
              </button>
            )}
            {totpSetup && (
              <form className="totp-setup" onSubmit={verifyTotp}>
                <img src={totpSetup.qr_code} alt="Authenticator enrolment QR code" />
                <p>Scan this code, then enter the six-digit code from your app.</p>
                <details><summary>Cannot scan?</summary><code>{totpSetup.secret}</code></details>
                <input inputMode="numeric" maxLength={8} value={totpCode} onChange={(event) => setTotpCode(event.target.value.replace(/\D/g, ''))} placeholder="000000" />
                <button className="primary-button compact" disabled={busy || totpCode.length < 6}>Enable authenticator</button>
              </form>
            )}
            <div className="factor-list">
              {totpFactors.length === 0 && !totpSetup && <p className="empty-copy">No authenticator added yet.</p>}
              {totpFactors.map((factor) => (
                <div className="factor-row" key={factor.id}>
                  <div><strong>{factor.friendly_name || 'Authenticator'}</strong><span>{factor.status}</span></div>
                  <button className="danger-icon" onClick={() => removeFactor(factor.id)} aria-label="Remove authenticator"><Trash2 size={17} /></button>
                </div>
              ))}
            </div>
          </article>
        </div>
        {message && <div className="status-message">{message}</div>}
      </section>
    </div>
  )
}
