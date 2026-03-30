import { useState, useEffect, useMemo } from "react";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { Users, UserPlus, UserMinus, TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { StatCard, DateRangePicker, Card } from "../components/ui/index.jsx";
import { statsAPI } from "../services/api.js";

const fmt = (d) => format(new Date(d + "T12:00:00"), "d MMM", { locale: es });

function computeKPIs(followers, lost, start, end) {
  const snap = followers.filter(
    (r) =>
      r.scraped_at?.slice(0, 10) >= start && r.scraped_at?.slice(0, 10) <= end,
  );
  const lostF = lost.filter(
    (r) =>
      r.fecha_perdida?.slice(0, 10) >= start &&
      r.fecha_perdida?.slice(0, 10) <= end,
  );
  return {
    totalFollowers: followers.length,
    newFollowers: snap.length,
    lostFollowers: lostF.length,
    netGrowth: snap.length - lostF.length,
  };
}

function buildChartData(followers, lost, start, end) {
  const byDay = {};
  const lostByDay = {};
  followers.forEach((r) => {
    const d = r.scraped_at?.slice(0, 10);
    if (d) byDay[d] = (byDay[d] || 0) + 1;
  });
  lost.forEach((r) => {
    const d = r.fecha_perdida?.slice(0, 10);
    if (d) lostByDay[d] = (lostByDay[d] || 0) + 1;
  });

  const allDates = [
    ...new Set([...Object.keys(byDay), ...Object.keys(lostByDay)]),
  ].sort();
  let running = 0;
  return allDates
    .map((date) => {
      running += (byDay[date] || 0) - (lostByDay[date] || 0);
      return { fecha: date, label: fmt(date), Seguidores: running };
    })
    .filter((r) => r.fecha >= start && r.fecha <= end);
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-md)",
        padding: "10px 14px",
        fontSize: "12px",
        color: "var(--text-primary)",
        boxShadow: "var(--shadow-elevated)",
      }}
    >
      <div
        style={{
          color: "var(--text-secondary)",
          marginBottom: 6,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
      <div
        style={{
          color: "var(--accent-teal)",
          display: "flex",
          gap: 8,
          alignItems: "center",
        }}
      >
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--accent-teal)",
          }}
        />
        <span>Seguidores:</span>
        <strong>{payload[0].value?.toLocaleString()}</strong>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const [start, setStart] = useState(
    format(subDays(new Date(), 30), "yyyy-MM-dd"),
  );
  const [end, setEnd] = useState(todayStr);
  const [followers, setFollowers] = useState([]);
  const [lost, setLost] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("sp_token");
    if (!token) return;
    fetch("http://localhost:8000/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((user) => {
        if (!user.ig_username) {
          setLoading(false);
          return;
        }
        return Promise.all([statsAPI.igFollowers(), statsAPI.igLost()]).then(
          ([f, l]) => {
            setFollowers(f);
            setLost(l);
          },
        );
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const kpi = useMemo(
    () => computeKPIs(followers, lost, start, end),
    [followers, lost, start, end],
  );
  const chartData = useMemo(
    () => buildChartData(followers, lost, start, end),
    [followers, lost, start, end],
  );

  const cards = [
    {
      label: "Comunidad Actual",
      value: kpi.totalFollowers.toLocaleString(),
      accent: "purple",
      icon: Users,
      sub: "Total acumulado",
    },
    {
      label: "Nuevos Seguidores",
      value: `+${kpi.newFollowers.toLocaleString()}`,
      accent: "teal",
      icon: UserPlus,
      sub: "En el periodo",
    },
    {
      label: "Seguidores Perdidos",
      value: `-${kpi.lostFollowers.toLocaleString()}`,
      accent: "pink",
      icon: UserMinus,
      sub: "En el periodo",
    },
    {
      label: "Balance Neto",
      value: (kpi.netGrowth >= 0 ? "+" : "") + kpi.netGrowth.toLocaleString(),
      accent: kpi.netGrowth >= 0 ? "teal" : "red",
      icon: TrendingUp,
      sub: "Crecimiento real",
    },
  ];

  return (
    <div className="dash-page fade-in">
      <div className="dash-header">
        <div>
          <h1 className="dash-title">Dashboard</h1>
          <p className="dash-subtitle">Rendimiento visual de tu comunidad</p>
        </div>
        <DateRangePicker
          start={start}
          end={end}
          onChangeStart={setStart}
          onChangeEnd={setEnd}
        />
      </div>

      {loading && <div className="dash-state">Cargando gráficos...</div>}
      {!loading && followers.length > 0 && (
        <>
          <div className="dash-kpi-grid">
            {cards.map((c, i) => (
              <StatCard key={i} {...c} />
            ))}
          </div>
          <Card style={{ padding: "24px" }}>
            <div style={{ marginBottom: "24px" }}>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "18px",
                  fontWeight: 700,
                }}
              >
                Evolución de Seguidores
              </h3>
            </div>
            <ResponsiveContainer width="100%" height={380}>
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradTeal" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--accent-teal)"
                      stopOpacity={0.3}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--accent-teal)"
                      stopOpacity={0.0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  minTickGap={20}
                />
                <YAxis
                  tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={(props) => <CustomTooltip {...props} />} />
                <Area
                  type="monotone"
                  dataKey="Seguidores"
                  stroke="var(--accent-teal)"
                  strokeWidth={3}
                  fill="url(#gradTeal)"
                  activeDot={{
                    r: 6,
                    fill: "#06b6d4",
                    stroke: "var(--bg-card)",
                    strokeWidth: 3,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}

      <style>{`
                .dash-page { padding: 32px 40px; width: 100%; max-width: 1400px; }
                .dash-header { display: flex; justify-content: space-between; margin-bottom: 32px; }
                .dash-title { font-family: var(--font-display); font-size: 28px; font-weight: 800; color: var(--text-primary); }
                .dash-subtitle { font-size: 14px; color: var(--text-secondary); margin-top: 4px; }
                .dash-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px;}
                .dash-state { padding: 80px 0; text-align: center; color: var(--text-secondary); }
            `}</style>
    </div>
  );
}
