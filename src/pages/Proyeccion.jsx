import { useState, useEffect, useMemo } from "react";
import { format, subDays, addDays } from "date-fns";
import { es } from "date-fns/locale";
import { Target, TrendingUp, Calendar, Zap, Shield, Instagram } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { StatCard, Card } from "../components/ui/index.jsx";
import { statsAPI, BASE } from "../services/api.js";

const fmt = (d) => format(new Date(d + "T12:00:00"), "d MMM", { locale: es });

const getToken  = () => localStorage.getItem("sp_token");
const authFetch = (path) => fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${getToken()}` } });

function computeProjections(followers, lost) {
    const start   = format(subDays(new Date(), 30), "yyyy-MM-dd");
    const end     = format(new Date(), "yyyy-MM-dd");
    const snap    = followers.filter((r) => r.scraped_at?.slice(0, 10) >= start && r.scraped_at?.slice(0, 10) <= end);
    const lostF   = lost.filter((r) => r.fecha_perdida?.slice(0, 10) >= start && r.fecha_perdida?.slice(0, 10) <= end);
    const netGrowth  = snap.length - lostF.length;
    const avgDaily   = +(netGrowth / 30).toFixed(1);
    const currentTotal = followers.length;
    const retention    = currentTotal > 0 ? +((currentTotal / (currentTotal + lost.length)) * 100).toFixed(1) : 0;
    return { currentTotal, avgDaily, retention, proj7Days: Math.round(currentTotal + avgDaily * 7), proj30Days: Math.round(currentTotal + avgDaily * 30) };
}

function buildForecastChart(followers, lost, kpi) {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const start    = format(subDays(new Date(), 15), "yyyy-MM-dd");
    const byDay = {}, lostByDay = {};
    followers.forEach((r) => { const d = r.scraped_at?.slice(0, 10); if (d) byDay[d] = (byDay[d] || 0) + 1; });
    lost.forEach((r) => { const d = r.fecha_perdida?.slice(0, 10); if (d) lostByDay[d] = (lostByDay[d] || 0) + 1; });
    const allDates = [...new Set([...Object.keys(byDay), ...Object.keys(lostByDay)])].sort();
    let running = 0, chartData = [], lastReal = 0;
    allDates.forEach((date) => {
        running += (byDay[date] || 0) - (lostByDay[date] || 0);
        if (date >= start && date <= todayStr) {
            chartData.push({ fecha: date, label: fmt(date), Real: running, Proyectado: null });
            lastReal = running;
        }
    });
    if (chartData.length > 0) chartData[chartData.length - 1].Proyectado = lastReal;
    let projValue = lastReal;
    for (let i = 1; i <= 30; i++) {
        const nextDate = format(addDays(new Date(), i), "yyyy-MM-dd");
        projValue += kpi.avgDaily || 0;
        chartData.push({ fecha: nextDate, label: fmt(nextDate), Real: null, Proyectado: Math.round(projValue) });
    }
    return chartData;
}

function CustomTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-md)", padding: "12px 16px", fontSize: "13px", boxShadow: "var(--shadow-elevated)" }}>
            <div style={{ color: "var(--text-secondary)", marginBottom: 8, fontWeight: 600 }}>{label}</div>
            {payload.map((p, i) => {
                if (p.value === null) return null;
                const isProj = p.dataKey === "Proyectado";
                return (
                    <div key={i} style={{ color: isProj ? "var(--accent-orange)" : "var(--accent-teal)", display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: isProj ? "var(--accent-orange)" : "var(--accent-teal)" }} />
                        <span>{isProj ? "Proyección:" : "Seguidores:"}</span>
                        <strong style={{ fontSize: "14px" }}>{p.value.toLocaleString()}</strong>
                    </div>
                );
            })}
        </div>
    );
}

export default function Proyeccion() {
    const [followers, setFollowers] = useState([]);
    const [lost, setLost]           = useState([]);
    const [loading, setLoading]     = useState(true);
    const [noAccount, setNoAccount] = useState(false);

    useEffect(() => {
        authFetch("/auth/me")
            .then((r) => r.json())
            .then((user) => {
                if (!user.ig_username) { setNoAccount(true); setLoading(false); return; }
                return Promise.all([statsAPI.igFollowers(), statsAPI.igLost()])
                    .then(([f, l]) => { setFollowers(f); setLost(l); });
            })
            .catch(() => setNoAccount(true))
            .finally(() => setLoading(false));
    }, []);

    const kpi       = useMemo(() => computeProjections(followers, lost), [followers, lost]);
    const chartData = useMemo(() => buildForecastChart(followers, lost, kpi), [followers, lost, kpi]);

    const cards = [
        { label: "Crecimiento Promedio", value: `${kpi.avgDaily > 0 ? "+" : ""}${kpi.avgDaily}`, accent: "teal",   icon: TrendingUp, sub: "Seguidores / día (30d)"      },
        { label: "Tasa de Retención",    value: `${kpi.retention}%`,                              accent: kpi.retention >= 80 ? "teal" : kpi.retention >= 60 ? "orange" : "pink", icon: Shield, sub: "Permanencia histórica" },
        { label: "Meta a 7 Días",        value: kpi.proj7Days.toLocaleString(),                   accent: "orange", icon: Zap,        sub: "Tendencia próxima semana"    },
        { label: "Meta a 30 Días",       value: kpi.proj30Days.toLocaleString(),                  accent: "purple", icon: Calendar,   sub: "Tendencia próximo mes"       },
    ];

    return (
        <div className="proj-page fade-in">
            <div className="proj-header">
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <h1 className="proj-title">Análisis de Proyecciones</h1>
                        <div className="social-badge"><Instagram size={18} /><span>Instagram</span></div>
                    </div>
                    <p className="proj-subtitle">Metas calculadas mediante la curva de tendencia actual</p>
                </div>
            </div>

            {loading && <div className="proj-state">Procesando modelos de proyección...</div>}

            {!loading && noAccount && (
                <div className="proj-state">
                    <p>No tienes una cuenta de Instagram conectada.</p>
                    <p>Ve a <strong>Settings → Cuentas conectadas</strong> para configurarla.</p>
                </div>
            )}

            {!loading && !noAccount && followers.length === 0 && (
                <div className="proj-state">Aún no hay datos suficientes para proyectar. Ejecuta el primer sync desde Settings.</div>
            )}

            {!loading && !noAccount && followers.length > 0 && (
                <>
                    <div className="proj-kpi-grid">
                        {cards.map((c, i) => <StatCard key={i} {...c} />)}
                    </div>
                    <Card style={{ padding: "24px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                            <div>
                                <h3 style={{ fontFamily: "var(--font-display)", fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
                                    <Target size={18} style={{ marginRight: 8, verticalAlign: "middle", color: "var(--accent-orange)" }} />
                                    Forecast Predictivo
                                </h3>
                                <span style={{ fontSize: "13px", color: "var(--text-secondary)", display: "block", marginTop: 4 }}>
                  Estimación lineal basada en el crecimiento de los últimos 30 días.
                </span>
                            </div>
                            <div style={{ display: "flex", gap: 12, fontSize: 12, fontWeight: 600 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-secondary)" }}>
                                    <span style={{ width: 10, height: 3, background: "var(--accent-teal)", borderRadius: 2 }} /> Real
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-secondary)" }}>
                                    <span style={{ width: 10, height: 3, background: "var(--accent-orange)", borderRadius: 2 }} /> Proyectado
                                </div>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={400}>
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradT" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="var(--accent-teal)"   stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--accent-teal)"   stopOpacity={0.0} />
                                    </linearGradient>
                                    <linearGradient id="gradO" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="var(--accent-orange)" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="var(--accent-orange)" stopOpacity={0.0}  />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="label" tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} minTickGap={30} />
                                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} domain={["auto", "auto"]} />
                                <Tooltip content={(props) => <CustomTooltip {...props} />} />
                                <ReferenceLine x={fmt(format(new Date(), "yyyy-MM-dd"))} stroke="var(--border)" strokeDasharray="3 3" label={{ position: "top", value: "Hoy", fill: "var(--text-muted)", fontSize: 11 }} />
                                <Area type="monotone" dataKey="Real"       stroke="var(--accent-teal)"   strokeWidth={3} fill="url(#gradT)" activeDot={{ r: 6, fill: "var(--accent-teal)",   stroke: "var(--bg-card)", strokeWidth: 3 }} />
                                <Area type="monotone" dataKey="Proyectado" stroke="var(--accent-orange)" strokeWidth={3} strokeDasharray="5 5" fill="url(#gradO)" activeDot={{ r: 6, fill: "var(--accent-orange)", stroke: "var(--bg-card)", strokeWidth: 3 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Card>
                </>
            )}

            <style>{`
        .proj-page { padding: 32px 40px; width: 100%; max-width: 1400px; margin: 0 auto; }
        .proj-header { margin-bottom: 32px; }
        .proj-title { font-family: var(--font-display); font-size: 28px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; margin: 0; }
        .proj-subtitle { font-size: 14px; color: var(--text-secondary); margin-top: 4px; }
        .social-badge { display: flex; align-items: center; gap: 6px; background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); color: white; padding: 4px 12px; border-radius: var(--radius-full); font-size: 13px; font-weight: 600; font-family: var(--font-display); box-shadow: 0 2px 10px rgba(220,39,67,0.2); }
        .proj-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
        .proj-state { padding: 80px 0; text-align: center; color: var(--text-secondary); font-size: 15px; font-weight: 500; line-height: 2; }
        @media (max-width: 1100px) { .proj-kpi-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 800px)  { .proj-page { padding: 20px; } }
        @media (max-width: 500px)  { .proj-kpi-grid { grid-template-columns: 1fr; } }
      `}</style>
        </div>
    );
}