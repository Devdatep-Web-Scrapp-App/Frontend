import { useState } from 'react'
import { useTheme } from '../components/switcher/theme/useTheme.js'

const SECTIONS = [
    { id: 'general',    label: 'General',            icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> },
    { id: 'accounts',   label: 'Cuentas conectadas', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> },
    { id: 'notifications', label: 'Notificaciones', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> },
]

function Toggle({ checked, onChange }) {
    return (
        <button
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            style={{
                width: 44, height: 24,
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                background: checked ? 'var(--accent-teal)' : 'var(--border)',
                position: 'relative',
                transition: 'background 0.2s',
                flexShrink: 0,
            }}
        >
      <span style={{
          position: 'absolute',
          top: 3, left: checked ? 23 : 3,
          width: 18, height: 18,
          borderRadius: '50%',
          background: 'white',
          transition: 'left 0.2s',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
      }} />
        </button>
    )
}

function SectionHeader({ title, subtitle }) {
    return (
        <div className="set-section-header">
            <h2 className="set-section-title">{title}</h2>
            {subtitle && <p className="set-section-sub">{subtitle}</p>}
        </div>
    )
}

function FieldRow({ label, hint, children }) {
    return (
        <div className="set-field-row">
            <div className="set-field-meta">
                <span className="set-field-label">{label}</span>
                {hint && <span className="set-field-hint">{hint}</span>}
            </div>
            <div className="set-field-control">{children}</div>
        </div>
    )
}

// ---------- General ----------
function GeneralSection() {
    const [name, setName]   = useState('Demo User')
    const [email, setEmail] = useState('demo@socialpulse.io')
    const [pass, setPass]   = useState('')
    const [saved, setSaved] = useState(false)

    function save() {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
    }

    return (
        <div className="set-panel fade-in">
            <SectionHeader title="General" subtitle="Administra tu información personal y datos de cuenta." />

            <div className="set-card">
                <div className="set-avatar-row">
                    <div className="set-avatar">{name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()}</div>
                    <div>
                        <div className="set-avatar-name">{name}</div>
                        <div className="set-avatar-email">{email}</div>
                        <span className="set-badge-active">Cuenta activa</span>
                    </div>
                </div>
            </div>

            <div className="set-card">
                <FieldRow label="Nombre completo" hint="Se muestra en la plataforma y en reportes.">
                    <input className="set-input" value={name} onChange={e => setName(e.target.value)} />
                </FieldRow>
                <div className="set-divider" />
                <FieldRow label="Correo electrónico" hint="Usado para iniciar sesión y recibir alertas.">
                    <input className="set-input" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                </FieldRow>
            </div>

            <div className="set-card">
                <FieldRow label="Nueva contraseña" hint="Ingresa tu contraseña actual para guardar cambios.">
                    <input className="set-input" type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" />
                </FieldRow>
            </div>

            <div className="set-footer-row">
                <span className="set-unsaved">{saved ? '✓ Cambios guardados' : 'Sin cambios guardados'}</span>
                <button className="set-btn-primary" onClick={save}>Guardar cambios</button>
            </div>
        </div>
    )
}

// ---------- Cuentas conectadas ----------
const PLATFORM_META = {
    instagram: {
        label: 'Instagram',
        color: '#f72585',
        dim: 'rgba(247,37,133,0.1)',
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>,
    },
    tiktok: {
        label: 'TikTok',
        color: '#06b6d4',
        dim: 'rgba(6,182,212,0.1)',
        icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>,
    },
}

function AccountCard({ platform, connected, username, followers, connectedSince, onDisconnect, onConnect }) {
    const meta = PLATFORM_META[platform]
    return (
        <div className="set-account-card">
            <div className="set-account-left">
                <div className="set-account-icon" style={{ background: meta.dim, color: meta.color }}>
                    {meta.icon}
                </div>
                <div>
                    <div className="set-account-name">{meta.label}</div>
                    {connected
                        ? <div className="set-account-detail">@{username} · {followers?.toLocaleString()} seguidores · desde {connectedSince}</div>
                        : <div className="set-account-detail" style={{ color: 'var(--text-muted)' }}>No conectado</div>
                    }
                </div>
            </div>
            <div className="set-account-right">
                {connected && <span className="set-dot-active" />}
                {connected
                    ? <>
                        <button className="set-btn-ghost">Sync ahora</button>
                        <button className="set-btn-danger" onClick={onDisconnect}>Desconectar</button>
                    </>
                    : <button className="set-btn-primary" onClick={onConnect}>+ Conectar</button>
                }
            </div>
        </div>
    )
}

function AccountsSection() {
    const [igConnected, setIgConnected] = useState(true)
    const [ttConnected, setTtConnected] = useState(false)

    return (
        <div className="set-panel fade-in">
            <SectionHeader title="Cuentas conectadas" subtitle="Administra las cuentas de redes sociales que rastrea SocialPulse." />

            <div className="set-card" style={{ padding: 0, overflow: 'hidden' }}>
                <AccountCard
                    platform="instagram"
                    connected={igConnected}
                    username="socialpulse_demo"
                    followers={284930}
                    connectedSince="5 ene 2026"
                    onDisconnect={() => setIgConnected(false)}
                    onConnect={() => setIgConnected(true)}
                />
                <div className="set-divider" style={{ margin: 0 }} />
                <AccountCard
                    platform="tiktok"
                    connected={ttConnected}
                    username="socialpulse_tt"
                    followers={193450}
                    connectedSince="8 ene 2026"
                    onDisconnect={() => setTtConnected(false)}
                    onConnect={() => setTtConnected(true)}
                />
            </div>

            <div className="set-card set-add-account">
                <div>
                    <div className="set-field-label">Agregar otra cuenta</div>
                    <div className="set-field-hint">Conecta más perfiles de Instagram o TikTok para rastrear.</div>
                </div>
                <button className="set-btn-primary">+ Conectar cuenta</button>
            </div>
        </div>
    )
}

// ---------- Notificaciones ----------
const NOTIF_GROUPS = [
    {
        group: 'Actividad de seguidores',
        items: [
            { id: 'new_followers',  label: 'Nuevos seguidores',        hint: 'Notificación cuando ganes seguidores nuevos.' },
            { id: 'lost_followers', label: 'Seguidores perdidos',       hint: 'Alerta cuando pierdas seguidores.' },
            { id: 'daily_summary',  label: 'Resumen diario',            hint: 'Recibe un resumen de actividad cada día.' },
        ],
    },
    {
        group: 'Metas y proyecciones',
        items: [
            { id: 'goal_reached',   label: 'Meta alcanzada',            hint: 'Notificación cuando alcances tu meta de seguidores.' },
            { id: 'milestone',      label: 'Hitos importantes',         hint: 'Alerta en hitos: 500, 1k, 5k seguidores, etc.' },
        ],
    },
    {
        group: 'Sistema',
        items: [
            { id: 'scrape_fail',    label: 'Error en scraping',         hint: 'Aviso si el scraping falla o no puede conectarse.' },
            { id: 'weekly_report',  label: 'Reporte semanal por email', hint: 'Recibe un reporte detallado cada lunes.' },
        ],
    },
]

function NotificationsSection() {
    const [prefs, setPrefs] = useState({
        new_followers: true, lost_followers: true, daily_summary: false,
        goal_reached: true, milestone: true, scrape_fail: true, weekly_report: false,
    })

    function toggle(id) {
        setPrefs(p => ({ ...p, [id]: !p[id] }))
    }

    return (
        <div className="set-panel fade-in">
            <SectionHeader title="Notificaciones" subtitle="Configura qué alertas y reportes quieres recibir." />

            {NOTIF_GROUPS.map(({ group, items }) => (
                <div key={group} className="set-card" style={{ marginBottom: 14 }}>
                    <div className="set-notif-group-label">{group}</div>
                    {items.map((item, i) => (
                        <div key={item.id}>
                            {i > 0 && <div className="set-divider" />}
                            <div className="set-notif-row">
                                <div>
                                    <div className="set-field-label">{item.label}</div>
                                    <div className="set-field-hint">{item.hint}</div>
                                </div>
                                <Toggle checked={prefs[item.id]} onChange={() => toggle(item.id)} />
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )
}

// ---------- Settings root ----------
export default function Settings() {
    const [active, setActive] = useState('general')

    const panels = {
        general:       <GeneralSection />,
        accounts:      <AccountsSection />,
        notifications: <NotificationsSection />,
    }

    return (
        <div className="set-root fade-in">
            <div className="set-page-header">
                <h1 className="set-page-title">Settings</h1>
                <p className="set-page-sub">Administra tu cuenta, plataformas conectadas y preferencias.</p>
            </div>

            <div className="set-layout">
                <aside className="set-sidebar">
                    {SECTIONS.map(s => (
                        <button
                            key={s.id}
                            className={`set-nav-item ${active === s.id ? 'active' : ''}`}
                            onClick={() => setActive(s.id)}
                        >
                            {s.icon}
                            {s.label}
                        </button>
                    ))}
                </aside>

                <div className="set-content">
                    {panels[active]}
                </div>
            </div>

            <style>{`
        .set-root {
          width: 100%;
          max-width: 1100px;
          padding: 28px 32px 48px;
          box-sizing: border-box;
        }
        .set-page-header { margin-bottom: 28px; }
        .set-page-title {
          font-family: var(--font-display);
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--text-primary);
        }
        .set-page-sub {
          font-size: 13px;
          color: var(--text-secondary);
          margin-top: 4px;
        }

        /* layout */
        .set-layout {
          display: flex;
          gap: 24px;
          align-items: flex-start;
        }
        .set-sidebar {
          width: 200px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-card);
          padding: 8px;
        }
        .set-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
          font-family: var(--font-body);
          cursor: pointer;
          text-align: left;
          transition: background 0.15s, color 0.15s;
          width: 100%;
        }
        .set-nav-item:hover {
          background: var(--bg-elevated);
          color: var(--text-primary);
        }
        .set-nav-item.active {
          background: var(--bg-elevated);
          color: var(--text-primary);
          font-weight: 600;
        }
        .set-content { flex: 1; min-width: 0; }

        /* panel */
        .set-panel { display: flex; flex-direction: column; gap: 14px; }
        .set-section-header { margin-bottom: 4px; }
        .set-section-title {
          font-family: var(--font-display);
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
        }
        .set-section-sub {
          font-size: 12.5px;
          color: var(--text-secondary);
          margin-top: 3px;
        }

        /* card */
        .set-card {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-card);
          padding: 20px 22px;
        }
        .set-divider {
          height: 1px;
          background: var(--border);
          margin: 14px 0;
        }

        /* field row */
        .set-field-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .set-field-meta { flex: 1; min-width: 0; }
        .set-field-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
        }
        .set-field-hint {
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 2px;
        }
        .set-field-control { flex-shrink: 0; }

        /* input */
        .set-input {
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 8px 12px;
          font-size: 13px;
          color: var(--text-primary);
          font-family: var(--font-body);
          outline: none;
          width: 220px;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .set-input:focus {
          border-color: var(--accent-teal);
          box-shadow: 0 0 0 3px var(--accent-teal-dim);
        }

        /* avatar */
        .set-avatar-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .set-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-orange), var(--accent-teal));
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-display);
          font-size: 15px;
          font-weight: 700;
          color: white;
          flex-shrink: 0;
        }
        .set-avatar-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .set-avatar-email {
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 2px;
        }
        .set-badge-active {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 500;
          color: var(--accent-teal);
          background: var(--accent-teal-dim);
          padding: 2px 8px;
          border-radius: 20px;
          margin-top: 5px;
        }
        .set-badge-active::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent-teal);
          display: inline-block;
        }

        /* footer row */
        .set-footer-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .set-unsaved {
          font-size: 12px;
          color: var(--text-muted);
        }

        /* buttons */
        .set-btn-primary {
          background: var(--bg-sidebar);
          color: var(--text-sidebar-active);
          border: none;
          border-radius: var(--radius-md);
          padding: 8px 18px;
          font-size: 13px;
          font-weight: 600;
          font-family: var(--font-body);
          cursor: pointer;
          transition: opacity 0.15s;
          white-space: nowrap;
        }
        .set-btn-primary:hover { opacity: 0.85; }
        .set-btn-ghost {
          background: var(--bg-elevated);
          color: var(--text-primary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 7px 14px;
          font-size: 12px;
          font-weight: 500;
          font-family: var(--font-body);
          cursor: pointer;
          transition: border-color 0.15s;
          white-space: nowrap;
        }
        .set-btn-ghost:hover { border-color: var(--accent-teal); }
        .set-btn-danger {
          background: rgba(239,68,68,0.1);
          color: #ef4444;
          border: 1px solid rgba(239,68,68,0.2);
          border-radius: var(--radius-md);
          padding: 7px 14px;
          font-size: 12px;
          font-weight: 500;
          font-family: var(--font-body);
          cursor: pointer;
          transition: background 0.15s;
          white-space: nowrap;
        }
        .set-btn-danger:hover { background: rgba(239,68,68,0.18); }

        /* accounts */
        .set-account-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 22px;
          gap: 16px;
          flex-wrap: wrap;
        }
        .set-account-left {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .set-account-icon {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .set-account-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .set-account-detail {
          font-size: 12px;
          color: var(--text-secondary);
          margin-top: 2px;
        }
        .set-account-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .set-dot-active {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--accent-teal);
          box-shadow: 0 0 6px var(--accent-teal);
        }
        .set-add-account {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        /* notifications */
        .set-notif-group-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 14px;
        }
        .set-notif-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        /* responsive */
        @media (max-width: 800px) {
          .set-root { padding: 16px; }
          .set-layout { flex-direction: column; }
          .set-sidebar { width: 100%; flex-direction: row; flex-wrap: wrap; }
          .set-nav-item { width: auto; flex: 1; justify-content: center; }
          .set-input { width: 160px; }
          .set-field-row { flex-direction: column; align-items: flex-start; gap: 8px; }
          .set-field-control { width: 100%; }
          .set-input { width: 100%; }
        }
      `}</style>
        </div>
    )
}