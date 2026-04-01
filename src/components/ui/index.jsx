import { Calendar, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function Card({ children, className = "", style }) {
    return (
        <div className={`sp-card ${className}`} style={style}>
            {children}
            <style>{`
        .sp-card {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-card);
          padding: 22px 24px;
        }
      `}</style>
        </div>
    );
}

export function StatCard({ label, value, sub, accent = "teal", icon: Icon }) {
    const colors = {
        orange: { color: "var(--accent-orange)", bg: "var(--accent-orange-dim)" },
        teal: { color: "var(--accent-teal)", bg: "var(--accent-teal-dim)" },
        pink: { color: "var(--accent-pink)", bg: "var(--accent-pink-dim)" },
        purple: { color: "var(--accent-purple)", bg: "var(--accent-purple-dim)" },
        red: { color: "#ef4444", bg: "rgba(239,68,68,0.10)" },
    };
    const c = colors[accent] || colors.teal;

    return (
        <div className="stat-card" style={{ "--ac": c.color, "--ab": c.bg }}>
            <div className="stat-header">
                <span className="stat-label">{label}</span>
                {Icon && (
                    <span className="stat-icon-wrap">
            <Icon size={15} />
          </span>
                )}
            </div>
            <div className="stat-value">{value}</div>
            {sub && <div className="stat-sub">{sub}</div>}

            <style>{`
        .stat-card {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-card);
          padding: 20px 22px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          transition: box-shadow 0.2s, transform 0.2s;
        }
        .stat-card:hover {
          box-shadow: var(--shadow-elevated);
          transform: translateY(-2px);
        }
        .stat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .stat-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: var(--text-secondary);
        }
        .stat-icon-wrap {
          width: 30px;
          height: 30px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--ab);
          color: var(--ac);
        }
        .stat-value {
          font-family: var(--font-display);
          font-size: 30px;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: var(--ac);
          margin-top: 4px;
        }
        .stat-sub {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 1px;
        }
      `}</style>
        </div>
    );
}

export function Badge({ children, color = "teal" }) {
    const map = {
        orange: { bg: "var(--accent-orange-dim)", text: "var(--accent-orange)" },
        teal: { bg: "var(--accent-teal-dim)", text: "var(--accent-teal)" },
        pink: { bg: "var(--accent-pink-dim)", text: "var(--accent-pink)" },
        purple: { bg: "var(--accent-purple-dim)", text: "var(--accent-purple)" },
    };
    const c = map[color] || map.teal;
    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "2px 9px",
                borderRadius: "20px",
                fontSize: "11px",
                fontWeight: 600,
                background: c.bg,
                color: c.text,
            }}
        >
      {children}
    </span>
    );
}

export function DateRangePicker({ start, end, onChangeStart, onChangeEnd }) {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef(null);

    // Cierra el menú si haces clic fuera de él
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Formatear la fecha para que se vea bonita en el botón (Ej: 12 mar 2026)
    const formatDate = (dateStr) => {
        if (!dateStr) return "...";
        // Se añade T12:00:00 para evitar desfases de zona horaria en el navegador
        return new Date(dateStr + "T12:00:00").toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    // Lógica para los botones de acceso rápido
    const setPreset = (days) => {
        const today = new Date();
        const past = new Date();
        past.setDate(past.getDate() - days);

        onChangeStart(past.toISOString().split("T")[0]);
        onChangeEnd(today.toISOString().split("T")[0]);
        setIsOpen(false);
    };

    return (
        <div className="drp-container" ref={popoverRef}>
            {/* EL BOTÓN PRINCIPAL */}
            <button className="drp-trigger" onClick={() => setIsOpen(!isOpen)}>
                <Calendar size={16} className="drp-icon" />
                <span className="drp-text">
          {formatDate(start)} – {formatDate(end)}
        </span>
                <ChevronDown
                    size={14}
                    className={`drp-chevron ${isOpen ? "open" : ""}`}
                />
            </button>

            {/* EL MENÚ DESPLEGABLE */}
            {isOpen && (
                <div className="drp-popover fade-in">
                    <div className="drp-presets">
                        <span className="drp-label">Filtros Rápidos</span>
                        <button onClick={() => setPreset(7)}>Últimos 7 días</button>
                        <button onClick={() => setPreset(15)}>Últimos 15 días</button>
                        <button onClick={() => setPreset(30)}>Últimos 30 días</button>
                        <button onClick={() => setPreset(90)}>Últimos 3 meses</button>
                    </div>

                    <div className="drp-custom">
                        <span className="drp-label">Rango Personalizado</span>
                        <div className="drp-inputs">
                            <div className="drp-input-group">
                                <label>Desde</label>
                                <input
                                    type="date"
                                    value={start}
                                    max={end}
                                    onChange={(e) => onChangeStart(e.target.value)}
                                />
                            </div>
                            <div className="drp-input-group">
                                <label>Hasta</label>
                                <input
                                    type="date"
                                    value={end}
                                    min={start}
                                    onChange={(e) => onChangeEnd(e.target.value)}
                                />
                            </div>
                        </div>
                        <button className="drp-apply" onClick={() => setIsOpen(false)}>
                            Aplicar Rango
                        </button>
                    </div>
                </div>
            )}

            {/* ESTILOS DEL COMPONENTE */}
            <style>{`
                .drp-container { position: relative; font-family: var(--font-body); z-index: 50; }
                
                .drp-trigger { display: flex; align-items: center; gap: 10px; background: var(--bg-card); border: 1px solid var(--border); padding: 10px 16px; border-radius: var(--radius-md); color: var(--text-primary); cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: var(--shadow-sm); outline: none; }
                .drp-trigger:hover { border-color: var(--accent-teal); box-shadow: 0 0 0 3px var(--accent-teal-dim); }
                .drp-text { font-size: 13px; font-weight: 600; letter-spacing: 0.2px; text-transform: capitalize; }
                .drp-icon { color: var(--accent-teal); }
                .drp-chevron { color: var(--text-muted); transition: transform 0.3s; }
                .drp-chevron.open { transform: rotate(180deg); color: var(--accent-teal); }

                .drp-popover { position: absolute; top: calc(100% + 8px); right: 0; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow-elevated); display: flex; overflow: hidden; min-width: 420px; transform-origin: top right; }
                
                .drp-presets { background: var(--bg-elevated); padding: 20px; display: flex; flex-direction: column; gap: 6px; border-right: 1px solid var(--border); min-width: 160px; }
                .drp-presets button { background: transparent; border: none; text-align: left; padding: 10px 14px; border-radius: var(--radius-sm); color: var(--text-secondary); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
                .drp-presets button:hover { background: var(--accent-teal-dim); color: var(--accent-teal); }

                .drp-custom { padding: 20px; flex: 1; display: flex; flex-direction: column; justify-content: space-between; }
                .drp-label { font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 16px; display: block; }
                
                .drp-inputs { display: flex; gap: 16px; margin-bottom: 24px; }
                .drp-input-group { flex: 1; display: flex; flex-direction: column; gap: 8px; }
                .drp-input-group label { font-size: 12px; font-weight: 600; color: var(--text-secondary); }
                .drp-input-group input { width: 100%; padding: 10px 12px; border-radius: var(--radius-sm); border: 1px solid var(--border); background: var(--bg-base); color: var(--text-primary); font-size: 13px; font-family: inherit; outline: none; transition: border 0.2s; color-scheme: inherit; }
                .drp-input-group input:focus { border-color: var(--accent-teal); }

                .drp-apply { width: 100%; background: var(--accent-teal); color: white; border: none; padding: 12px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 700; cursor: pointer; transition: background 0.2s; }
                .drp-apply:hover { background: #00d4aa; }

                @media (max-width: 600px) {
                    .drp-popover { flex-direction: column; min-width: 280px; right: auto; left: 0; transform-origin: top left; }
                    .drp-presets { border-right: none; border-bottom: 1px solid var(--border); flex-direction: row; flex-wrap: wrap; }
                    .drp-presets button { flex: 1 1 40%; text-align: center; }
                }
            `}</style>
        </div>
    );
}

function CalIcon() {
    return (
        <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    );
}
