import { useState, useMemo } from 'react'
import { format, subDays } from 'date-fns'
import {
    AreaChart, Area, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, ReferenceLine
} from 'recharts'
import { TrendingUp, BarChart2 } from 'lucide-react'
import { Card, DateRangePicker } from '../components/ui/index.jsx'
import { getGrowthHistory, getDailyBalance } from '../data/mockData.js'

const shortDate = d => {
    const [, m, day] = d.split('-')
    const months = ['','ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']
    return `${parseInt(day)} ${months[parseInt(m)]}`
}

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null
    return (
        <div style={{
            background: 'white',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            fontSize: '12px',
            color: 'var(--text-primary)'
        }}>
            <div style={{ color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</div>
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, display: 'inline-block' }} />
                    <span>{p.name}:</span>
                    <strong>{p.value?.toLocaleString()}</strong>
                </div>
            ))}
        </div>
    )
}

export default function Historial() {
    const today = format(new Date(), 'yyyy-MM-dd')
    const [start, setStart] = useState(format(subDays(new Date(), 90), 'yyyy-MM-dd'))
    const [end, setEnd]     = useState(today)

    const growthData  = useMemo(() => getGrowthHistory(start, end), [start, end])
    const balanceData = useMemo(() => getDailyBalance(start, end), [start, end])

    const growthLabeled  = growthData.map(r  => ({ ...r, label: shortDate(r.fecha) }))
    const balanceLabeled = balanceData.map(r => ({ ...r, label: shortDate(r.fecha) }))

    return (
        <div className="hist-page fade-in">
            <div className="hist-header">
                <div>
                    <h1 className="hist-title">Historial</h1>
                    <p className="hist-subtitle">Evolución de seguidores en el tiempo</p>
                </div>
                <DateRangePicker start={start} end={end} onChangeStart={setStart} onChangeEnd={setEnd} />
            </div>

            <Card style={{ marginBottom: 16 }}>
                <div className="hist-chart-header">
                    <div className="hist-chart-title-row">
                        <span className="hist-chart-icon teal"><TrendingUp size={15} /></span>
                        <div>
                            <div className="hist-chart-title">Historial del Crecimiento de Seguidores</div>
                            <div className="hist-chart-sub">Seguidores acumulados por fecha</div>
                        </div>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={growthLabeled} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                            <linearGradient id="gradTeal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.25} />
                                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={(props) => <CustomTooltip {...props} />} />
                        <Area type="monotone" dataKey="total_seguidores" name="Seguidores" stroke="var(--accent-teal)" strokeWidth={2} fill="url(#gradTeal)" dot={false} activeDot={{ r: 5, fill: '#00d4aa', stroke: 'var(--bg-card)', strokeWidth: 2 }} />
                    </AreaChart>
                </ResponsiveContainer>
            </Card>

            <Card>
                <div className="hist-chart-header">
                    <div className="hist-chart-title-row">
                        <span className="hist-chart-icon pink"><BarChart2 size={15} /></span>
                        <div>
                            <div className="hist-chart-title">Balance Diario de Seguidores</div>
                            <div className="hist-chart-sub">Ganados vs perdidos por día</div>
                        </div>
                    </div>
                    <div className="hist-legend-row">
                        <span className="hist-legend-dot" style={{ background: 'var(--accent-teal)' }} />
                        <span className="hist-legend-label">Nuevos</span>
                        <span className="hist-legend-dot" style={{ background: 'var(--accent-pink)' }} />
                        <span className="hist-legend-label">Perdidos</span>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={balanceLabeled} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barCategoryGap="30%">
                        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={(props) => <CustomTooltip {...props} />} />
                        <ReferenceLine y={0} stroke="var(--border)" />
                        <Bar dataKey="nuevos"   name="Nuevos"   fill="var(--accent-teal)" radius={[3,3,0,0]} maxBarSize={14} />
                        <Bar dataKey="perdidos" name="Perdidos" fill="var(--accent-pink)" radius={[3,3,0,0]} maxBarSize={14} />
                    </BarChart>
                </ResponsiveContainer>
            </Card>

            <style>{`
                .hist-page {
                    padding: 28px 32px 48px;
                    width: 100%;
                    max-width: 1100px;
                    box-sizing: border-box;
                }
                .hist-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    margin-bottom: 28px;
                    gap: 16px;
                    flex-wrap: wrap;
                }
                .hist-title {
                    font-family: var(--font-display);
                    font-size: 24px;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                    color: var(--text-primary);
                }
                .hist-subtitle {
                    font-size: 13px;
                    color: var(--text-secondary);
                    margin-top: 4px;
                }
                .hist-chart-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                    gap: 12px;
                }
                .hist-chart-title-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .hist-chart-icon {
                    width: 30px;
                    height: 30px;
                    border-radius: var(--radius-sm);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .hist-chart-icon.teal { background: var(--accent-teal-dim); color: var(--accent-teal); }
                .hist-chart-icon.pink { background: var(--accent-pink-dim); color: var(--accent-pink); }
                .hist-chart-title {
                    font-family: var(--font-display);
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-primary);
                }
                .hist-chart-sub {
                    font-size: 12px;
                    color: var(--text-secondary);
                    margin-top: 1px;
                }
                .hist-legend-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .hist-legend-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    display: inline-block;
                }
                .hist-legend-label {
                    font-size: 12px;
                    color: var(--text-secondary);
                }
                @media (max-width: 800px) {
                    .hist-page { padding: 16px; }
                    .hist-header { flex-direction: column; align-items: flex-start; }
                }
      `}</style>
        </div>
    )
}