import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { UserPlus, UserMinus, Search, Instagram, User } from "lucide-react";
import { DateRangePicker, Card } from "../components/ui/index.jsx";
import { statsAPI } from "../services/api.js";

const fmtDate = (d) =>
  d ? format(new Date(d), "dd MMM yyyy", { locale: es }) : "—";
const fmtTime = (d) => (d ? format(new Date(d), "HH:mm") : "—");

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

export default function Historial() {
  const [start, setStart] = useState(
    format(subDays(new Date(), 30), "yyyy-MM-dd"),
  );
  const [end, setEnd] = useState(format(new Date(), "yyyy-MM-dd"));
  const [followers, setFollowers] = useState([]);
  const [lost, setLost] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchNuevos, setSearchNuevos] = useState("");
  const [searchPerdidos, setSearchPerdidos] = useState("");
  const [isInstagram, setIsInstagram] = useState(true);

  useEffect(() => {
    Promise.all([statsAPI.igFollowers(), statsAPI.igLost()])
      .then(([f, l]) => {
        setFollowers(f);
        setLost(l);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredNuevos = followers
    .filter(
      (r) =>
        r.scraped_at?.slice(0, 10) >= start &&
        r.scraped_at?.slice(0, 10) <= end,
    )
    .filter(
      (r) =>
        (r.username || "").toLowerCase().includes(searchNuevos.toLowerCase()) ||
        (r.full_name || "").toLowerCase().includes(searchNuevos.toLowerCase()),
    );

  const filteredPerdidos = lost
    .filter(
      (r) =>
        r.fecha_perdida?.slice(0, 10) >= start &&
        r.fecha_perdida?.slice(0, 10) <= end,
    )
    .filter(
      (r) =>
        (r.username || "")
          .toLowerCase()
          .includes(searchPerdidos.toLowerCase()) ||
        (r.full_name || "")
          .toLowerCase()
          .includes(searchPerdidos.toLowerCase()),
    );

  return (
    <div className="hist-page fade-in">
      <div className="hist-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h1 className="hist-title">Historial Detallado</h1>
            <div className="social-badge">
              {isInstagram ? <Instagram size={18} /> : <span>TikTok</span>}
              <span>{isInstagram ? "Instagram" : "TikTok"}</span>
            </div>
          </div>
          <p className="hist-subtitle">
            Base de datos histórica de usuarios ganados y perdidos
          </p>
        </div>
        <DateRangePicker
          start={start}
          end={end}
          onChangeStart={setStart}
          onChangeEnd={setEnd}
        />
      </div>

      {loading ? (
        <div className="hist-state">Cargando tablas de datos...</div>
      ) : (
        <div className="hist-grid">
          {/* CARD: NUEVOS */}
          <Card
            style={{
              padding: "0",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="hist-table-header"
              style={{
                background: "var(--accent-teal-dim)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    background: "var(--accent-teal)",
                    padding: 6,
                    borderRadius: 8,
                    display: "flex",
                    color: "white",
                  }}
                >
                  <UserPlus size={18} />
                </div>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: 16,
                    color: "var(--accent-teal)",
                  }}
                >
                  Nuevos{" "}
                  <span style={{ opacity: 0.7, fontWeight: 500 }}>
                    ({filteredNuevos.length})
                  </span>
                </span>
              </div>
              <div
                className="hist-search-box"
                style={{ background: "var(--bg-card)" }}
              >
                <Search size={14} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchNuevos}
                  onChange={(e) => setSearchNuevos(e.target.value)}
                />
              </div>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: "50%" }}>Usuario</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNuevos.length === 0 ? (
                    <tr>
                      <td colSpan="3">
                        <div className="hist-empty">
                          <UserPlus
                            size={32}
                            color="var(--border)"
                            style={{ marginBottom: 12 }}
                          />
                          <br />
                          Sin registros encontrados
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredNuevos.map((u, i) => (
                      <tr key={i}>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                            }}
                          >
                            <Avatar str={u.username} color="accent-teal" />
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 600,
                                  color: "var(--text-primary)",
                                  fontSize: 14,
                                }}
                              >
                                {u.full_name || "—"}
                              </span>
                              <span
                                style={{
                                  color: "var(--text-secondary)",
                                  fontSize: 12,
                                  fontFamily: "monospace",
                                }}
                              >
                                @{u.username}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td
                          style={{
                            color: "var(--text-secondary)",
                            fontWeight: 500,
                          }}
                        >
                          {fmtDate(u.scraped_at)}
                        </td>
                        <td
                          className="font-code"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {fmtTime(u.scraped_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* CARD: PERDIDOS */}
          <Card
            style={{
              padding: "0",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              border: "1px solid var(--border)",
            }}
          >
            <div
              className="hist-table-header"
              style={{
                background: "var(--accent-pink-dim)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    background: "var(--accent-pink)",
                    padding: 6,
                    borderRadius: 8,
                    display: "flex",
                    color: "white",
                  }}
                >
                  <UserMinus size={18} />
                </div>
                <span
                  style={{
                    fontWeight: 800,
                    fontSize: 16,
                    color: "var(--accent-pink)",
                  }}
                >
                  Bajas{" "}
                  <span style={{ opacity: 0.7, fontWeight: 500 }}>
                    ({filteredPerdidos.length})
                  </span>
                </span>
              </div>
              <div
                className="hist-search-box"
                style={{ background: "var(--bg-card)" }}
              >
                <Search size={14} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchPerdidos}
                  onChange={(e) => setSearchPerdidos(e.target.value)}
                />
              </div>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: "50%" }}>Usuario</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPerdidos.length === 0 ? (
                    <tr>
                      <td colSpan="3">
                        <div className="hist-empty">
                          <UserMinus
                            size={32}
                            color="var(--border)"
                            style={{ marginBottom: 12 }}
                          />
                          <br />
                          Sin registros encontrados
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredPerdidos.map((u, i) => (
                      <tr key={i}>
                        <td>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 12,
                            }}
                          >
                            <Avatar str={u.username} color="accent-pink" />
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 600,
                                  color: "var(--text-primary)",
                                  fontSize: 14,
                                }}
                              >
                                {u.full_name || "—"}
                              </span>
                              <span
                                style={{
                                  color: "var(--text-secondary)",
                                  fontSize: 12,
                                  fontFamily: "monospace",
                                }}
                              >
                                @{u.username}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td
                          style={{
                            color: "var(--text-secondary)",
                            fontWeight: 500,
                          }}
                        >
                          {fmtDate(u.fecha_perdida)}
                        </td>
                        <td
                          className="font-code"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {fmtTime(u.fecha_perdida)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      <style>{`
        /* ESTILOS GENERALES */
        .hist-page { padding: 32px 40px; width: 100%; max-width: 1500px; margin: 0 auto; }
        .hist-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
        .hist-title { font-family: var(--font-display); font-size: 28px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; margin: 0; }
        .hist-subtitle { font-size: 14px; color: var(--text-secondary); margin-top: 4px; }
        .social-badge { display: flex; align-items: center; gap: 6px; background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); color: white; padding: 4px 12px; border-radius: var(--radius-full); font-size: 13px; font-weight: 600; font-family: var(--font-display); box-shadow: 0 2px 10px rgba(220, 39, 67, 0.2); }
        
        /* TABLAS HISTÓRICAS */
        .hist-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: stretch; }
        .hist-table-header { padding: 16px 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
        .hist-search-box { display: flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: var(--radius-md); border: 1px solid var(--border); box-shadow: inset 0 1px 2px rgba(0,0,0,0.05); }
        .hist-search-box input { border: none; background: transparent; outline: none; color: var(--text-primary); font-size: 13px; width: 140px; transition: width 0.2s; }
        .hist-search-box input:focus { width: 180px; }
        .hist-search-box input::placeholder { color: var(--text-muted); }
        
        .table-container { max-height: 600px; overflow-y: auto; background: var(--bg-card); } 
        .data-table { width: 100%; border-collapse: collapse; text-align: left; }
        .data-table th { position: sticky; top: 0; background: var(--bg-card); padding: 14px 24px; font-size: 11.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 1px solid var(--border); z-index: 10; backdrop-filter: blur(8px); }
        .data-table td { padding: 16px 24px; border-bottom: 1px solid var(--border-subtle); vertical-align: middle; }
        .data-table tbody tr { transition: background 0.15s; }
        .data-table tbody tr:hover { background: var(--bg-elevated); cursor: default; }
        .font-code { font-family: monospace; letter-spacing: 0.2px; }
        .hist-empty { padding: 60px !important; text-align: center; color: var(--text-muted); font-size: 14px; font-weight: 500; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .hist-state { text-align: center; padding: 80px; color: var(--text-muted); font-size: 15px; font-weight: 500; }
        
        @media (max-width: 1024px) { .hist-grid { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
