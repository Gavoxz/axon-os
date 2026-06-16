import React from 'react'

const styles = `
.metric-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  overflow: hidden;
  transition: border-color var(--transition-fast), transform var(--transition-fast);
}

.metric-card:hover {
  border-color: var(--border-main);
  transform: translateY(-2px);
}

.metric-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.metric-card-icon {
  color: var(--text-muted);
}

.metric-card-value {
  font-family: var(--font-heading);
  font-size: 2.2rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.1;
  color: var(--text-primary);
}

.metric-card-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.metric-trend {
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 2px;
}

.metric-trend::before {
  content: '↑';
  font-weight: bold;
}

.metric-trend.negative::before {
  content: '↓';
}
`

export default function MetricCard({ label, value, subtext, icon: Icon, trend, isNegative }) {
  return (
    <>
      <style>{styles}</style>
      <div className="metric-card">
        <div className="metric-card-header">
          <span>{label}</span>
          {Icon && <Icon className="metric-card-icon" size={16} strokeWidth={2} />}
        </div>
        <div className="metric-card-value">
          {value}
        </div>
        {(subtext || trend) && (
          <div className="metric-card-footer">
            {trend && (
              <span className={`metric-trend ${isNegative ? 'negative' : ''}`}>
                {trend}
              </span>
            )}
            <span>{subtext}</span>
          </div>
        )}
      </div>
    </>
  );
}
