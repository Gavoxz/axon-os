import React from 'react'
import { TrendingUp, Percent, DollarSign, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react'
import MetricCard from '../components/MetricCard'

const styles = `
.pipeline-funnel-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 32px;
}

.pipeline-funnel-stage {
  display: flex;
  align-items: center;
  border: 1px solid var(--border-main);
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-md);
  padding: 16px 24px;
  position: relative;
  overflow: hidden;
  transition: border-color var(--transition-fast);
}

.pipeline-funnel-stage:hover {
  border-color: var(--text-secondary);
}

.pipeline-stage-info {
  flex: 0 0 150px;
}

.pipeline-stage-name {
  font-family: var(--font-heading);
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--text-primary);
}

.pipeline-stage-prob {
  font-size: 0.75rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.pipeline-stage-leads {
  flex: 1;
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding: 4px 0;
  align-items: center;
}

.pipeline-lead-pill {
  padding: 6px 14px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  white-space: nowrap;
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pipeline-lead-company {
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.pipeline-stage-value {
  flex: 0 0 160px;
  text-align: right;
  font-family: var(--font-heading);
}

.pipeline-value-amount {
  font-weight: 700;
  font-size: 1.15rem;
}

.pipeline-value-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
}
`

export default function PipelineView({ leads = [], clients = [] }) {
  // Configuração das etapas do Pipeline Comercial e suas probabilidades
  const stages = [
    { name: 'Lead', dbStatus: 'Novo Lead', probability: 0.1 },
    { name: 'Qualificação', dbStatus: 'Contato Feito', probability: 0.2 },
    { name: 'Diagnóstico', dbStatus: 'Reunião Agendada', probability: 0.4 },
    { name: 'Proposta', dbStatus: 'Proposta Enviada', probability: 0.6 },
    { name: 'Negociação', dbStatus: 'Negociação', probability: 0.8 },
    { name: 'Fechado', dbStatus: 'Fechado', probability: 1.0 }
  ];

  // Média padrão para estimativa se o lead não possuir valor individual
  const ESTIMATED_TICKET = 3500.00;

  // --- CÁLCULOS AUTOMÁTICOS ---
  
  // 1. Taxa de Conversão: (Leads Fechados / Total de Leads Ativos ou Encerrados) * 100
  // Para evitar divisões por zero e dar dados consistentes:
  const closedLeads = leads.filter(l => l.status === 'Fechado').length;
  const lostLeads = leads.filter(l => l.status === 'Perdido').length;
  // Considera leads totais válidos
  const totalCommercialLeads = leads.length;
  const conversionRate = totalCommercialLeads > 0 
    ? (closedLeads / totalCommercialLeads) * 100 
    : 0;

  // 2. Ticket Médio: média de faturamento recorrente dos clientes ativos
  const totalMRR = clients.reduce((sum, c) => sum + Number(c.monthly_value || 0), 0);
  const averageTicket = clients.length > 0 
    ? totalMRR / clients.length 
    : ESTIMATED_TICKET;

  // 3. Receita Projetada (Valor ponderado dos leads no pipeline)
  // Cada lead em uma etapa soma (Ticket Médio * Probabilidade da Etapa)
  const projectedRevenue = leads.reduce((sum, lead) => {
    // Achar a probabilidade da etapa do lead
    const stage = stages.find(s => s.dbStatus === lead.status);
    if (stage) {
      // Se for fechado, o valor real já está em Clientes (MRR), então não soma na projeção comercial futura
      if (stage.dbStatus === 'Fechado') return sum;
      return sum + (ESTIMATED_TICKET * stage.probability);
    }
    return sum;
  }, 0);

  return (
    <div className="view-container">
      <style>{styles}</style>
      
      {/* Cabeçalho */}
      <div className="view-header">
        <div className="view-title-container">
          <h1 className="view-title">Pipeline Comercial</h1>
          <p className="view-subtitle">Análise estatística do funil de vendas, probabilidade de fechamentos e ticket médio.</p>
        </div>
      </div>

      {/* Indicadores do Funil */}
      <div className="grid-cols-3">
        <MetricCard 
          label="Taxa de Conversão Comercial" 
          value={`${conversionRate.toFixed(1)}%`}
          subtext="leads convertidos em clientes"
          icon={Percent}
        />
        <MetricCard 
          label="Ticket Médio Atual" 
          value={`R$ ${averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtext="valor médio de contrato por clínica"
          icon={DollarSign}
        />
        <MetricCard 
          label="Receita Comercial Projetada" 
          value={`R$ ${projectedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtext="receita ponderada por probabilidade"
          icon={TrendingUp}
        />
      </div>

      {/* Funil Visual do Pipeline */}
      <div className="pipeline-funnel-container">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Visualização de Estágios</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {stages.map((stage) => {
            const stageLeads = leads.filter(l => l.status === stage.dbStatus);
            // Receita calculada da etapa: (leads ativos * ticket * probabilidade)
            const stageValue = stage.dbStatus === 'Fechado' 
              ? clients.reduce((sum, c) => sum + Number(c.monthly_value || 0), 0)
              : stageLeads.length * ESTIMATED_TICKET;

            return (
              <div key={stage.name} className="pipeline-funnel-stage">
                {/* Nome do Estágio */}
                <div className="pipeline-stage-info">
                  <div className="pipeline-stage-name">{stage.name}</div>
                  <div className="pipeline-stage-prob">
                    Probabilidade: {stage.probability * 100}%
                  </div>
                </div>

                {/* Leads no Estágio */}
                <div className="pipeline-stage-leads">
                  {stageLeads.length > 0 ? (
                    stageLeads.map(lead => (
                      <div key={lead.id} className="pipeline-lead-pill">
                        <span style={{ fontWeight: 600 }}>{lead.name}</span>
                        {lead.company && <span className="pipeline-lead-company">{lead.company}</span>}
                      </div>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Nenhum lead nesta etapa
                    </span>
                  )}
                </div>

                {/* Valor Estimado / Real do Estágio */}
                <div className="pipeline-stage-value">
                  <div className="pipeline-value-amount">
                    R$ {stageValue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <div className="pipeline-value-label">
                    {stage.dbStatus === 'Fechado' ? 'Receita Recorrente Real' : 'Volume Estimado'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
