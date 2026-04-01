import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../components/switcher/theme/useTheme.js";
import { authAPI } from "../services/api.js";

export default function Login() {
    const navigate = useNavigate();
    const { theme, toggle } = useTheme();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        if (!email || !password) {
            setError("Completa todos los campos.");
            return;
        }
        setLoading(true);
        try {
            const data = await authAPI.login(email, password);
            localStorage.setItem("sp_token", data.access_token);
            localStorage.setItem("sp_auth", "true");
            navigate("/");
        } catch (err) {
            setError(err.message || "Credenciales incorrectas.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-root">
            <header className="login-header">
                <div className="login-brand">
                    <div className="login-brand-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path
                                d="M22 12h-4l-3 9L9 3l-3 9H2"
                                stroke="var(--accent-teal)"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                    <span className="login-brand-name">Devdatep Consulting</span>
                </div>
                <button className="theme-btn" title="Cambiar tema" onClick={toggle}>
                    {theme === "dark" ? (
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
                            <circle cx="12" cy="12" r="5" />
                            <line x1="12" y1="1" x2="12" y2="3" />
                            <line x1="12" y1="21" x2="12" y2="23" />
                            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                            <line x1="1" y1="12" x2="3" y2="12" />
                            <line x1="21" y1="12" x2="23" y2="12" />
                            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                        </svg>
                    ) : (
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
                            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                        </svg>
                    )}
                </button>
            </header>

            <main className="login-main">
                <img
                    src="/logo_devdatep.jpg"
                    alt="Devdatep Logo"
                    style={{
                        width: "80px",
                        height: "auto",
                        marginBottom: "20px",
                        borderRadius: "8px",
                    }}
                    onError={(e) => {
                        e.target.style.display = "none";
                        e.target.insertAdjacentHTML(
                            "afterend",
                            '<div style="width:56px;height:56px;background:var(--bg-elevated);border-radius:16px;margin-bottom:20px;border:1px solid var(--border);"></div>',
                        );
                    }}
                />

                <h1 className="login-title">Bienvenido de Nuevo</h1>
                <p className="login-subtitle">
                    Inicia sesión y obtén tus métricas cuando quieras
                </p>

                <div className="login-card">
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="field-group">
                            <label className="field-label">Correo</label>
                            <input
                                className={`field-input ${error ? "has-error" : ""}`}
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError("");
                                }}
                                placeholder="tu@email.com"
                                autoComplete="email"
                            />
                        </div>

                        <div className="field-group" style={{ marginTop: 14 }}>
                            <div className="field-label-row">
                                <label className="field-label">Contraseña</label>
                            </div>
                            <div className="pass-wrapper">
                                <input
                                    className={`field-input ${error ? "has-error" : ""}`}
                                    type={showPass ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setError("");
                                    }}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className="pass-toggle"
                                    onClick={() => setShowPass((v) => !v)}
                                    tabIndex={-1}
                                >
                                    {showPass ? (
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
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
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
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {error && <div className="login-error">{error}</div>}

                        <button
                            type="submit"
                            className="signin-btn"
                            disabled={loading}
                            style={{ marginTop: error ? 14 : 20 }}
                        >
                            {loading ? <span className="spinner" /> : "Iniciar Sesión"}
                        </button>
                    </form>
                </div>
            </main>

            <footer className="login-footer">© 2026 Devdatep Consulting.</footer>

            <style>{`
        .login-root { min-height: 100vh; width: 100%; display: flex; flex-direction: column; background: var(--bg-base); transition: background 0.2s; }
        .login-header { display: flex; align-items: center; justify-content: space-between; padding: 0 28px; height: 52px; border-bottom: 1px solid var(--border); }
        .login-brand { display: flex; align-items: center; gap: 9px; }
        .login-brand-icon { width: 28px; height: 28px; background: var(--accent-teal-dim); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; }
        .login-brand-name { font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.01em; }
        .theme-btn { width: 32px; height: 32px; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: var(--text-secondary); transition: color 0.15s, border-color 0.15s, background 0.2s; cursor: pointer; }
        .theme-btn:hover { color: var(--text-primary); border-color: var(--text-muted); }
        .login-main { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 16px; }
        .login-title { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; margin-bottom: 6px; }
        .login-subtitle { font-size: 13px; color: var(--text-secondary); margin-bottom: 28px; }
        .login-card { width: 100%; max-width: 400px; background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-xl); padding: 28px 28px 24px; margin-bottom: 14px; transition: background 0.2s, border-color 0.2s; }
        .field-group { display: flex; flex-direction: column; gap: 6px; }
        .field-label-row { display: flex; align-items: center; justify-content: space-between; }
        .field-label { font-size: 12.5px; font-weight: 500; color: var(--text-secondary); }
        .field-input { width: 100%; background: var(--bg-elevated); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 10px 14px; font-size: 14px; color: var(--text-primary); outline: none; transition: border-color 0.15s, box-shadow 0.15s, background 0.2s; font-family: var(--font-body); }
        .field-input::placeholder { color: var(--text-muted); }
        .field-input:focus { border-color: var(--accent-teal); box-shadow: 0 0 0 3px var(--accent-teal-dim); }
        .field-input.has-error { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,0.12); }
        .pass-wrapper { position: relative; }
        .pass-wrapper .field-input { padding-right: 40px; }
        .pass-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-muted); display: flex; align-items: center; justify-content: center; transition: color 0.15s; padding: 0; }
        .pass-toggle:hover { color: var(--text-secondary); }
        .login-error { margin-top: 12px; padding: 9px 12px; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); border-radius: var(--radius-md); font-size: 12.5px; color: #f87171; }
        .signin-btn { width: 100%; padding: 11px; background: var(--bg-sidebar); color: var(--text-sidebar-active); border: none; border-radius: var(--radius-md); font-size: 14px; font-weight: 600; font-family: var(--font-display); cursor: pointer; transition: opacity 0.15s, transform 0.15s, background 0.2s; display: flex; align-items: center; justify-content: center; min-height: 42px; }
        .signin-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .signin-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.25); border-top-color: white; border-radius: 50%; animation: spin 0.6s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .login-footer { text-align: center; padding: 16px; font-size: 12px; color: var(--text-muted); border-top: 1px solid var(--border); }
      `}</style>
        </div>
    );
}
