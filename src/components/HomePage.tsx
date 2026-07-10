import { useState } from 'react'
import { Boxes, ClipboardList, Fingerprint, PackagePlus, Search, Settings, ShieldCheck, SignpostBig, TrendingUp } from 'lucide-react'
import type { Profile } from '../types'
import { supabase } from '../lib/supabase'
import { SecurityPanel } from './SecurityPanel'

type Props = { profile: Profile }

export function HomePage({ profile }: Props) {
  const [securityOpen, setSecurityOpen] = useState(false)

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-brand"><span className="mini-mark">JR</span><strong>Jacksons Retro Manager</strong></div>
        <nav>
          <button className="nav-active">Dashboard</button>
          <button>Create Item</button>
          <button>Watch List</button>
        </nav>
        <div className="topbar-user">
          <div><strong>{profile.display_name}</strong><span>{profile.role === 'admin' ? 'Administrator' : 'View only'}</span></div>
          <button className="icon-button" onClick={() => setSecurityOpen(true)} title="Security settings"><Settings size={20} /></button>
          <button className="signout-button" onClick={() => supabase.auth.signOut()}>Sign out</button>
        </div>
      </header>

      <main className="dashboard">
        <section className="hero-row">
          <div><p className="eyebrow">DASHBOARD</p><h1>Good to see you, {profile.display_name.split(' ')[0]}.</h1><p>JRM Web is connected to the existing Supabase database.</p></div>
          <button className="primary-button hero-action"><PackagePlus size={19} /> Create Item</button>
        </section>

        <section className="metric-grid">
          <article><div className="metric-icon"><Boxes /></div><span>Items in stock</span><strong>—</strong><small>Inventory module next</small></article>
          <article><div className="metric-icon"><TrendingUp /></div><span>Total profit</span><strong>—</strong><small>Sales history next</small></article>
          <article><div className="metric-icon"><SignpostBig /></div><span>Watch list</span><strong>—</strong><small>Existing data retained</small></article>
          <article><div className="metric-icon"><ShieldCheck /></div><span>Secure session</span><strong>Active</strong><small>Supabase Auth</small></article>
        </section>

        <section className="content-grid">
          <article className="dashboard-card large-card">
            <div className="card-heading"><div><p className="eyebrow">INVENTORY</p><h2>Inventory overview</h2></div><button className="secondary-button compact"><Search size={17} /> Search inventory</button></div>
            <div className="empty-state"><ClipboardList size={42} /><h3>Homepage foundation complete</h3><p>The next build will connect the full inventory table, filters and item forms.</p></div>
          </article>
          <article className="dashboard-card">
            <p className="eyebrow">SECURITY</p><h2>Protect your account</h2><p>Add a passkey for fast passwordless sign-in, or use any compatible authenticator app for a second step.</p>
            <button className="secondary-button" onClick={() => setSecurityOpen(true)}><Fingerprint size={18} /> Security settings</button>
          </article>
        </section>
      </main>
      {securityOpen && <SecurityPanel onClose={() => setSecurityOpen(false)} />}
    </div>
  )
}
