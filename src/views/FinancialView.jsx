import React, { useState } from 'react'
import { Plus, Search, Check, X, FileText, Trash2, Edit2, CheckCircle, AlertCircle } from 'lucide-react'
import Modal from '../components/Modal'
import MetricCard from '../components/MetricCard'
import AnalyticsChart from '../components/AnalyticsChart'

export default function FinancialView({ financials = [], clients = [], onSaveFinancial, onDeleteFinancial }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos'); // todos, pagos, pendentes
  
  const [formData, setFormData] = useState({
    client_name: '',
    value: '',
    due_date: '',
    paid: false,
    payment_method: 'Pix'
  });

  // --- 1. Cálculos de Indicadores Financeiros ---
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Receita Mensal (Faturas pagas no mês atual)
  const monthlyRevenue = financials
    .filter(f => f.paid && f.due_date && new Date(f.due_date).getMonth() === currentMonth && new Date(f.due_date).getFullYear() === currentYear)
    .reduce((sum, f) => sum + f.value, 0);

  // Receita Anual (Faturas pagas no ano atual)
  const annualRevenue = financials
    .filter(f => f.paid && f.due_date && new Date(f.due_date).getFullYear() === currentYear)
    .reduce((sum, f) => sum + f.value, 0);

  // Receita Recorrente (MRR) de clientes ativos
  const recurringRevenue = clients.reduce((sum, c) => sum + Number(c.monthly_value || 0), 0);

  // Valores Pendentes (Não pagos)
  const pendingRevenue = financials
    .filter(f => !f.paid)
    .reduce((sum, f) => sum + f.value, 0);

  // --- 2. Preparação de Dados dos Gráficos ---
  // Receita Mensal Realizada por Mês
  const billingByMonth = {};
  financials.forEach(f => {
    if (!f.due_date) return;
    const date = new Date(f.due_date);
    const monthStr = date.toLocaleDateString('pt-BR', { month: 'short' });
    if (f.paid) {
      billingByMonth[monthStr] = (billingByMonth[monthStr] || 0) + f.value;
    }
  });

  const monthsOrder = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const chartBillingData = Object.keys(billingByMonth).map(m => ({
    label: m,
    value: billingByMonth[m]
  })).sort((a, b) => monthsOrder.indexOf(a.label.toLowerCase()) - monthsOrder.indexOf(b.label.toLowerCase()));

  // Caso não tenha dados, fornece mocks realistas
  const finalBillingChartData = chartBillingData.length > 0 ? chartBillingData : [
    { label: 'Mar', value: 2500 },
    { label: 'Abr', value: 7000 },
    { label: 'Mai', value: 7000 },
    { label: 'Jun', value: 11500 }
  ];

  // Faturamento Pago vs Pendente
  const cashFlowDistribution = [
    { label: 'Pago', value: financials.filter(f => f.paid).reduce((sum, f) => sum + f.value, 0) },
    { label: 'Pendente', value: financials.filter(f => !f.paid).reduce((sum, f) => sum + f.value, 0) }
  ];

  // --- 3. Manipulação de CRUD ---
  const handleOpenAddModal = () => {
    setFormData({
      client_name: clients.length > 0 ? clients[0].name : '',
      value: '',
      due_date: new Date().toISOString().split('T')[0],
      paid: false,
      payment_method: 'Pix'
    });
    setSelectedInvoice(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (invoice) => {
    setSelectedInvoice(invoice);
    setFormData({
      id: invoice.id,
      client_name: invoice.client_name || '',
      value: invoice.value || '',
      due_date: invoice.due_date || '',
      paid: invoice.paid || false,
      payment_method: invoice.payment_method || 'Pix'
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.client_name.trim() || !formData.value) return;

    onSaveFinancial({
      ...formData,
      value: Number(formData.value)
    });
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (selectedInvoice && window.confirm(`Deseja deletar esta fatura de "${selectedInvoice.client_name}"?`)) {
      onDeleteFinancial(selectedInvoice.id);
      setIsModalOpen(false);
    }
  };

  const handleTogglePaid = (invoice) => {
    onSaveFinancial({
      ...invoice,
      paid: !invoice.paid
    });
  };

  // --- 4. Filtros e Pesquisa ---
  const filteredFinancials = financials.filter(fin => {
    const matchesSearch = fin.client_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      statusFilter === 'todos' ||
      (statusFilter === 'pagos' && fin.paid) ||
      (statusFilter === 'pendentes' && !fin.paid);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="view-container">
      {/* Cabeçalho */}
      <div className="view-header">
        <div className="view-title-container">
          <h1 className="view-title">Financeiro</h1>
          <p className="view-subtitle">Controle de faturamento, liquidação de contratos e projeção de receita anual.</p>
        </div>
        <div className="view-actions">
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <Plus size={16} strokeWidth={2} />
            <span>Nova Fatura</span>
          </button>
        </div>
      </div>

      {/* Indicadores Rápidos */}
      <div className="grid-cols-4">
        <MetricCard 
          label="Receita Mensal (Realizada)" 
          value={`R$ ${monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtext="faturamento liquidado este mês"
        />
        <MetricCard 
          label="Receita Anual Acumulada" 
          value={`R$ ${annualRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtext={`faturamento total pago em ${currentYear}`}
        />
        <MetricCard 
          label="Recorrência Ativa (MRR)" 
          value={`R$ ${recurringRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtext="contratos ativos atualmente"
        />
        <MetricCard 
          label="Contas a Receber" 
          value={`R$ ${pendingRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          subtext="valores pendentes de pagamento"
        />
      </div>

      {/* Gráficos Financeiros */}
      <div className="grid-cols-2">
        <AnalyticsChart 
          title="Faturamento Mensal Liquidado" 
          subtitle="Histórico de receitas convertidas em caixa por mês" 
          type="line" 
          data={finalBillingChartData} 
        />
        <AnalyticsChart 
          title="Distribuição Financeira Total" 
          subtitle="Comparativo entre valores liquidados e valores em aberto" 
          type="bar" 
          data={cashFlowDistribution} 
        />
      </div>

      {/* Filtros e Busca */}
      <div style={{ display: 'flex', gap: 16, width: '100%', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
          <Search 
            size={16} 
            strokeWidth={2} 
            style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
          />
          <input
            type="text"
            placeholder="Buscar por nome do cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: 40 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            className={`btn ${statusFilter === 'todos' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setStatusFilter('todos')}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            Todos
          </button>
          <button 
            className={`btn ${statusFilter === 'pagos' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setStatusFilter('pagos')}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            Pagos
          </button>
          <button 
            className={`btn ${statusFilter === 'pendentes' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setStatusFilter('pendentes')}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
          >
            Pendentes
          </button>
        </div>
      </div>

      {/* Tabela de Lançamentos */}
      {filteredFinancials.length > 0 ? (
        <div className="table-container">
          <table className="axon-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Valor</th>
                <th>Vencimento</th>
                <th>Status</th>
                <th>Forma de Pagamento</th>
                <th style={{ width: 100 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredFinancials.map((invoice) => (
                <tr key={invoice.id}>
                  <td style={{ fontWeight: 600 }}>{invoice.client_name}</td>
                  <td style={{ fontWeight: 600 }}>
                    R$ {Number(invoice.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td>
                    <button
                      onClick={() => handleTogglePaid(invoice)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      {invoice.paid ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--text-primary)', fontSize: '0.85rem', fontWeight: 600 }}>
                          <CheckCircle size={14} /> Pago
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          <AlertCircle size={14} /> Pendente
                        </span>
                      )}
                    </button>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{invoice.payment_method}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        className="btn-icon" 
                        onClick={() => handleOpenEditModal(invoice)}
                        title="Editar"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-title">Nenhuma fatura encontrada</div>
          <div className="empty-state-desc">
            Cadastre lançamentos de receitas para ter controle completo sobre o faturamento.
          </div>
          <button className="btn btn-secondary" onClick={handleOpenAddModal}>
            Adicionar Lançamento
          </button>
        </div>
      )}

      {/* Modal CRUD Fatura */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedInvoice ? 'Editar Fatura' : 'Nova Fatura'}
        footer={
          <div style={{ display: 'flex', width: '100%', justifySelf: 'stretch', justifyContent: 'space-between' }}>
            {selectedInvoice && (
              <button className="btn btn-danger" type="button" onClick={handleDelete}>
                <Trash2 size={16} />
                <span>Excluir</span>
              </button>
            )}
            <div style={{ display: 'flex', gap: 12, marginLeft: 'auto' }}>
              <button className="btn btn-secondary" type="button" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" type="submit" form="invoiceForm">
                Salvar
              </button>
            </div>
          </div>
        }
      >
        <form id="invoiceForm" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label htmlFor="client_name">Cliente / Clínica *</label>
            {clients.length > 0 ? (
              <select
                id="client_name"
                name="client_name"
                value={formData.client_name}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>Selecione um cliente...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
                {/* Fallback de input livre se quiser lançar avulso */}
                <option value="Cliente Avulso / Outro">Outro (Inserir nome abaixo)</option>
              </select>
            ) : (
              <input
                type="text"
                id="client_name"
                name="client_name"
                value={formData.client_name}
                onChange={handleInputChange}
                placeholder="Ex: Clínica Dermato Glow"
                required
              />
            )}
          </div>

          {formData.client_name === 'Cliente Avulso / Outro' && (
            <div>
              <label htmlFor="custom_client_name">Nome do Cliente Avulso *</label>
              <input
                type="text"
                id="custom_client_name"
                placeholder="Digite o nome do cliente"
                onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                required
              />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
            <div>
              <label htmlFor="value">Valor da Fatura (R$) *</label>
              <input
                type="number"
                id="value"
                name="value"
                value={formData.value}
                onChange={handleInputChange}
                placeholder="Ex: 4500"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label htmlFor="due_date">Data de Vencimento *</label>
              <input
                type="date"
                id="due_date"
                name="due_date"
                value={formData.due_date}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label htmlFor="payment_method">Forma de Pagamento</label>
              <select
                id="payment_method"
                name="payment_method"
                value={formData.payment_method}
                onChange={handleInputChange}
              >
                <option value="Pix">Pix</option>
                <option value="Boleto">Boleto Bancário</option>
                <option value="Cartão de Crédito">Cartão de Crédito</option>
                <option value="Transferência Bancária">TED / DOC</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: 26 }}>
              <label htmlFor="paid" style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', margin: 0 }}>
                <input
                  type="checkbox"
                  id="paid"
                  name="paid"
                  checked={formData.paid}
                  onChange={handleInputChange}
                  style={{ width: 'auto', transform: 'scale(1.2)', cursor: 'pointer' }}
                />
                <span>Marcar como Pago</span>
              </label>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
