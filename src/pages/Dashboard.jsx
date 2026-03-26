import { useState, useMemo } from 'react'
import { format, subDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { Users, UserPlus, UserMinus, TrendingUp, Star, Zap, BarChart2, Shield } from 'lucide-react'
import { StatCard, DateRangePicker } from '../components/ui/index.jsx'
import { getKPIs } from '../data/mockData.js'

const fmt = d => format(new Date(d + 'T12:00:00'), 'd MMM yyyy', { locale: es })

export default function Dashboard() {
    const today = format(new Date(), 'yyyy-MM-dd')
    const [start, setStart] = useState(format(subDays(new Date(), 90), 'yyyy-MM-dd'))
    const [end, setEnd]     = useState(today)

    const kpi = useMemo(() => getKPIs(start, end), [start, end])

    const cards = [
        { label: 'Seguidores actuales',     value: kpi.totalFollowers.toLocaleString(),                               accent: 'teal',   icon: Users,     sub: 'total acumulado'          },
        { label: 'Nuevos Seguidores',       value: `+${kpi.newFollowers.toLocaleString()}`,                           accent: 'orange', icon: UserPlus,  sub: 'en el rango'              },
        { label: 'Seguidores Perdidos',     value: `-${kpi.lostFollowers.toLocaleString()}`,                          accent: 'pink',   icon: UserMinus, sub: 'en el rango'              },
        { label: 'Crecimiento Neto',        value: (kpi.netGrowth >= 0 ? '+' : '') + kpi.netGrowth.toLocaleString(), accent: kpi.netGrowth >= 0 ? 'teal' : 'red', icon: TrendingUp, sub: 'nuevos - perdidos' },
        { label: 'Mejor Dia de Seguidores', value: kpi.bestDay ? fmt(kpi.bestDay) : '—',                             accent: 'orange', icon: Star,      sub: ''                         },
        { label: 'Pico de Seguidores',      value: kpi.bestDayPeak.toLocaleString(),                                  accent: 'orange', icon: Zap,       sub: 'en un solo día'           },
        { label: 'Promedio Diario',         value: kpi.avgDaily.toLocaleString(),                                     accent: 'purple', icon: BarChart2, sub: 'nuevos por día'           },
        { label: 'Tasa de Retención',       value: `${kpi.retention}%`,                                              accent: kpi.retention >= 80 ? 'teal' : kpi.retention >= 60 ? 'orange' : 'pink', icon: Shield, sub: 'seguidores que se quedan' },
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

            <div className="dash-kpi-grid">
                {cards.map((c, i) => <StatCard key={i} {...c} />)}
            </div>

            <style>{`
                .dash-page {
                    padding: 28px 32px 48px;
                    width: 100%;
                    max-width: 1100px;
                    box-sizing: border-box;
                }
                .dash-header {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    margin-bottom: 28px;
                    gap: 16px;
                    flex-wrap: wrap;
                }
                .dash-title {
                    font-family: var(--font-display);
                    font-size: 24px;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                    color: var(--text-primary);
                }
                .dash-subtitle {
                    font-size: 13px;
                    color: var(--text-secondary);
                    margin-top: 4px;
                }
                .dash-kpi-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    width: 100%;
                }
                @media (max-width: 1100px) {
                    .dash-kpi-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 800px) {
                    .dash-page { padding: 16px; }
                }
                @media (max-width: 500px) {
                    .dash-kpi-grid { grid-template-columns: 1fr; }
                }
      `}</style>
        </div>
    )
}