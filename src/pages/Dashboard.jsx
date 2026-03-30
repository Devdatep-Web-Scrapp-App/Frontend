import { useState, useEffect, useMemo } from 'react'
import { format, subDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { Users, UserPlus, UserMinus, TrendingUp, Star, Zap, BarChart2, Shield } from 'lucide-react'
import { StatCard, DateRangePicker } from '../components/ui/index.jsx'
import { statsAPI } from '../services/api.js'

const fmt     = d => format(new Date(d + 'T12:00:00'), 'd MMM yyyy', { locale: es })
const fmtFull = d => format(new Date(d), 'd MMM yyyy · HH:mm', { locale: es })

function computeKPIs(followers, lost, start, end) {
    const snap  = followers.filter(r => r.scraped_at?.slice(0, 10) >= start && r.scraped_at?.slice(0, 10) <= end)
    const lostF = lost.filter(r => r.fecha_perdida?.slice(0, 10) >= start && r.fecha_perdida?.slice(0, 10) <= end)
    const total = followers.length
    const byDay = {}
    followers.forEach(r => { const d = r.scraped_at?.slice(0, 10); if (d) byDay[d] = (byDay[d] || 0) + 1 })
    const bestDay   = Object.entries(byDay).sort((a, b) => b[1] - a[1])[0]
    const days      = Object.values(byDay)
    const avgDaily  = days.length ? +(days.reduce((a, b) => a + b, 0) / days.length).toFixed(1) : 0
    const retention = total > 0 ? +((total / (total + lost.length)) * 100).toFixed(1) : 0
    return { totalFollowers: total, newFollowers: snap.length, lostFollowers: lostF.length, netGrowth: snap.length - lostF.length, bestDay: bestDay ? bestDay[0] : null, bestDayPeak: bestDay ? bestDay[1] : 0, avgDaily, retention }
}

function Avatar({ name, username, size = 36 }) {
    const str      = name || username || '?'
    const initials = str.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    const colors   = ['#06b6d4', '#f59e0b', '#f43f5e', '#7c3aed', '#10b981', '#3b82f6']
    const color    = colors[(str.charCodeAt(0) || 0) % colors.length]
    return (
        <div style={{ width: size, height: size, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.35, color: 'white', flexShrink: 0, fontFamily: 'var(--font-display)' }}>
            {initials}
        </div>
    )
}

function ActivityRow({ item, type }) {
    const isNew   = type === 'new'
    const dateStr = isNew ? item.scraped_at : item.fecha_perdida
    return (
        <div className="act-row">
            <Avatar name={item.full_name} username={item.username} />
            <div className="act-info">
                <span className="act-name">{item.full_name || item.username}</span>
                <span className="act-user">@{item.username}</span>
            </div>
            <div className="act-right">
                <span className={`act-badge ${isNew ? 'new' : 'lost'}`}>{isNew ? '+ Nuevo' : '− Perdido'}</span>
                <span className="act-date">{dateStr ? fmtFull(dateStr) : '—'}</span>
            </div>
        </div>
    )
}

function DailyActivity({ followers, lost }) {
    const todayStr  = format(new Date(), 'yyyy-MM-dd')
    const [tab, setTab] = useState('new')
    const newToday  = followers.filter(r => r.scraped_at?.slice(0, 10) === todayStr)
    const lostToday = lost.filter(r => r.fecha_perdida?.slice(0, 10) === todayStr)
    const list      = tab === 'new' ? newToday : lostToday

    return (
        <div className="act-card">
            <div className="act-header">
                <div>
                    <div className="act-title">Actividad de hoy</div>
                    <div className="act-sub">{fmt(todayStr)}</div>
                </div>
                <div className="act-tabs">
                    <button className={`act-tab ${tab === 'new' ? 'active' : ''}`} onClick={() => setTab('new')}>
                        <UserPlus size={13} /> Nuevos <span className="act-count">{newToday.length}</span>
                    </button>
                    <button className={`act-tab ${tab === 'lost' ? 'active lost' : ''}`} onClick={() => setTab('lost')}>
                        <UserMinus size={13} /> Perdidos <span className="act-count">{lostToday.length}</span>
                    </button>
                </div>
            </div>

            {list.length === 0 ? (
                <div className="act-empty">
                    {tab === 'new' ? 'No hay nuevos seguidores hoy.' : 'No se perdieron seguidores hoy.'}
                </div>
            ) : (
                <div className="act-list">
                    {list.map((item, i) => (
                        <div key={i}>
                            {i > 0 && <div className="act-divider" />}
                            <ActivityRow item={item} type={tab} />
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                .act-card { background: var(--bg-card); border-radius: var(--radius-lg); box-shadow: var(--shadow-card); overflow: hidden; margin-top: 20px; }
                .act-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px 14px; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid var(--border); }
                .act-title { font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--text-primary); }
                .act-sub { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
                .act-tabs { display: flex; gap: 6px; }
                .act-tab { display: flex; align-items: center; gap: 5px; padding: 6px 12px; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--bg-elevated); color: var(--text-secondary); font-size: 12px; font-weight: 500; font-family: var(--font-body); cursor: pointer; transition: all 0.15s; }
                .act-tab:hover { border-color: var(--accent-teal); color: var(--text-primary); }
                .act-tab.active { background: var(--accent-teal-dim); border-color: var(--accent-teal); color: var(--accent-teal); }
                .act-tab.active.lost { background: var(--accent-pink-dim); border-color: var(--accent-pink); color: var(--accent-pink); }
                .act-count { background: var(--bg-card); border-radius: 20px; padding: 1px 6px; font-size: 11px; font-weight: 700; }
                .act-list { max-height: 360px; overflow-y: auto; }
                .act-row { display: flex; align-items: center; gap: 12px; padding: 12px 22px; }
                .act-divider { height: 1px; background: var(--border); margin: 0 22px; }
                .act-info { flex: 1; min-width: 0; }
                .act-name { display: block; font-size: 13px; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .act-user { display: block; font-size: 12px; color: var(--text-secondary); margin-top: 1px; }
                .act-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; }
                .act-badge { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 20px; }
                .act-badge.new  { background: var(--accent-teal-dim); color: var(--accent-teal); }
                .act-badge.lost { background: var(--accent-pink-dim); color: var(--accent-pink); }
                .act-date { font-size: 11px; color: var(--text-muted); }
                .act-empty { padding: 32px 22px; text-align: center; color: var(--text-muted); font-size: 13px; }
            `}</style>
        </div>
    )
}

export default function Dashboard() {
    const todayStr  = format(new Date(), 'yyyy-MM-dd')
    const [start, setStart] = useState(format(subDays(new Date(), 90), 'yyyy-MM-dd'))
    const [end, setEnd]     = useState(todayStr)
    const [followers, setFollowers] = useState([])
    const [lost, setLost]           = useState([])
    const [loading, setLoading]     = useState(true)
    const [error, setError]         = useState(null)

    useEffect(() => {
        const token = localStorage.getItem('sp_token')
        if (!token) return
        fetch('http://localhost:8000/auth/me', { headers: { 'Authorization': `Bearer ${token}` } })
            .then(r => r.json())
            .then(user => {
                if (!user.ig_username) { setLoading(false); return }
                return Promise.all([statsAPI.igFollowers(), statsAPI.igLost()])
                    .then(([f, l]) => { setFollowers(f); setLost(l) })
                    .catch(e => setError(e.message))
            })
            .finally(() => setLoading(false))
    }, [])

    const kpi = useMemo(() => computeKPIs(followers, lost, start, end), [followers, lost, start, end])

    const cards = [
        { label: 'Seguidores actuales',  value: kpi.totalFollowers.toLocaleString(),                               accent: 'teal',   icon: Users,     sub: 'total acumulado'           },
        { label: 'Nuevos Seguidores',    value: `+${kpi.newFollowers.toLocaleString()}`,                           accent: 'orange', icon: UserPlus,  sub: 'en el rango'               },
        { label: 'Seguidores Perdidos',  value: `-${kpi.lostFollowers.toLocaleString()}`,                          accent: 'pink',   icon: UserMinus, sub: 'en el rango'               },
        { label: 'Crecimiento Neto',     value: (kpi.netGrowth >= 0 ? '+' : '') + kpi.netGrowth.toLocaleString(), accent: kpi.netGrowth >= 0 ? 'teal' : 'red', icon: TrendingUp, sub: 'nuevos - perdidos' },
        { label: 'Mejor Dia',            value: kpi.bestDay ? fmt(kpi.bestDay) : '—',                             accent: 'orange', icon: Star,      sub: ''                          },
        { label: 'Pico de Seguidores',   value: kpi.bestDayPeak.toLocaleString(),                                  accent: 'orange', icon: Zap,       sub: 'en un solo día'            },
        { label: 'Promedio Diario',      value: kpi.avgDaily.toLocaleString(),                                     accent: 'purple', icon: BarChart2, sub: 'nuevos por día'            },
        { label: 'Tasa de Retención',    value: `${kpi.retention}%`,                                              accent: kpi.retention >= 80 ? 'teal' : kpi.retention >= 60 ? 'orange' : 'pink', icon: Shield, sub: 'seguidores que se quedan' },
    ]

    return (
        <div className="dash-page fade-in">
            <div className="dash-header">
                <div>
                    <h1 className="dash-title">Analytics Dashboard</h1>
                    <p className="dash-subtitle">Seguimiento de crecimiento en Instagram</p>
                </div>
                <DateRangePicker start={start} end={end} onChangeStart={setStart} onChangeEnd={setEnd} />
            </div>

            {loading && <div className="dash-state">Cargando datos...</div>}
            {error   && <div className="dash-state dash-error">Error: {error}</div>}

            {!loading && !error && followers.length === 0 && (
                <div className="dash-empty">
                    <p>Aún no hay datos de seguidores.</p>
                    <p>Ve a <strong>Settings → Cuentas conectadas</strong> y conecta tu Instagram para empezar.</p>
                </div>
            )}

            {!loading && !error && followers.length > 0 && <>
                <div className="dash-kpi-grid">
                    {cards.map((c, i) => <StatCard key={i} {...c} />)}
                </div>
                <DailyActivity followers={followers} lost={lost} />
            </>}

            <style>{`
                .dash-page { padding: 28px 32px 48px; width: 100%; max-width: 1100px; box-sizing: border-box; }
                .dash-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; gap: 16px; flex-wrap: wrap; }
                .dash-title { font-family: var(--font-display); font-size: 24px; font-weight: 800; letter-spacing: -0.02em; color: var(--text-primary); }
                .dash-subtitle { font-size: 13px; color: var(--text-secondary); margin-top: 4px; }
                .dash-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; width: 100%; }
                .dash-state { color: var(--text-secondary); font-size: 14px; padding: 40px 0; }
                .dash-error { color: #f87171; }
                .dash-empty { background: var(--bg-card); border: 1px dashed var(--border); border-radius: var(--radius-lg); padding: 40px 32px; color: var(--text-secondary); font-size: 14px; line-height: 1.8; }
                @media (max-width: 1100px) { .dash-kpi-grid { grid-template-columns: repeat(2, 1fr); } }
                @media (max-width: 800px)  { .dash-page { padding: 16px; } }
                @media (max-width: 500px)  { .dash-kpi-grid { grid-template-columns: 1fr; } }
            `}</style>
        </div>
    )
}