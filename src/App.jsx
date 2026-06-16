import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import DashboardView from './views/DashboardView'
import CRMView from './views/CRMView'
import ClientsView from './views/ClientsView'
import FinancialView from './views/FinancialView'
import TasksView from './views/TasksView'
import AgendaView from './views/AgendaView'
import PipelineView from './views/PipelineView'
import { dbService } from './services/db'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

// Estilos adicionais para Notificações e Loading na interface principal
const styles = `
.app-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--bg-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 999;
  gap: 16px;
}

.sync-bar-progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 2px;
  background-color: var(--text-primary);
  z-index: 99;
  transition: width 0.3s ease;
}

.toast-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 380px;
  width: calc(100% - 48px);
}

.toast {
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-main);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: var(--shadow-lg);
  animation: slideInRight var(--transition-normal);
}

.toast.error {
  border-color: #ff5555;
}

.toast-message {
  font-size: 0.9rem;
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .toast-container {
    bottom: 80px; /* Acima da barra de navegação mobile */
    right: 24px;
    left: 24px;
    width: auto;
  }
}
`

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [toasts, setToasts] = useState([]);

  // Estados dos Dados Centrais
  const [leads, setLeads] = useState([]);
  const [clients, setClients] = useState([]);
  const [financials, setFinancials] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);

  // --- 1. Carregamento Inicial ---
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [lData, cData, fData, tData, eData] = await Promise.all([
          dbService.getLeads(),
          dbService.getClients(),
          dbService.getFinancials(),
          dbService.getTasks(),
          dbService.getEvents()
        ]);
        
        setLeads(lData || []);
        setClients(cData || []);
        setFinancials(fData || []);
        setTasks(tData || []);
        setEvents(eData || []);
      } catch (err) {
        showToast('Erro ao sincronizar dados com o banco.', 'error');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // --- 2. Helper de Toast / Notificações ---
  const showToast = (message, type = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto-remove após 4 segundos
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // --- 3. Ações e Mutações de Dados com Auto-Sync e Regras de Negócio ---

  // CRM LEADS
  const handleSaveLead = async (lead) => {
    setSyncing(true);
    const originalLeads = [...leads];
    
    // 1. Atualização Otimista
    let updatedLeads;
    const isNew = !lead.id;
    
    if (isNew) {
      const tempId = 'temp_' + Math.random().toString(36).substr(2, 9);
      const newLead = { ...lead, id: tempId, created_at: new Date().toISOString() };
      updatedLeads = [newLead, ...leads];
    } else {
      updatedLeads = leads.map(l => l.id === lead.id ? { ...l, ...lead } : l);
    }
    setLeads(updatedLeads);

    try {
      // 2. Persistência
      const savedLead = await dbService.saveLead(lead);
      
      // Atualizar o estado com o objeto real do banco (por causa do ID final)
      setLeads(prev => prev.map(l => (l.id === lead.id || l.id.startsWith('temp_')) ? savedLead : l));
      showToast(isNew ? 'Lead cadastrado com sucesso!' : 'Lead atualizado.');

      // --- AUTOMATION: Lead fechado virando Cliente e Financeiro ---
      if (lead.status === 'Fechado') {
        const alreadyClient = clients.some(c => c.name.toLowerCase() === (lead.company || lead.name).toLowerCase());
        
        if (!alreadyClient) {
          // Criar Cliente automaticamente
          const newClientData = {
            name: lead.company || lead.name,
            responsible: lead.name,
            phone: lead.phone || '',
            whatsapp: lead.whatsapp || '',
            email: lead.email || '',
            instagram: lead.instagram || '',
            plan: 'Tráfego Pago (Automático)',
            monthly_value: 3500.00,
            start_date: new Date().toISOString().split('T')[0],
            renewal_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            notes: `Cliente gerado automaticamente a partir do fechamento do Lead comercial. Origem: ${lead.origin || 'Não definida'}.`
          };

          // Salvar o novo cliente
          const savedClient = await dbService.saveClient(newClientData);
          setClients(prev => [savedClient, ...prev]);
          showToast(`Cliente "${newClientData.name}" criado automaticamente!`);

          // Criar Faturamento Inicial automaticamente
          const newInvoiceData = {
            client_name: savedClient.name,
            value: savedClient.monthly_value,
            due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 dias após
            paid: false,
            payment_method: 'Pix'
          };

          const savedInvoice = await dbService.saveFinancial(newInvoiceData);
          setFinancials(prev => [...prev, savedInvoice]);
          showToast(`Faturamento de Setup R$ ${newInvoiceData.value} lançado.`);
        }
      }
    } catch (err) {
      setLeads(originalLeads);
      showToast('Erro ao sincronizar lead.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteLead = async (id) => {
    setSyncing(true);
    const originalLeads = [...leads];
    setLeads(prev => prev.filter(l => l.id !== id));
    try {
      await dbService.deleteLead(id);
      showToast('Lead deletado.');
    } catch (err) {
      setLeads(originalLeads);
      showToast('Erro ao deletar lead.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // CLIENTS
  const handleSaveClient = async (client) => {
    setSyncing(true);
    const originalClients = [...clients];
    const isNew = !client.id;
    
    if (isNew) {
      const tempId = 'temp_' + Math.random().toString(36).substr(2, 9);
      setClients([{ ...client, id: tempId, created_at: new Date().toISOString() }, ...clients]);
    } else {
      setClients(clients.map(c => c.id === client.id ? { ...c, ...client } : c));
    }

    try {
      const savedClient = await dbService.saveClient(client);
      setClients(prev => prev.map(c => (c.id === client.id || c.id.startsWith('temp_')) ? savedClient : c));
      showToast(isNew ? 'Cliente cadastrado com sucesso!' : 'Cadastro do cliente atualizado.');
    } catch (err) {
      setClients(originalClients);
      showToast('Erro ao sincronizar cliente.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteClient = async (id) => {
    setSyncing(true);
    const originalClients = [...clients];
    setClients(prev => prev.filter(c => c.id !== id));
    try {
      await dbService.deleteClient(id);
      showToast('Cliente excluído.');
    } catch (err) {
      setClients(originalClients);
      showToast('Erro ao excluir cliente.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // FINANCIALS
  const handleSaveFinancial = async (invoice) => {
    setSyncing(true);
    const originalFin = [...financials];
    const isNew = !invoice.id;

    if (isNew) {
      const tempId = 'temp_' + Math.random().toString(36).substr(2, 9);
      setFinancials([...financials, { ...invoice, id: tempId, created_at: new Date().toISOString() }]);
    } else {
      setFinancials(financials.map(f => f.id === invoice.id ? { ...f, ...invoice } : f));
    }

    try {
      const savedInvoice = await dbService.saveFinancial(invoice);
      setFinancials(prev => prev.map(f => (f.id === invoice.id || f.id.startsWith('temp_')) ? savedInvoice : f));
      showToast(isNew ? 'Fatura lançada.' : 'Fatura atualizada.');
    } catch (err) {
      setFinancials(originalFin);
      showToast('Erro ao sincronizar fatura.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteFinancial = async (id) => {
    setSyncing(true);
    const originalFin = [...financials];
    setFinancials(prev => prev.filter(f => f.id !== id));
    try {
      await dbService.deleteFinancial(id);
      showToast('Fatura excluída.');
    } catch (err) {
      setFinancials(originalFin);
      showToast('Erro ao excluir fatura.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // TASKS
  const handleSaveTask = async (task) => {
    setSyncing(true);
    const originalTasks = [...tasks];
    const isNew = !task.id;

    if (isNew) {
      const tempId = 'temp_' + Math.random().toString(36).substr(2, 9);
      setTasks([{ ...task, id: tempId, created_at: new Date().toISOString() }, ...tasks]);
    } else {
      setTasks(tasks.map(t => t.id === task.id ? { ...t, ...task } : t));
    }

    try {
      const savedTask = await dbService.saveTask(task);
      setTasks(prev => prev.map(t => (t.id === task.id || t.id.startsWith('temp_')) ? savedTask : t));
      showToast(isNew ? 'Tarefa criada.' : 'Tarefa atualizada.');
    } catch (err) {
      setTasks(originalTasks);
      showToast('Erro ao sincronizar tarefa.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteTask = async (id) => {
    setSyncing(true);
    const originalTasks = [...tasks];
    setTasks(prev => prev.filter(t => t.id !== id));
    try {
      await dbService.deleteTask(id);
      showToast('Tarefa excluída.');
    } catch (err) {
      setTasks(originalTasks);
      showToast('Erro ao excluir tarefa.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // AGENDA / EVENTS
  const handleSaveEvent = async (event) => {
    setSyncing(true);
    const originalEvents = [...events];
    const isNew = !event.id;

    if (isNew) {
      const tempId = 'temp_' + Math.random().toString(36).substr(2, 9);
      setEvents([...events, { ...event, id: tempId, created_at: new Date().toISOString() }]);
    } else {
      setEvents(events.map(e => e.id === event.id ? { ...e, ...event } : e));
    }

    try {
      const savedEvent = await dbService.saveEvent(event);
      setEvents(prev => prev.map(e => (e.id === event.id || e.id.startsWith('temp_')) ? savedEvent : e));
      showToast(isNew ? 'Evento agendado com sucesso!' : 'Evento atualizado.');
    } catch (err) {
      setEvents(originalEvents);
      showToast('Erro ao agendar compromisso.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    setSyncing(true);
    const originalEvents = [...events];
    setEvents(prev => prev.filter(e => e.id !== id));
    try {
      await dbService.deleteEvent(id);
      showToast('Compromisso cancelado.');
    } catch (err) {
      setEvents(originalEvents);
      showToast('Erro ao excluir compromisso.', 'error');
    } finally {
      setSyncing(false);
    }
  };

  // --- 4. Roteamento de Visualização ---
  const renderActiveView = () => {
    switch(activeView) {
      case 'dashboard':
        return <DashboardView leads={leads} clients={clients} financials={financials} tasks={tasks} />;
      case 'crm':
        return <CRMView leads={leads} onSaveLead={handleSaveLead} onDeleteLead={handleDeleteLead} />;
      case 'clients':
        return <ClientsView clients={clients} onSaveClient={handleSaveClient} onDeleteClient={handleDeleteClient} />;
      case 'financial':
        return <FinancialView financials={financials} clients={clients} onSaveFinancial={handleSaveFinancial} onDeleteFinancial={handleDeleteFinancial} />;
      case 'tasks':
        return <TasksView tasks={tasks} clients={clients} onSaveTask={handleSaveTask} onDeleteTask={handleDeleteTask} />;
      case 'agenda':
        return <AgendaView events={events} onSaveEvent={handleSaveEvent} onDeleteEvent={handleDeleteEvent} />;
      case 'pipeline':
        return <PipelineView leads={leads} clients={clients} />;
      default:
        return <DashboardView leads={leads} clients={clients} financials={financials} tasks={tasks} />;
    }
  };

  // Carregamento Inicial
  if (loading) {
    return (
      <div className="app-loading-overlay">
        <style>{styles}</style>
        <Loader2 className="loading-spinner" size={32} />
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', letterSpacing: '0.05em' }}>
          CARREGANDO AXON OS...
        </span>
      </div>
    );
  }

  return (
    <div className="app-container">
      <style>{styles}</style>
      
      {/* Barra de progresso discreta de sincronização no topo da tela */}
      {syncing && <div className="sync-bar-progress" style={{ width: '60%' }} />}

      {/* Sidebar / Bottom Navigation */}
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        isUsingSupabase={dbService.isUsingSupabase} 
      />

      {/* Conteúdo Principal */}
      <main className="main-content">
        {renderActiveView()}
      </main>

      {/* Container de Toasts/Notificações */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {toast.type === 'error' ? (
              <AlertCircle size={18} style={{ color: '#ff5555' }} />
            ) : (
              <CheckCircle2 size={18} style={{ color: '#ffffff' }} />
            )}
            <span className="toast-message">{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
