import { useState, useEffect } from "react";
import { format, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { UserPlus, UserMinus, Search } from "lucide-react";
import { DateRangePicker, Card } from "../components/ui/index.jsx";
import { statsAPI } from "../services/api.js";

const fmtDate = (d) =>
  d ? format(new Date(d), "dd MMM yyyy", { locale: es }) : "—";
const fmtTime = (d) => (d ? format(new Date(d), "HH:mm") : "—");

export default function Historial() {
  const [start, setStart] = useState(
    format(subDays(new Date(), 30), "yyyy-MM-dd"),
  );
  const [end, setEnd] = useState(format(new Date(), "yyyy-MM-dd"));
  const [followers, setFollowers] = useState([]);
  const [lost, setLost] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros de texto individuales
  const [searchNuevos, setSearchNuevos] = useState("");
  const [searchPerdidos, setSearchPerdidos] = useState("");

  useEffect(() => {
    Promise.all([statsAPI.igFollowers(), statsAPI.igLost()])
      .then(([f, l]) => {
        setFollowers(f);
        setLost(l);
      })
      .finally(() => setLoading(false));
  }, []);

  // Lógica de doble filtro: Rango de fechas + Buscador de texto
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
          <h1 className="hist-title">Historial Detallado</h1>
          <p className="hist-subtitle">
            Base de datos de movimientos de audiencia
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
          {/* TABLA: NUEVOS SEGUIDORES */}
          <Card
            style={{
              padding: "0",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              className="hist-table-header"
              style={{ borderBottom: "3px solid var(--accent-teal)" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <UserPlus size={18} color="var(--accent-teal)" />
                <span style={{ fontWeight: 700, fontSize: 16 }}>
                  Nuevos ({filteredNuevos.length})
                </span>
              </div>
              <div className="hist-search-box">
                <Search size={14} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Buscar usuario..."
                  value={searchNuevos}
                  onChange={(e) => setSearchNuevos(e.target.value)}
                />
              </div>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Nombre</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNuevos.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="hist-empty">
                        No se encontraron registros
                      </td>
                    </tr>
                  ) : (
                    filteredNuevos.map((u, i) => (
                      <tr key={i}>
                        <td
                          className="font-code"
                          style={{
                            color: "var(--accent-teal)",
                            fontWeight: 600,
                          }}
                        >
                          @{u.username}
                        </td>
                        <td>{u.full_name || "—"}</td>
                        <td>{fmtDate(u.scraped_at)}</td>
                        <td className="font-code">{fmtTime(u.scraped_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* TABLA: PERDIDOS */}
          <Card
            style={{
              padding: "0",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              className="hist-table-header"
              style={{ borderBottom: "3px solid var(--accent-pink)" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <UserMinus size={18} color="var(--accent-pink)" />
                <span style={{ fontWeight: 700, fontSize: 16 }}>
                  Perdidos ({filteredPerdidos.length})
                </span>
              </div>
              <div className="hist-search-box">
                <Search size={14} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Buscar usuario..."
                  value={searchPerdidos}
                  onChange={(e) => setSearchPerdidos(e.target.value)}
                />
              </div>
            </div>
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Nombre</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPerdidos.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="hist-empty">
                        No se encontraron registros
                      </td>
                    </tr>
                  ) : (
                    filteredPerdidos.map((u, i) => (
                      <tr key={i}>
                        <td
                          className="font-code"
                          style={{
                            color: "var(--accent-pink)",
                            fontWeight: 600,
                          }}
                        >
                          @{u.username}
                        </td>
                        <td>{u.full_name || "—"}</td>
                        <td>{fmtDate(u.fecha_perdida)}</td>
                        <td className="font-code">
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
                .hist-page { padding: 32px 40px; width: 100%; max-width: 1500px; margin: 0 auto; }
                .hist-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; flex-wrap: wrap; gap: 16px; }
                .hist-title { font-family: var(--font-display); font-size: 28px; font-weight: 800; color: var(--text-primary); letter-spacing: -0.02em; }
                .hist-subtitle { font-size: 14px; color: var(--text-secondary); margin-top: 4px; }
                .hist-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: stretch; }
                
                .hist-table-header { padding: 18px 24px; display: flex; align-items: center; justify-content: space-between; background: var(--bg-card); flex-wrap: wrap; gap: 10px; }
                .hist-search-box { display: flex; align-items: center; gap: 8px; background: var(--bg-elevated); padding: 6px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); }
                .hist-search-box input { border: none; background: transparent; outline: none; color: var(--text-primary); font-size: 13px; width: 150px; }
                .hist-search-box input::placeholder { color: var(--text-muted); }
                
                .table-container { max-height: 600px; overflow-y: auto; background: var(--bg-card); }
                .data-table { width: 100%; border-collapse: collapse; text-align: left; }
                .data-table th { position: sticky; top: 0; background: var(--bg-elevated); padding: 12px 24px; font-size: 12px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--border); z-index: 10; }
                .data-table td { padding: 14px 24px; border-bottom: 1px solid var(--border-subtle); font-size: 13px; color: var(--text-primary); white-space: nowrap; }
                .data-table tbody tr:hover td { background: var(--bg-elevated); }
                .font-code { font-family: monospace; letter-spacing: 0.2px; }
                
                .hist-empty { padding: 60px !important; text-align: center; color: var(--text-muted); font-size: 14px; }
                .hist-state { text-align: center; padding: 80px; color: var(--text-muted); }
                
                @media (max-width: 1024px) { .hist-grid { grid-template-columns: 1fr; } }
            `}</style>
    </div>
  );
}
