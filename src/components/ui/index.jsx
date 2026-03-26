export function Card({ children, className = '', style }) {
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
    )
}

export function StatCard({ label, value, sub, accent = 'teal', icon: Icon }) {
    const colors = {
        orange: { color: 'var(--accent-orange)', bg: 'var(--accent-orange-dim)' },
        teal:   { color: 'var(--accent-teal)',   bg: 'var(--accent-teal-dim)'   },
        pink:   { color: 'var(--accent-pink)',   bg: 'var(--accent-pink-dim)'   },
        purple: { color: 'var(--accent-purple)', bg: 'var(--accent-purple-dim)' },
        red:    { color: '#ef4444',              bg: 'rgba(239,68,68,0.10)'     },
    }
    const c = colors[accent] || colors.teal

    return (
        <div className="stat-card" style={{ '--ac': c.color, '--ab': c.bg }}>
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
    )
}

export function Badge({ children, color = 'teal' }) {
    const map = {
        orange: { bg: 'var(--accent-orange-dim)', text: 'var(--accent-orange)' },
        teal:   { bg: 'var(--accent-teal-dim)',   text: 'var(--accent-teal)'   },
        pink:   { bg: 'var(--accent-pink-dim)',   text: 'var(--accent-pink)'   },
        purple: { bg: 'var(--accent-purple-dim)', text: 'var(--accent-purple)' },
    }
    const c = map[color] || map.teal
    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center',
            padding: '2px 9px', borderRadius: '20px',
            fontSize: '11px', fontWeight: 600,
            background: c.bg, color: c.text,
        }}>
      {children}
    </span>
    )
}

export function DateRangePicker({ start, end, onChangeStart, onChangeEnd }) {
    return (
        <div className="drp-wrapper">
            <div className="drp-group">
                <CalIcon />
                <label>Desde</label>
                <input type="date" value={start} onChange={e => onChangeStart(e.target.value)} />
            </div>
            <span className="drp-sep">—</span>
            <div className="drp-group">
                <CalIcon />
                <label>Hasta</label>
                <input type="date" value={end} onChange={e => onChangeEnd(e.target.value)} />
            </div>
            <style>{`
        .drp-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-card);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-card);
          padding: 8px 16px;
        }
        .drp-group {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-secondary);
        }
        .drp-group label { font-size: 12px; color: var(--text-muted); }
        .drp-group input[type="date"] {
          background: transparent;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-size: 13px;
          cursor: pointer;
          font-family: var(--font-body);
        }
        .drp-sep { color: var(--text-muted); font-size: 13px; }
      `}</style>
        </div>
    )
}

function CalIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
    )
}