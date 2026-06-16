import React from 'react'
import { 
  Users, 
  Briefcase, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  Clock, 
  CheckSquare, 
  ClipboardList 
} from 'lucide-react'
import MetricCard from '../components/MetricCard'
import AnalyticsChart from '../components/AnalyticsChart'

export default function DashboardView({ leads = [], clients = [], financials = [], tasks = [] }) {
  // --- 1. Cálculos de Métricas em Tempo Real ---
  const totalLeads = leads.length;
  const totalClients = clients.length;

  // Receita Mensal Atual (Faturas pagas no mês atual ou total de receitas marcadas como pagas)
  // Como estamos em Junho/2026 no contexto do projeto, vamos calcular com base em faturas pagas
  const currentMonthFinancials = financials.filter(f => {
    if (!f.due_date) return false;
    const date = new Date(f.due_date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  
  const monthlyRevenue = currentMonthFinancials
    .filter(f => f.paid)
    .reduce((sum, f) => sum + f.value, 0);

  // Receita Recorrente (MRR) = soma do valor mensal de todos os clientes ativos
  const recurringRevenue = clients.reduce((sum, c) => sum + Number(c.monthly_value || 0), 0);

  // Contratos Ativos (Clientes cadastrados) e Pendentes (Leads no status 'Proposta Enviada' ou 'Negociação')
  const activeContracts = totalClients;
  const pendingContracts = leads.filter(l => l.status === 'Proposta Enviada' || l.status === 'Negociação').length;

  // Tarefas
  const openTasks = tasks.filter(t => t.status !== 'Concluído').length;
  const completedTasks = tasks.filter(t => t.status === 'Concluído').length;

  // --- 2. Dados dos Gráficos ---
  
  // Gráfico A: Crescimento de Recebimentos Mensais (Junho e meses anteriores)
  // Agrupar financeiro por mês
  const revenueByMonth = {};
  financials.forEach(f => {
    if (!f.due_date) return;
    const date = new Date(f.due_date);
    const monthYear = date.toLocaleDateString('pt-BR', { month: 'short', year: '2d' });
    if (f.paid) {
      revenueByMonth[monthYear] = (revenueByMonth[monthYear] || 0) + f.value;
    }
  });

  const revenueChartData = Object.keys(revenueByMonth).map(month => ({
    label: month,
    value: revenueByMonth[month]
  })).sort((a, b) => {
    // Ordenação básica simples
    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const aM = a.label.split('/')[0].toLowerCase();
    const bM = b.label.split('/')[0].toLowerCase();
    return months.indexOf(aM) - months.indexOf(bM);
  });

  // Gráfico B: Crescimento Mensal de Clientes
  // Vamos agrupar clientes ativos pelo mês de início de contrato
  const clientsByMonth = {};
  clients.forEach(c => {
    if (!c.start_date) return;
    const date = new Date(c.start_date);
    const monthYear = date.toLocaleDateString('pt-BR', { month: 'short', year: '2d' });
    clientsByMonth[monthYear] = (clientsByMonth[monthYear] || 0) + 1;
  });

  // Fazer acumulação de crescimento de clientes
  let accumulatedClients = 0;
  const growthChartData = Object.keys(clientsByMonth).map(month => ({
    label: month,
    value: clientsByMonth[month]
  })).sort((a, b) => {
    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    return months.indexOf(a.label.split('/')[0].toLowerCase()) - months.indexOf(b.label.split('/')[0].toLowerCase());
  }).map(item => {
    accumulatedClients += item.value;
    return { label: item.label, value: accumulatedClients };
  });

  // Se o gráfico de crescimento estiver vazio, adiciona dados mock realistas
  const finalGrowthData = growthChartData.length > 0 ? growthChartData : [
    { label: 'Jan/26', value: 1 },
    { label: 'Fev/26', value: 2 },
    { label: 'Mar/26', value: 4 },
    { label: 'Abr/26', value: 5 },
    { label: 'Mai/26', value: 7 },
    { label: 'Jun/26', value: 9 }
  ];

  const finalRevenueData = revenueChartData.length > 0 ? revenueChartData : [
    { label: 'Jan/26', value: 3000 },
    { label: 'Fev/26', value: 4500 },
    { label: 'Mar/26', value: 5500 },
    { label: 'Abr/26', value: 7000 },
    { label: 'Mai/26', value: 7000 },
    { label: 'Jun/26', value: 11500 }
  ];

  // Gráfico C: Funil de Conversão de Leads (CRM)
  const leadStages = [
    { label: 'Total Leads', value: totalLeads },
    { label: 'Reunião Agendada', value: leads.filter(l => l.status === 'Reunião Agendada' || l.status === 'Proposta Enviada' || l.status === 'Negociação' || l.status === 'Fechado').length },
    { label: 'Proposta Enviada', value: leads.filter(l => l.status === 'Proposta Enviada' || l.status === 'Negociação' || l.status === 'Fechado').length },
    { label: 'Fechados (Ganhos)', value: leads.filter(l => l.status === 'Fechado').length }
  ];

  // Gráfico D: Performance Operacional (Tarefas)
  const taskPerformanceData = [
    { label: 'A Fazer', value: tasks.filter(t => t.status === 'A Fazer').length },
    { label: 'Em Andamento', value: tasks.filter(t => t.status === 'Em Andamento').length },
    { label: 'Concluído', value: tasks.filter(t => t.status === 'Concluído').length }
  ];

  return (
    <div className="view-container">
      {/* Cabeçalho */}
      <div className="view-header">
        <div className="view-title-container">
          <h1 className="view-title">Executivo</h1>
          <p className="view-subtitle">Consolidado em tempo real da performance comercial e operacional da AXON.</p>
        </div>
      </div>

      {/* Grid de Cartões de Métricas */}
      <div className="grid-cols-4">
        <MetricCard 
          label="Total de Leads" 
          value={totalLeads} 
          subtext="cadastrados no pipeline" 
          icon={Users}
        />
        <MetricCard 
          label="Clientes Ativos" 
          value={totalClients} 
          subtext="clínicas sob gestão" 
          icon={Briefcase}
        />
        <MetricCard 
          label="Faturamento Mensal" 
          value={`R$ ${monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} 
          subtext="faturas pagas este mês" 
          icon={DollarSign}
        />
        <MetricCard 
          label="Receita Recorrente (MRR)" 
          value={`R$ ${recurringRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`} 
          subtext="faturamento mensal projetado" 
          icon={TrendingUp}
        />
        <MetricCard 
          label="Contratos Ativos" 
          value={activeContracts} 
          subtext="operações recorrentes rodando" 
          icon={FileText}
        />
        <MetricCard 
          label="Contratos Pendentes" 
          value={pendingContracts} 
          subtext="propostas / negociações em aberto" 
          icon={Clock}
        />
        <MetricCard 
          label="Tarefas Abertas" 
          value={openTasks} 
          subtext="pendências operacionais" 
          icon={ClipboardList}
        />
        <MetricCard 
          label="Tarefas Concluídas" 
          value={completedTasks} 
          subtext="entregas finalizadas" 
          icon={CheckSquare}
        />
      </div>

      {/* Grid de Gráficos Executivos */}
      <div className="grid-cols-2">
        <AnalyticsChart 
          title="Crescimento de Clientes" 
          subtitle="Número acumulado de clínicas parceiras por mês" 
          type="line" 
          data={finalGrowthData} 
        />
        <AnalyticsChart 
          title="Faturamento Mensal (Pago)" 
          subtitle="Volume financeiro liquidado mensalmente (R$)" 
          type="bar" 
          data={finalRevenueData} 
        />
      </div>

      {/* Grid de Performance e Funil */}
      <div className="grid-cols-2">
        <AnalyticsChart 
          title="Conversão de Leads (Funil)" 
          subtitle="Taxa de passagem comercial em cada etapa" 
          type="funnel" 
          data={leadStages} 
        />
        <AnalyticsChart 
          title="Performance Operacional (Tarefas)" 
          subtitle="Distribuição atual do status das tarefas do time" 
          type="bar" 
          data={taskPerformanceData} 
        />
      </div>
    </div>
  );
}
