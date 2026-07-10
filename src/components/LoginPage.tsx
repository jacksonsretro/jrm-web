import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Fingerprint, KeyRound, Loader2, LockKeyhole, ShieldCheck } from 'lucide-react'
import { supabase, internalEmail } from '../lib/supabase'
import type { LoginUser } from '../types'

type Props = {
  onSignedIn: () => Promise<void>
}

type MfaStep = {
  factorId: string
  username: string
}

export function LoginPage({ onSignedIn }: Props) {
  const [users, setUsers] = useState<LoginUser[]>([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [mfaStep, setMfaStep] = useState<MfaStep | null>(null)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    void loadUsers()
  }, [])

  const selectedUser = useMemo(
    () => users.find((user) => user.username === username),
    [users, username],
  )

  async function loadUsers() {
    setLoadingUsers(true)
    setMessage('')
    const { data, error } = await supabase.rpc('list_login_users')
    if (error) {
      setMessage(`Could not load users: ${error.message}`)
    } else {
      const nextUsers = (data ?? []) as LoginUser[]
      setUsers(nextUsers)
      setUsername(nextUsers[0]?.username ?? '')
    }
    setLoadingUsers(false)
  }

  async function finishOrRequestMfa(loginName: string) {
    const [{ data: aal, error: aalError }, { data: factors, error: factorsError }] = await Promise.all([
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
      supabase.auth.mfa.listFactors(),
    ])

    if (aalError) throw aalError
    if (factorsError) throw factorsError

    const verifiedTotp = factors.totp.find((factor) => factor.status === 'verified')
    if (aal?.nextLevel === 'aal2' && aal.currentLevel !== 'aal2' && verifiedTotp) {
      setMfaStep({ factorId: verifiedTotp.id, username: loginName })
      setMessage('Enter the six-digit code from your authenticator app.')
      return
    }

    await onSignedIn()
  }

  async function signIn(event: FormEvent) {
    event.preventDefault()
    if (!username || !password) return
    setBusy(true)
    setMessage('')
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: internalEmail(username),
        password,
      })
      if (error) throw error
      await finishOrRequestMfa(username)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Sign-in failed.')
    } finally {
      setBusy(false)
    }
  }

  async function verifyMfa(event: FormEvent) {
    event.preventDefault()
    if (!mfaStep || code.trim().length < 6) return
    setBusy(true)
    setMessage('')
    try {
      const { error } = await supabase.auth.mfa.challengeAndVerify({
        factorId: mfaStep.factorId,
        code: code.trim(),
      })
      if (error) throw error
      await onSignedIn()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Authenticator verification failed.')
    } finally {
      setBusy(false)
    }
  }

  async function signInWithPasskey() {
    setBusy(true)
    setMessage('')
    try {
      const { error } = await supabase.auth.signInWithPasskey()
      if (error) throw error
      await onSignedIn()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Passkey sign-in failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="login-shell">
      <section className="brand-panel">
        <div className="brand-mark">JR</div>
        <p className="eyebrow">JACKSONS RETRO</p>
        <h1>Inventory control, without the clutter.</h1>
        <p className="brand-copy">
          Track stock, purchases, testing, sales and profit from any computer with a secure connection.
        </p>
        <div className="feature-list">
          <span><ShieldCheck size={18} /> Supabase protected</span>
          <span><Fingerprint size={18} /> Passkey ready</span>
          <span><LockKeyhole size={18} /> Authenticator support</span>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <div className="login-heading">
            <div className="icon-disc"><KeyRound size={24} /></div>
            <div>
              <p className="eyebrow">JRM WEB</p>
              <h2>{mfaStep ? 'Verify your sign-in' : 'Welcome back'}</h2>
              <p>{mfaStep ? `Signing in as ${mfaStep.username.toUpperCase()}` : 'Choose your account to continue.'}</p>
            </div>
          </div>

          {mfaStep ? (
            <form onSubmit={verifyMfa} className="login-form">
              <label>
                Authenticator code
                <input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={8}
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  autoFocus
                />
              </label>
              <button className="primary-button" disabled={busy || code.length < 6}>
                {busy && <Loader2 className="spin" size={18} />} Verify and continue
              </button>
              <button type="button" className="text-button" onClick={() => setMfaStep(null)} disabled={busy}>
                Use a different sign-in method
              </button>
            </form>
          ) : (
            <>
              <form onSubmit={signIn} className="login-form">
                <label>
                  User
                  <select
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    disabled={loadingUsers || busy}
                  >
                    {loadingUsers && <option>Loading users…</option>}
                    {!loadingUsers && users.length === 0 && <option>No users found</option>}
                    {users.map((user) => (
                      <option key={user.username} value={user.username}>
                        {user.display_name} ({user.username.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Password
                  <input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={selectedUser ? `Password for ${selectedUser.username.toUpperCase()}` : 'Password'}
                  />
                </label>

                <button className="primary-button" disabled={busy || loadingUsers || !username || !password}>
                  {busy && <Loader2 className="spin" size={18} />} Sign in
                </button>
              </form>

              <div className="divider"><span>or</span></div>

              <button type="button" className="passkey-button" onClick={signInWithPasskey} disabled={busy}>
                <Fingerprint size={21} /> Sign in with a passkey
              </button>
              <p className="passkey-note">A passkey must first be added from Security Settings after a password sign-in.</p>
            </>
          )}

          {message && <div className="status-message" role="status">{message}</div>}
        </div>
        <p className="login-footer">Jacksons Retro Manager · Private business system</p>
      </section>
    </main>
  )
}
