import { useState, useEffect } from "react";
import { settingsAPI, scraperAPI } from "../services/api.js";

const API = "http://localhost:8000";
const getToken = () => localStorage.getItem("sp_token");
const authFetch = (path, opts = {}) =>
  fetch(`${API}${path}`, {
    ...opts,
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });

const SECTIONS = [
  {
    id: "general",
    label: "General",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    id: "accounts",
    label: "Cuentas conectadas",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
  {
    id: "sync",
    label: "Sync automático",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
      </svg>
    ),
  },
];

function Toggle({ checked, onChange }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        border: "none",
        cursor: "pointer",
        background: checked ? "var(--accent-teal)" : "var(--border)",
        position: "relative",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 23 : 3,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: "white",
          transition: "left 0.2s",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }}
      />
    </button>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="set-section-header">
      <h2 className="set-section-title">{title}</h2>
      {subtitle && <p className="set-section-sub">{subtitle}</p>}
    </div>
  );
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
  );
}

// ---------- General ----------
function GeneralSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setEmail(payload.sub || "");
    } catch {}
  }, []);

  const flash = (ok, text) => {
    setMsg({ ok, text });
    setTimeout(() => setMsg(null), 3000);
  };

  async function saveName() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await settingsAPI.updateProfile(name);
      flash(true, "Nombre actualizado.");
    } catch (e) {
      flash(false, e.message);
    } finally {
      setLoading(false);
    }
  }

  async function savePassword() {
    if (!currentPass || !newPass) return;
    setLoading(true);
    try {
      await settingsAPI.changePassword(currentPass, newPass);
      flash(true, "Contraseña actualizada.");
      setCurrentPass("");
      setNewPass("");
    } catch (e) {
      flash(false, e.message);
    } finally {
      setLoading(false);
    }
  }

  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : email.slice(0, 2).toUpperCase();

  return (
    <div className="set-panel fade-in">
      <SectionHeader
        title="General"
        subtitle="Administra tu información personal y datos de cuenta."
      />
      <div className="set-card">
        <div className="set-avatar-row">
          <div className="set-avatar">{initials}</div>
          <div>
            <div className="set-avatar-name">{name || email}</div>
            <div className="set-avatar-email">{email}</div>
            <span className="set-badge-active">Cuenta activa</span>
          </div>
        </div>
      </div>
      <div className="set-card">
        <FieldRow label="Nombre completo" hint="Se muestra en la plataforma.">
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="set-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
            />
            <button
              className="set-btn-primary"
              onClick={saveName}
              disabled={loading}
            >
              Guardar
            </button>
          </div>
        </FieldRow>
        <div className="set-divider" />
        <FieldRow label="Correo electrónico" hint="No editable.">
          <input
            className="set-input"
            value={email}
            disabled
            style={{ opacity: 0.6 }}
          />
        </FieldRow>
      </div>
      <div className="set-card">
        <FieldRow label="Contraseña actual" hint="">
          <input
            className="set-input"
            type="password"
            value={currentPass}
            onChange={(e) => setCurrentPass(e.target.value)}
            placeholder="••••••••"
          />
        </FieldRow>
        <div className="set-divider" />
        <FieldRow label="Nueva contraseña" hint="">
          <input
            className="set-input"
            type="password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            placeholder="••••••••"
          />
        </FieldRow>
      </div>
      <div className="set-footer-row">
        {msg ? (
          <span
            style={{
              fontSize: 12,
              color: msg.ok ? "var(--accent-teal)" : "#f87171",
            }}
          >
            {msg.text}
          </span>
        ) : (
          <span />
        )}
        <button
          className="set-btn-primary"
          onClick={savePassword}
          disabled={loading || !currentPass || !newPass}
        >
          Cambiar contraseña
        </button>
      </div>
    </div>
  );
}

// ---------- Cuentas conectadas ----------
const PLATFORM_META = {
  instagram: {
    label: "Instagram",
    color: "#f72585",
    dim: "rgba(247,37,133,0.1)",
    icon: (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
};

function ConnectModal({ platform, onClose, onSave }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const meta = PLATFORM_META[platform];

  async function handleSave() {
    if (!username.trim() || !password) {
      setError("Ingresa username y contraseña.");
      return;
    }
    setLoading(true);
    try {
      if (platform === "instagram")
        await settingsAPI.connectInstagram(username.trim(), password);
      onSave(username.trim());
      onClose();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: meta.dim,
                color: meta.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {meta.icon}
            </div>
            <span style={{ fontWeight: 600, fontSize: 15 }}>
              Conectar {meta.label}
            </span>
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <p
          style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            marginBottom: 16,
          }}
        >
          Ingresa las credenciales de la cuenta que quieres rastrear. Se
          encriptarán de forma segura.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              Username (sin @)
            </label>
            <input
              className="set-input"
              style={{ width: "100%", marginTop: 4 }}
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              placeholder="mi_cuenta"
              autoFocus
            />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "var(--text-secondary)" }}>
              Contraseña
            </label>
            <input
              className="set-input"
              type="password"
              style={{ width: "100%", marginTop: 4 }}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="••••••••"
            />
          </div>
          {error && (
            <span style={{ fontSize: 12, color: "#f87171" }}>{error}</span>
          )}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 20,
          }}
        >
          <button className="set-btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="set-btn-primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AccountsSection() {
  const [igUsername, setIgUsername] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [syncStatus, setSyncStatus] = useState("idle");
  const [syncMsg, setSyncMsg] = useState(null);

  useEffect(() => {
    authFetch("/auth/me")
      .then((r) => r.json())
      .then((user) => {
        if (user.ig_username) setIgUsername(user.ig_username);
      })
      .catch(() => {});
  }, []);

  async function handleDisconnect() {
    try {
      await settingsAPI.disconnectInstagram();
      setIgUsername(null);
    } catch (e) {
      setSyncMsg(`Error: ${e.message}`);
    }
  }

  async function handleSetup() {
    setSyncMsg("Abriendo navegador para setup de sesión...");
    try {
      await scraperAPI.setupInstagram();
      setSyncMsg("Setup completado.");
    } catch (e) {
      setSyncMsg(`Error: ${e.message}`);
    }
    setTimeout(() => setSyncMsg(null), 5000);
  }

  async function handleSync() {
    setSyncStatus("running");
    setSyncMsg("Scraping iniciado, puede tardar varios minutos...");
    try {
      const res = await scraperAPI.runInstagram();
      setSyncMsg(`Tarea iniciada. ID: ${res.task_id}`);
      const poll = setInterval(async () => {
        try {
          const status = await scraperAPI.statusInstagram();
          if (status.status === "SUCCESS") {
            setSyncMsg(`Completado: ${status.result}`);
            setSyncStatus("idle");
            clearInterval(poll);
          } else if (status.status === "FAILURE") {
            setSyncMsg(`Error: ${status.result}`);
            setSyncStatus("idle");
            clearInterval(poll);
          }
        } catch {}
      }, 5000);
    } catch (e) {
      setSyncMsg(`Error: ${e.message}`);
      setSyncStatus("idle");
    }
  }

  return (
    <div className="set-panel fade-in">
      <SectionHeader
        title="Cuentas conectadas"
        subtitle="Administra las cuentas de redes sociales que rastrea SocialPulse."
      />
      {syncMsg && <div className="set-msg-banner">{syncMsg}</div>}
      <div className="set-card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="set-account-card">
          <div className="set-account-left">
            <div
              className="set-account-icon"
              style={{
                background: PLATFORM_META.instagram.dim,
                color: PLATFORM_META.instagram.color,
              }}
            >
              {PLATFORM_META.instagram.icon}
            </div>
            <div>
              <div className="set-account-name">Instagram</div>
              {igUsername ? (
                <div className="set-account-detail">@{igUsername}</div>
              ) : (
                <div
                  className="set-account-detail"
                  style={{ color: "var(--text-muted)" }}
                >
                  No conectado
                </div>
              )}
            </div>
          </div>
          <div className="set-account-right">
            {igUsername && <span className="set-dot-active" />}
            {igUsername ? (
              <>
                <button className="set-btn-ghost" onClick={handleSetup}>
                  Setup sesión
                </button>
                <button
                  className="set-btn-ghost"
                  onClick={handleSync}
                  disabled={syncStatus === "running"}
                >
                  {syncStatus === "running" ? "Scraping..." : "Sync ahora"}
                </button>
                <button className="set-btn-danger" onClick={handleDisconnect}>
                  Desconectar
                </button>
              </>
            ) : (
              <button
                className="set-btn-primary"
                onClick={() => setShowModal(true)}
              >
                + Conectar
              </button>
            )}
          </div>
        </div>
      </div>
      {showModal && (
        <ConnectModal
          platform="instagram"
          onClose={() => setShowModal(false)}
          onSave={(u) => setIgUsername(u)}
        />
      )}
    </div>
  );
}

// ---------- Sync automático ----------
function SyncSection() {
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    authFetch("/sync/config")
      .then((r) => r.json())
      .then((data) => {
        setHour(data.sync_hour);
        setMinute(data.sync_minute);
      })
      .catch(() => {});
  }, []);

  async function save() {
    setLoading(true);
    try {
      await authFetch("/sync/config", {
        method: "PUT",
        body: JSON.stringify({ sync_hour: hour, sync_minute: minute }),
      });
      setMsg({ ok: true, text: "Horario guardado correctamente." });
    } catch (e) {
      setMsg({ ok: false, text: e.message });
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(null), 3000);
    }
  }

  const pad = (n) => String(n).padStart(2, "0");
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="set-panel fade-in">
      <SectionHeader
        title="Sync automático"
        subtitle="Configura a qué hora se ejecuta el scraping diario automáticamente."
      />

      <div className="set-card">
        <FieldRow
          label="Hora del sync diario"
          hint="El sistema ejecutará el scraping de Instagram todos los días a esta hora (hora de Lima, Perú)."
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <select
              className="set-input"
              style={{ width: 90 }}
              value={hour}
              onChange={(e) => setHour(Number(e.target.value))}
            >
              {hours.map((h) => (
                <option key={h} value={h}>
                  {pad(h)}:00
                </option>
              ))}
            </select>
            <span style={{ color: "var(--text-muted)", fontSize: 13 }}>:</span>
            <select
              className="set-input"
              style={{ width: 80 }}
              value={minute}
              onChange={(e) => setMinute(Number(e.target.value))}
            >
              {[0, 15, 30, 45].map((m) => (
                <option key={m} value={m}>
                  {pad(m)}
                </option>
              ))}
            </select>
          </div>
        </FieldRow>

        <div className="set-divider" />

        <div className="sync-preview">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          El próximo sync se ejecutará a las{" "}
          <strong>
            {pad(hour)}:{pad(minute)}
          </strong>{" "}
          hora de Lima.
        </div>
      </div>

      <div className="set-footer-row">
        {msg ? (
          <span
            style={{
              fontSize: 12,
              color: msg.ok ? "var(--accent-teal)" : "#f87171",
            }}
          >
            {msg.text}
          </span>
        ) : (
          <span />
        )}
        <button className="set-btn-primary" onClick={save} disabled={loading}>
          {loading ? "Guardando..." : "Guardar horario"}
        </button>
      </div>
    </div>
  );
}

// ---------- Root ----------
export default function Settings() {
  const [active, setActive] = useState("general");

  const panels = {
    general: <GeneralSection />,
    accounts: <AccountsSection />,
    sync: <SyncSection />,
  };

  return (
    <div className="set-root fade-in">
      <div className="set-page-header">
        <h1 className="set-page-title">Settings</h1>
        <p className="set-page-sub">
          Administra tu cuenta, plataformas conectadas y preferencias.
        </p>
      </div>

      <div className="set-layout">
        <aside className="set-sidebar">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              className={`set-nav-item ${active === s.id ? "active" : ""}`}
              onClick={() => setActive(s.id)}
            >
              {s.icon}
              {s.label}
            </button>
          ))}
        </aside>
        <div className="set-content">{panels[active]}</div>
      </div>

      <style>{`
        .set-root { width: 100%; max-width: 1100px; padding: 28px 32px 48px; box-sizing: border-box; }
        .set-page-header { margin-bottom: 28px; }
        .set-page-title { font-family: var(--font-display); font-size: 24px; font-weight: 800; letter-spacing: -0.02em; color: var(--text-primary); }
        .set-page-sub { font-size: 13px; color: var(--text-secondary); margin-top: 4px; }
        .set-layout { display: flex; gap: 24px; align-items: flex-start; }
        .set-sidebar { width: 200px; flex-shrink: 0; display: flex; flex-direction: column; gap: 2px; background: var(--bg-card); border-radius: var(--radius-lg); box-shadow: var(--shadow-card); padding: 8px; }
        .set-nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: var(--radius-md); border: none; background: transparent; color: var(--text-secondary); font-size: 13px; font-weight: 500; font-family: var(--font-body); cursor: pointer; text-align: left; transition: background 0.15s, color 0.15s; width: 100%; }
        .set-nav-item:hover { background: var(--bg-elevated); color: var(--text-primary); }
        .set-nav-item.active { background: var(--bg-elevated); color: var(--text-primary); font-weight: 600; }
        .set-content { flex: 1; min-width: 0; }
        .set-panel { display: flex; flex-direction: column; gap: 14px; }
        .set-section-header { margin-bottom: 4px; }
        .set-section-title { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--text-primary); }
        .set-section-sub { font-size: 12.5px; color: var(--text-secondary); margin-top: 3px; }
        .set-card { background: var(--bg-card); border-radius: var(--radius-lg); box-shadow: var(--shadow-card); padding: 20px 22px; }
        .set-divider { height: 1px; background: var(--border); margin: 14px 0; }
        .set-field-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .set-field-meta { flex: 1; min-width: 0; }
        .set-field-label { font-size: 13px; font-weight: 500; color: var(--text-primary); }
        .set-field-hint { font-size: 12px; color: var(--text-secondary); margin-top: 2px; display: block; }
        .set-field-control { flex-shrink: 0; }
        .set-input { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 8px 12px; font-size: 13px; color: var(--text-primary); font-family: var(--font-body); outline: none; width: 220px; transition: border-color 0.15s, box-shadow 0.15s; }
        .set-input:focus { border-color: var(--accent-teal); box-shadow: 0 0 0 3px var(--accent-teal-dim); }
        .set-avatar-row { display: flex; align-items: center; gap: 14px; }
        .set-avatar { width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-orange), var(--accent-teal)); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 15px; font-weight: 700; color: white; flex-shrink: 0; }
        .set-avatar-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
        .set-avatar-email { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
        .set-badge-active { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 500; color: var(--accent-teal); background: var(--accent-teal-dim); padding: 2px 8px; border-radius: 20px; margin-top: 5px; }
        .set-badge-active::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: var(--accent-teal); display: inline-block; }
        .set-footer-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .set-btn-primary { background: var(--bg-sidebar); color: var(--text-sidebar-active); border: none; border-radius: var(--radius-md); padding: 8px 18px; font-size: 13px; font-weight: 600; font-family: var(--font-body); cursor: pointer; transition: opacity 0.15s; white-space: nowrap; }
        .set-btn-primary:hover:not(:disabled) { opacity: 0.85; }
        .set-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .set-btn-ghost { background: var(--bg-elevated); color: var(--text-primary); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 7px 14px; font-size: 12px; font-weight: 500; font-family: var(--font-body); cursor: pointer; transition: border-color 0.15s; white-space: nowrap; }
        .set-btn-ghost:hover:not(:disabled) { border-color: var(--accent-teal); }
        .set-btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }
        .set-btn-danger { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); border-radius: var(--radius-md); padding: 7px 14px; font-size: 12px; font-weight: 500; font-family: var(--font-body); cursor: pointer; transition: background 0.15s; white-space: nowrap; }
        .set-btn-danger:hover { background: rgba(239,68,68,0.18); }
        .set-account-card { display: flex; align-items: center; justify-content: space-between; padding: 18px 22px; gap: 16px; flex-wrap: wrap; }
        .set-account-left { display: flex; align-items: center; gap: 14px; }
        .set-account-icon { width: 40px; height: 40px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .set-account-name { font-size: 14px; font-weight: 600; color: var(--text-primary); }
        .set-account-detail { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
        .set-account-right { display: flex; align-items: center; gap: 8px; }
        .set-dot-active { width: 7px; height: 7px; border-radius: 50%; background: var(--accent-teal); box-shadow: 0 0 6px var(--accent-teal); }
        .set-msg-banner { background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 10px 14px; font-size: 13px; color: var(--text-secondary); }
        .sync-preview { display: flex; align-items: center; gap: 7px; font-size: 12px; color: var(--text-secondary); }
        .sync-preview strong { color: var(--text-primary); }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 500; }
        .modal-box { background: var(--bg-card); border-radius: var(--radius-xl); padding: 28px; width: 100%; max-width: 420px; box-shadow: var(--shadow-elevated); }
        .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .modal-close { background: none; border: none; font-size: 16px; color: var(--text-muted); cursor: pointer; padding: 4px; }
        .modal-close:hover { color: var(--text-primary); }
        @media (max-width: 800px) { .set-root { padding: 16px; } .set-layout { flex-direction: column; } .set-sidebar { width: 100%; flex-direction: row; flex-wrap: wrap; } .set-nav-item { width: auto; flex: 1; justify-content: center; } .set-input { width: 160px; } .set-field-row { flex-direction: column; align-items: flex-start; gap: 8px; } .set-field-control { width: 100%; } .set-input { width: 100%; } }
      `}</style>
    </div>
  );
}
