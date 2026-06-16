import React, { useState } from 'react'

const styles = `
.chart-card {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
  width: 100%;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-title {
  font-family: var(--font-heading);
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-primary);
}

.chart-subtitle {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.chart-content {
  position: relative;
  width: 100%;
  height: 200px;
}

.chart-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.chart-tooltip {
  position: absolute;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-main);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  font-size: 0.75rem;
  pointer-events: none;
  opacity: 0;
  transition: opacity var(--transition-fast), transform var(--transition-fast);
  z-index: 10;
  box-shadow: var(--shadow-md);
  transform: translate(-50%, -100%) translateY(-10px);
}

.chart-tooltip.visible {
  opacity: 1;
}

.chart-tooltip-label {
  color: var(--text-secondary);
  margin-bottom: 2px;
}

.chart-tooltip-value {
  font-weight: 700;
  color: var(--text-primary);
}

/* SVG Line Animations */
.chart-path {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: drawLine 2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes drawLine {
  to { stroke-dashoffset: 0; }
}

.chart-area {
  opacity: 0;
  animation: fadeInArea 1s ease-out 0.5s forwards;
}

@keyframes fadeInArea {
  to { opacity: 0.08; }
}

.chart-bar-rect {
  transition: fill var(--transition-fast);
}

.chart-bar-rect:hover {
  fill: #ffffff !important;
}

/* Funnel Styles */
.funnel-stage {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.funnel-stage:last-child {
  margin-bottom: 0;
}

.funnel-label {
  width: 110px;
  font-size: 0.85rem;
  color: var(--text-secondary);
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.funnel-bar-container {
  flex: 1;
  height: 24px;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  position: relative;
  overflow: hidden;
}

.funnel-bar {
  height: 100%;
  background-color: var(--text-primary);
  opacity: 0.9;
  transition: width var(--transition-normal);
}

.funnel-value {
  width: 70px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  padding-left: 8px;
}
`

export default function AnalyticsChart({ title, subtitle, type = 'line', data = [] }) {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, label: '', value: '' });

  if (!data || data.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <h4 className="chart-title">{title}</h4>
            {subtitle && <p className="chart-subtitle">{subtitle}</p>}
          </div>
        </div>
        <div className="chart-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: 'var(--text-muted)' }}>Sem dados disponíveis</span>
        </div>
      </div>
    );
  }

  const handleMouseMove = (e, label, value) => {
    const rect = e.currentTarget.parentNode.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setTooltip({
      visible: true,
      x,
      y,
      label,
      value
    });
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  const renderChart = () => {
    const width = 500;
    const height = 180;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const values = data.map(d => d.value);
    const maxVal = Math.max(...values, 1);
    const minVal = 0;
    const valRange = maxVal - minVal;

    if (type === 'line') {
      // Calcular pontos da linha
      const points = data.map((d, index) => {
        const x = padding + (index / (data.length - 1)) * chartWidth;
        const y = padding + chartHeight - ((d.value - minVal) / valRange) * chartHeight;
        return { x, y, label: d.label, value: d.value };
      });

      // Gerar string do Path SVG com curvas suaves (bezier)
      let pathD = '';
      if (points.length > 0) {
        pathD = `M ${points[0].x} ${points[0].y}`;
        for (let i = 0; i < points.length - 1; i++) {
          const p0 = points[i];
          const p1 = points[i + 1];
          const cpX1 = p0.x + (p1.x - p0.x) / 2;
          const cpY1 = p0.y;
          const cpX2 = p0.x + (p1.x - p0.x) / 2;
          const cpY2 = p1.y;
          pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
        }
      }

      // Path da área (preenchimento translúcido sob a linha)
      const areaD = points.length > 0 
        ? `${pathD} L ${points[points.length - 1].x} ${padding + chartHeight} L ${points[0].x} ${padding + chartHeight} Z`
        : '';

      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg">
          {/* Linhas de Grade de Fundo */}
          <line x1={padding} y1={padding} x2={padding + chartWidth} y2={padding} stroke="var(--border-subtle)" strokeWidth={1} strokeDasharray="4 4" />
          <line x1={padding} y1={padding + chartHeight / 2} x2={padding + chartWidth} y2={padding + chartHeight / 2} stroke="var(--border-subtle)" strokeWidth={1} strokeDasharray="4 4" />
          <line x1={padding} y1={padding + chartHeight} x2={padding + chartWidth} y2={padding + chartHeight} stroke="var(--border-main)" strokeWidth={1} />

          {/* Área de Gráfico */}
          {areaD && <path d={areaD} fill="var(--text-primary)" className="chart-area" />}

          {/* Linha Principal */}
          {pathD && (
            <path 
              d={pathD} 
              fill="none" 
              stroke="var(--text-primary)" 
              strokeWidth={2.5} 
              className="chart-path" 
            />
          )}

          {/* Nós / Círculos de Interatividade */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={10}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseMove={(e) => handleMouseMove(e, p.label, p.value)}
                onMouseLeave={handleMouseLeave}
              />
              <circle
                cx={p.x}
                cy={p.y}
                r={4}
                fill="var(--bg-primary)"
                stroke="var(--text-primary)"
                strokeWidth={2}
                style={{ pointerEvents: 'none' }}
              />
            </g>
          ))}
        </svg>
      );
    }

    if (type === 'bar') {
      const barCount = data.length;
      const barGap = 12;
      const barWidth = (chartWidth - barGap * (barCount - 1)) / barCount;

      return (
        <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg">
          {/* Linhas de Grade */}
          <line x1={padding} y1={padding} x2={padding + chartWidth} y2={padding} stroke="var(--border-subtle)" strokeWidth={1} strokeDasharray="4 4" />
          <line x1={padding} y1={padding + chartHeight / 2} x2={padding + chartWidth} y2={padding + chartHeight / 2} stroke="var(--border-subtle)" strokeWidth={1} strokeDasharray="4 4" />
          <line x1={padding} y1={padding + chartHeight} x2={padding + chartWidth} y2={padding + chartHeight} stroke="var(--border-main)" strokeWidth={1} />

          {data.map((d, index) => {
            const barHeight = ((d.value - minVal) / valRange) * chartHeight;
            const x = padding + index * (barWidth + barGap);
            const y = padding + chartHeight - barHeight;

            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  fill="var(--text-secondary)"
                  rx={2}
                  className="chart-bar-rect"
                  style={{ cursor: 'pointer' }}
                  onMouseMove={(e) => handleMouseMove(e, d.label, d.value)}
                  onMouseLeave={handleMouseLeave}
                />
              </g>
            );
          })}
        </svg>
      );
    }

    if (type === 'funnel') {
      // Renderização especial de funil de conversão (HTML puro premium)
      const maxFunnelVal = Math.max(...values, 1);
      return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
          {data.map((d, idx) => {
            const percentage = maxFunnelVal > 0 ? (d.value / maxFunnelVal) * 100 : 0;
            return (
              <div key={idx} className="funnel-stage">
                <div className="funnel-label">{d.label}</div>
                <div className="funnel-bar-container">
                  <div 
                    className="funnel-bar" 
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="funnel-value">
                  {d.value}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <style>{styles}</style>
      <div className="chart-card">
        <div className="chart-header">
          <div>
            <h4 className="chart-title">{title}</h4>
            {subtitle && <p className="chart-subtitle">{subtitle}</p>}
          </div>
        </div>
        
        <div className="chart-content">
          {renderChart()}
          {type !== 'funnel' && (
            <div 
              className={`chart-tooltip ${tooltip.visible ? 'visible' : ''}`}
              style={{ left: tooltip.x, top: tooltip.y }}
            >
              <div className="chart-tooltip-label">{tooltip.label}</div>
              <div className="chart-tooltip-value">
                {typeof tooltip.value === 'number' && tooltip.value > 1000 
                  ? `R$ ${tooltip.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` 
                  : tooltip.value}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
