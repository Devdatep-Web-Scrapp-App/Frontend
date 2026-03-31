import { useState, useEffect, useMemo } from "react";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import {
  Users,
  UserPlus,
  UserMinus,
  Star,
  Instagram,
  Activity,
  User,
} from "lucide-react";
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

const fmtDate = (d) =>
  d ? format(new Date(d), "dd MMM yyyy", { locale: es }) : "—";
const fmtTime = (d) => (d ? format(new Date(d), "HH:mm") : "—");
const fmt = (d) => format(new Date(d + "T12:00:00"), "d MMM", { locale: es });

function Avatar({ str, color }) {
  const initials = (str || "?").slice(0, 2).toUpperCase();
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "10px",
        background: `var(--${color}-dim)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        fontSize: 13,
        color: `var(--${color})`,
        fontFamily: "var(--font-display)",
        flexShrink: 0,
        border: `1px solid var(--${color}-dim)`,
      }}
    >
      {initials !== "?" ? initials : <User size={16} />}
    </div>
  );
}

// Componente para la actividad del día actual (Estilo Feed)
function DailyMonitor({ followers, lost }) {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const [activeTab, setActiveTab] = useState("nuevos");

  const newToday = followers.filter(
    (r) => r.scraped_at?.slice(0, 10) === todayStr,
  );
  const lostToday = lost.filter(
    (r) => r.fecha_perdida?.slice(0, 10) === todayStr,
  );

  const currentList = activeTab === "nuevos" ? newToday : lostToday;
  const isNew = activeTab === "nuevos";
  const accentColor = isNew ? "accent-teal" : "accent-pink";

  return (
    <Card
      style={{
        padding: 0,
        overflow: "hidden",
        border: `1px solid var(--${accentColor}-dim)`,
      }}
    >
      <div
        className="daily-header"
        style={{
          background: `linear-gradient(to right, var(--bg-card), var(--${accentColor}-dim))`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              paddingRight: 16,
              borderRight: `2px solid var(--${accentColor})`,
            }}
          >
            <Activity size={20} color={`var(--${accentColor})`} />
            <span
              style={{
                fontWeight: 800,
                fontSize: 16,
                color: "var(--text-primary)",
              }}
            >
              Monitor Diario
            </span>
          </div>
          <div className="daily-tabs">
            <button
              className={`daily-tab ${isNew ? "active-teal" : ""}`}
              onClick={() => setActiveTab("nuevos")}
            >
              <UserPlus size={15} /> Recientes{" "}
              <span className="daily-badge teal">{newToday.length}</span>
            </button>
            <button
              className={`daily-tab ${!isNew ? "active-pink" : ""}`}
              onClick={() => setActiveTab("perdidos")}
            >
              <UserMinus size={15} /> Bajas{" "}
              <span className="daily-badge pink">{lostToday.length}</span>
            </button>
          </div>
        </div>
      </div>

      <div
        className="feed-container"
        style={{
          maxHeight: "350px",
          overflowY: "auto",
          padding: "16px 24px",
          background: "var(--bg-base)",
        }}
      >
        {currentList.length === 0 ? (
          <div
            className="hist-empty"
            style={{
              background: "var(--bg-card)",
              borderRadius: "var(--radius-lg)",
            }}
          >
            <Activity
              size={32}
              color="var(--border)"
              style={{ marginBottom: 12 }}
            />
            <br />
            No hay movimientos registrados para el día de hoy.
          </div>
        ) : (
          <div className="feed-list">
            {currentList.map((u, i) => (
              <div
                key={i}
                className="feed-item fade-in"
                style={{ borderLeft: `3px solid var(--${accentColor})` }}
              >
                <Avatar str={u.username} color={accentColor} />
                <div className="feed-info">
                  <div className="feed-name">
                    {u.full_name || "Usuario sin nombre"}
                  </div>
                  <div className="feed-user">@{u.username}</div>
                </div>
                <div className="feed-meta">
                  <div
                    className="feed-badge"
                    style={{
                      color: `var(--${accentColor})`,
                      background: `var(--${accentColor}-dim)`,
                    }}
                  >
                    {isNew ? "+ Nuevo" : "- Perdido"}
                  </div>
                  <div className="feed-time">
                    {fmtTime(isNew ? u.scraped_at : u.fecha_perdida)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

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

  const byDay = {};
  snap.forEach((r) => {
    const d = r.scraped_at?.slice(0, 10);
    if (d) byDay[d] = (byDay[d] || 0) + 1;
  });
  const bestDayEntry = Object.entries(byDay).sort((a, b) => b[1] - a[1])[0];

  return {
    totalFollowers: followers.length,
    newFollowers: snap.length,
    lostFollowers: lostF.length,
    bestDayStr: bestDayEntry ? fmt(bestDayEntry[0]) : "—",
    bestDayPeak: bestDayEntry ? bestDayEntry[1] : 0,
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
  const [isInstagram, setIsInstagram] = useState(true);

  useEffect(() => {
    Promise.all([statsAPI.igFollowers(), statsAPI.igLost()])
      .then(([f, l]) => {
        setFollowers(f);
        setLost(l);
      })
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
      label: "Mejor Día",
      value: kpi.bestDayStr,
      accent: "orange",
      icon: Star,
      sub: `Pico de +${kpi.bestDayPeak}`,
    },
  ];

  return (
    <div className="dash-page fade-in">
      <div className="dash-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 className="dash-title">Dashboard</h1>
            <div className="social-badge">
              {isInstagram ? <Instagram size={18} /> : <span>TikTok</span>}
              <span>{isInstagram ? "Instagram" : "TikTok"}</span>
            </div>
          </div>
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

          <div className="dash-content-grid">
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
              <ResponsiveContainer width="100%" height={340}>
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

            {/* EL MONITOR DIARIO ABAJO DEL GRAFICO */}
            <div style={{ marginTop: "24px" }}>
              <DailyMonitor followers={followers} lost={lost} />
            </div>
          </div>
        </>
      )}

      <style>{`
        .dash-page { padding: 32px 40px; width: 100%; max-width: 1400px; margin: 0 auto; }
        .dash-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
        .dash-title { font-family: var(--font-display); font-size: 28px; font-weight: 800; color: var(--text-primary); margin: 0; }
        .dash-subtitle { font-size: 14px; color: var(--text-secondary); margin-top: 6px; }
        .social-badge { display: flex; align-items: center; gap: 6px; background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); color: white; padding: 4px 12px; border-radius: var(--radius-full); font-size: 13px; font-weight: 600; font-family: var(--font-display); box-shadow: 0 2px 10px rgba(220, 39, 67, 0.2); }
        .dash-kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px;}
        .dash-state { padding: 80px 0; text-align: center; color: var(--text-secondary); font-size: 15px; font-weight: 500; }
        
        /* ESTILOS DEL FEED (Monitor Diario) */
        .daily-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border); flex-wrap: wrap; gap: 12px; }
        .daily-tabs { display: flex; gap: 8px; }
        .daily-tab { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border: none; background: var(--bg-card); color: var(--text-secondary); font-size: 13.5px; font-weight: 700; cursor: pointer; border-radius: var(--radius-full); transition: all 0.2s; box-shadow: var(--shadow-sm); }
        .daily-tab:hover { transform: translateY(-1px); box-shadow: var(--shadow-md); }
        .daily-tab.active-teal { background: var(--accent-teal); color: white; }
        .daily-tab.active-pink { background: var(--accent-pink); color: white; }
        .daily-badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 800; }
        .daily-badge.teal { background: rgba(255,255,255,0.2); color: white; }
        .daily-badge.pink { background: rgba(255,255,255,0.2); color: white; }
        .feed-list { display: flex; flex-direction: column; gap: 12px; }
        .feed-item { display: flex; align-items: center; gap: 16px; background: var(--bg-card); padding: 16px 20px; border-radius: var(--radius-lg); box-shadow: var(--shadow-sm); transition: transform 0.15s, box-shadow 0.15s; }
        .feed-item:hover { transform: translateX(4px); box-shadow: var(--shadow-md); }
        .feed-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .feed-name { font-size: 14.5px; font-weight: 700; color: var(--text-primary); }
        .feed-user { font-size: 12.5px; color: var(--text-secondary); font-family: monospace; letter-spacing: 0.5px; }
        .feed-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
        .feed-badge { font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: var(--radius-full); text-transform: uppercase; letter-spacing: 0.5px; }
        .feed-time { font-size: 12px; color: var(--text-muted); font-family: monospace; font-weight: 600; }
        .hist-empty { padding: 60px !important; text-align: center; color: var(--text-muted); font-size: 14px; font-weight: 500; display: flex; flex-direction: column; align-items: center; justify-content: center; }

        @media (max-width: 1024px) { .dash-kpi-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) { .dash-kpi-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
