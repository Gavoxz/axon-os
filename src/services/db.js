import { supabase, isSupabaseConfigured } from './supabaseClient'

// Dados Iniciais de Demonstração (Mock)
const INITIAL_LEADS = [
  {
    id: 'l1',
    name: 'Dr. Roberto Silva',
    company: 'Clínica Silva Cardio',
    phone: '(11) 99999-9999',
    whatsapp: '(11) 99999-9999',
    instagram: '@robertosilva.cardio',
    email: 'roberto@silvacardio.com.br',
    origin: 'Instagram',
    notes: 'Demonstrou interesse no plano Premium de tráfego pago.',
    status: 'Novo Lead',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'l2',
    name: 'Dra. Ana Costa',
    company: 'Clínica Costa Estética',
    phone: '(21) 98888-8888',
    whatsapp: '(21) 98888-8888',
    instagram: '@anacosta.estetica',
    email: 'contato@anacosta.com.br',
    origin: 'Indicação',
    notes: 'Reunião marcada para alinhar estratégias de captação.',
    status: 'Reunião Agendada',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'l3',
    name: 'Dr. Marcos Oliveira',
    company: 'Odonto Premium',
    phone: '(31) 97777-7777',
    whatsapp: '(31) 97777-7777',
    instagram: '@odontopremium.mg',
    email: 'marcos@odontopremium.com',
    origin: 'Google Ads',
    notes: 'Enviado proposta de R$ 3.500/mês.',
    status: 'Proposta Enviada',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_CLIENTS = [
  {
    id: 'c1',
    name: 'Clínica Dermato Glow',
    responsible: 'Dra. Patricia Lima',
    phone: '(11) 91111-1111',
    whatsapp: '(11) 91111-1111',
    email: 'patricia@dermatoglow.com',
    instagram: '@dermatoglow',
    plan: 'Tráfego Pago + Social Media',
    monthly_value: 4500.00,
    start_date: '2026-01-15',
    renewal_date: '2027-01-15',
    notes: 'Cliente muito satisfeito. Foco em captação de implantes faciais.',
    created_at: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'c2',
    name: 'Odonto Clean',
    responsible: 'Dr. Felipe Albuquerque',
    phone: '(11) 92222-2222',
    whatsapp: '(11) 92222-2222',
    email: 'felipe@odontoclean.com.br',
    instagram: '@odontoclean.sp',
    plan: 'Tráfego Pago Essencial',
    monthly_value: 2500.00,
    start_date: '2026-03-01',
    renewal_date: '2026-09-01',
    notes: 'Foco em captação de Invisalign.',
    created_at: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const INITIAL_FINANCIALS = [
  { id: 'f1', client_name: 'Clínica Dermato Glow', value: 4500.00, due_date: '2026-05-15', paid: true, payment_method: 'Pix', created_at: '2026-05-15T10:00:00Z' },
  { id: 'f2', client_name: 'Odonto Clean', value: 2500.00, due_date: '2026-05-10', paid: true, payment_method: 'Boleto', created_at: '2026-05-10T10:00:00Z' },
  { id: 'f3', client_name: 'Clínica Dermato Glow', value: 4500.00, due_date: '2026-06-15', paid: true, payment_method: 'Pix', created_at: '2026-06-15T10:00:00Z' },
  { id: 'f4', client_name: 'Odonto Clean', value: 2500.00, due_date: '2026-06-10', paid: false, payment_method: 'Boleto', created_at: '2026-06-10T10:00:00Z' },
  { id: 'f5', client_name: 'Clínica Dermato Glow', value: 4500.00, due_date: '2026-07-15', paid: false, payment_method: 'Pix', created_at: '2026-07-15T10:00:00Z' },
  { id: 'f6', client_name: 'Odonto Clean', value: 2500.00, due_date: '2026-07-10', paid: false, payment_method: 'Boleto', created_at: '2026-07-10T10:00:00Z' }
];

const INITIAL_TASKS = [
  { id: 't1', title: 'Criar novos criativos de Estética', description: 'Produzir 3 artes para feed e 2 stories patrocinados.', client_name: 'Clínica Dermato Glow', priority: 'Alta', due_date: '2026-06-20', status: 'Em Andamento', created_at: new Date().toISOString() },
  { id: 't2', title: 'Relatório de Performance Mensal', description: 'Extrair dados do Meta Ads e estruturar PDF de fechamento de Maio.', client_name: 'Odonto Clean', priority: 'Média', due_date: '2026-06-25', status: 'A Fazer', created_at: new Date().toISOString() },
  { id: 't3', title: 'Configuração de Pixel de Conversão', description: 'Ajustar rastreamento no novo site de agendamento.', client_name: 'Clínica Dermato Glow', priority: 'Alta', due_date: '2026-06-18', status: 'Concluído', created_at: new Date().toISOString() }
];

const INITIAL_EVENTS = [
  { id: 'e1', title: 'Alinhamento Mensal Dermato Glow', type: 'Reunião', date_time: '2026-06-18T14:00:00.000Z', description: 'Apresentação de relatórios e novos criativos.' },
  { id: 'e2', title: 'Call de Diagnóstico - Lead Dr. Roberto', type: 'Call', date_time: '2026-06-19T10:30:00.000Z', description: 'Entender estrutura atual de captação do médico.' }
];

// Helper para inicializar LocalStorage se estiver vazio
const initLocalData = (key, initialData) => {
  if (!localStorage.getItem(`axon_${key}`)) {
    localStorage.setItem(`axon_${key}`, JSON.stringify(initialData));
  }
};

initLocalData('leads', INITIAL_LEADS);
initLocalData('clients', INITIAL_CLIENTS);
initLocalData('financials', INITIAL_FINANCIALS);
initLocalData('tasks', INITIAL_TASKS);
initLocalData('events', INITIAL_EVENTS);

// Simulação de latência de rede para experiência UX premium com loaders
const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

export const dbService = {
  // Flag indicando se está usando Supabase real ou LocalStorage
  isUsingSupabase: isSupabaseConfigured,

  // --- LEADS (CRM) ---
  async getLeads() {
    await delay();
    if (this.isUsingSupabase) {
      try {
        const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Erro ao carregar do Supabase. Utilizando fallback LocalStorage.', err);
      }
    }
    return JSON.parse(localStorage.getItem('axon_leads') || '[]');
  },

  async saveLead(lead) {
    await delay();
    if (this.isUsingSupabase) {
      try {
        const leadData = { ...lead };
        // Remover ID se for string mock temporária para evitar problemas UUID
        if (leadData.id && leadData.id.startsWith('l')) {
          delete leadData.id;
        }
        const { data, error } = await supabase.from('leads').upsert(leadData).select().single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Erro ao salvar no Supabase. Utilizando fallback LocalStorage.', err);
      }
    }
    const leads = JSON.parse(localStorage.getItem('axon_leads') || '[]');
    if (lead.id) {
      const idx = leads.findIndex(l => l.id === lead.id);
      if (idx !== -1) {
        leads[idx] = { ...leads[idx], ...lead };
      } else {
        leads.push(lead);
      }
    } else {
      lead.id = 'lead_' + Math.random().toString(36).substr(2, 9);
      lead.created_at = new Date().toISOString();
      leads.push(lead);
    }
    localStorage.setItem('axon_leads', JSON.stringify(leads));
    return lead;
  },

  async deleteLead(id) {
    await delay();
    if (this.isUsingSupabase) {
      try {
        const { error } = await supabase.from('leads').delete().eq('id', id);
        if (error) throw error;
        return true;
      } catch (err) {
        console.warn('Erro ao deletar no Supabase. Utilizando fallback LocalStorage.', err);
      }
    }
    const leads = JSON.parse(localStorage.getItem('axon_leads') || '[]');
    const filtered = leads.filter(l => l.id !== id);
    localStorage.setItem('axon_leads', JSON.stringify(filtered));
    return true;
  },

  // --- CLIENTS ---
  async getClients() {
    await delay();
    if (this.isUsingSupabase) {
      try {
        const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Erro ao carregar do Supabase. Utilizando fallback LocalStorage.', err);
      }
    }
    return JSON.parse(localStorage.getItem('axon_clients') || '[]');
  },

  async saveClient(client) {
    await delay();
    if (this.isUsingSupabase) {
      try {
        const clientData = { ...client };
        if (clientData.id && clientData.id.startsWith('c')) {
          delete clientData.id;
        }
        const { data, error } = await supabase.from('clients').upsert(clientData).select().single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Erro ao salvar no Supabase. Utilizando fallback LocalStorage.', err);
      }
    }
    const clients = JSON.parse(localStorage.getItem('axon_clients') || '[]');
    if (client.id) {
      const idx = clients.findIndex(c => c.id === client.id);
      if (idx !== -1) {
        clients[idx] = { ...clients[idx], ...client };
      } else {
        clients.push(client);
      }
    } else {
      client.id = 'client_' + Math.random().toString(36).substr(2, 9);
      client.created_at = new Date().toISOString();
      clients.push(client);
    }
    localStorage.setItem('axon_clients', JSON.stringify(clients));
    return client;
  },

  async deleteClient(id) {
    await delay();
    if (this.isUsingSupabase) {
      try {
        const { error } = await supabase.from('clients').delete().eq('id', id);
        if (error) throw error;
        return true;
      } catch (err) {
        console.warn('Erro ao deletar no Supabase. Utilizando fallback LocalStorage.', err);
      }
    }
    const clients = JSON.parse(localStorage.getItem('axon_clients') || '[]');
    const filtered = clients.filter(c => c.id !== id);
    localStorage.setItem('axon_clients', JSON.stringify(filtered));
    return true;
  },

  // --- FINANCIALS ---
  async getFinancials() {
    await delay();
    if (this.isUsingSupabase) {
      try {
        const { data, error } = await supabase.from('financials').select('*').order('due_date', { ascending: true });
        if (error) throw error;
        return data.map(f => ({ ...f, value: Number(f.value) }));
      } catch (err) {
        console.warn('Erro ao carregar do Supabase. Utilizando fallback LocalStorage.', err);
      }
    }
    return JSON.parse(localStorage.getItem('axon_financials') || '[]').map(f => ({ ...f, value: Number(f.value) }));
  },

  async saveFinancial(financial) {
    await delay();
    if (this.isUsingSupabase) {
      try {
        const finData = { ...financial };
        if (finData.id && finData.id.startsWith('f')) {
          delete finData.id;
        }
        const { data, error } = await supabase.from('financials').upsert(finData).select().single();
        if (error) throw error;
        return { ...data, value: Number(data.value) };
      } catch (err) {
        console.warn('Erro ao salvar no Supabase. Utilizando fallback LocalStorage.', err);
      }
    }
    const financials = JSON.parse(localStorage.getItem('axon_financials') || '[]');
    if (financial.id) {
      const idx = financials.findIndex(f => f.id === financial.id);
      if (idx !== -1) {
        financials[idx] = { ...financials[idx], ...financial, value: Number(financial.value) };
      } else {
        financials.push(financial);
      }
    } else {
      financial.id = 'fin_' + Math.random().toString(36).substr(2, 9);
      financial.created_at = new Date().toISOString();
      financials.push({ ...financial, value: Number(financial.value) });
    }
    localStorage.setItem('axon_financials', JSON.stringify(financials));
    return financial;
  },

  async deleteFinancial(id) {
    await delay();
    if (this.isUsingSupabase) {
      try {
        const { error } = await supabase.from('financials').delete().eq('id', id);
        if (error) throw error;
        return true;
      } catch (err) {
        console.warn('Erro ao deletar no Supabase. Utilizando fallback LocalStorage.', err);
      }
    }
    const financials = JSON.parse(localStorage.getItem('axon_financials') || '[]');
    const filtered = financials.filter(f => f.id !== id);
    localStorage.setItem('axon_financials', JSON.stringify(filtered));
    return true;
  },

  // --- TASKS ---
  async getTasks() {
    await delay();
    if (this.isUsingSupabase) {
      try {
        const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Erro ao carregar do Supabase. Utilizando fallback LocalStorage.', err);
      }
    }
    return JSON.parse(localStorage.getItem('axon_tasks') || '[]');
  },

  async saveTask(task) {
    await delay();
    if (this.isUsingSupabase) {
      try {
        const taskData = { ...task };
        if (taskData.id && taskData.id.startsWith('t')) {
          delete taskData.id;
        }
        const { data, error } = await supabase.from('tasks').upsert(taskData).select().single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Erro ao salvar no Supabase. Utilizando fallback LocalStorage.', err);
      }
    }
    const tasks = JSON.parse(localStorage.getItem('axon_tasks') || '[]');
    if (task.id) {
      const idx = tasks.findIndex(t => t.id === task.id);
      if (idx !== -1) {
        tasks[idx] = { ...tasks[idx], ...task };
      } else {
        tasks.push(task);
      }
    } else {
      task.id = 'task_' + Math.random().toString(36).substr(2, 9);
      task.created_at = new Date().toISOString();
      tasks.push(task);
    }
    localStorage.setItem('axon_tasks', JSON.stringify(tasks));
    return task;
  },

  async deleteTask(id) {
    await delay();
    if (this.isUsingSupabase) {
      try {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (error) throw error;
        return true;
      } catch (err) {
        console.warn('Erro ao deletar no Supabase. Utilizando fallback LocalStorage.', err);
      }
    }
    const tasks = JSON.parse(localStorage.getItem('axon_tasks') || '[]');
    const filtered = tasks.filter(t => t.id !== id);
    localStorage.setItem('axon_tasks', JSON.stringify(filtered));
    return true;
  },

  // --- AGENDA / EVENTS ---
  async getEvents() {
    await delay();
    if (this.isUsingSupabase) {
      try {
        const { data, error } = await supabase.from('events').select('*').order('date_time', { ascending: true });
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Erro ao carregar do Supabase. Utilizando fallback LocalStorage.', err);
      }
    }
    return JSON.parse(localStorage.getItem('axon_events') || '[]');
  },

  async saveEvent(event) {
    await delay();
    if (this.isUsingSupabase) {
      try {
        const eventData = { ...event };
        if (eventData.id && eventData.id.startsWith('e')) {
          delete eventData.id;
        }
        const { data, error } = await supabase.from('events').upsert(eventData).select().single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn('Erro ao salvar no Supabase. Utilizando fallback LocalStorage.', err);
      }
    }
    const events = JSON.parse(localStorage.getItem('axon_events') || '[]');
    if (event.id) {
      const idx = events.findIndex(e => e.id === event.id);
      if (idx !== -1) {
        events[idx] = { ...events[idx], ...event };
      } else {
        events.push(event);
      }
    } else {
      event.id = 'event_' + Math.random().toString(36).substr(2, 9);
      event.created_at = new Date().toISOString();
      events.push(event);
    }
    localStorage.setItem('axon_events', JSON.stringify(events));
    return event;
  },

  async deleteEvent(id) {
    await delay();
    if (this.isUsingSupabase) {
      try {
        const { error } = await supabase.from('events').delete().eq('id', id);
        if (error) throw error;
        return true;
      } catch (err) {
        console.warn('Erro ao deletar no Supabase. Utilizando fallback LocalStorage.', err);
      }
    }
    const events = JSON.parse(localStorage.getItem('axon_events') || '[]');
    const filtered = events.filter(e => e.id !== id);
    localStorage.setItem('axon_events', JSON.stringify(filtered));
    return true;
  }
};
