import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import type { Profile } from './types'
import { LoginPage } from './components/LoginPage'
import { HomePage } from './components/HomePage'
import './styles.css'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [fatal, setFatal] = useState('')

  useEffect(() => {
    void initialise()
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (!nextSession) setProfile(null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session?.user && !profile) void loadProfile(session.user.id)
  }, [session, profile])

  async function initialise() {
    const { data, error } = await supabase.auth.getSession()
    if (error) setFatal(error.message)
    setSession(data.session)
    setLoading(false)
  }

  async function loadProfile(userId: string) {
    setFatal('')
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, username, display_name, role, is_active')
      .eq('user_id', userId)
      .single()

    if (error) {
      setFatal(`Your account signed in, but its JRM profile could not be loaded: ${error.message}`)
      await supabase.auth.signOut()
      return
    }
    const next = data as Profile
    if (!next.is_active) {
      setFatal('This JRM account has been disabled.')
      await supabase.auth.signOut()
      return
    }
    setProfile(next)
  }

  async function handleSignedIn() {
    const { data } = await supabase.auth.getSession()
    setSession(data.session)
    if (data.session?.user) await loadProfile(data.session.user.id)
  }

  if (loading) return <div className="boot-screen"><div className="brand-mark">JR</div><p>Loading Jacksons Retro Manager…</p></div>
  if (!session || !profile) return <><LoginPage onSignedIn={handleSignedIn} />{fatal && <div className="fatal-banner">{fatal}</div>}</>
  return <HomePage profile={profile} />
}
