import React, { useState } from 'react'
import { Plus, Search, Edit2, Trash2, Globe, MessageSquare, Instagram, Mail, Info } from 'lucide-react'
import Modal from '../components/Modal'

export default function ClientsView({ clients = [], onSaveClient, onDeleteClient }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    responsible: '',
    phone: '',
    whatsapp: '',
    email: '',
    instagram: '',
    plan: '',
    monthly_value: '',
    start_date: '',
    renewal_date: '',
    notes: ''
  });

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      responsible: '',
      phone: '',
      whatsapp: '',
      email: '',
      instagram: '',
      plan: '',
      monthly_value: '',
      start_date: new Date().toISOString().split('T')[0],
      renewal_date: '',
      notes: ''
    });
    setSelectedClient(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (client) => {
    setSelectedClient(client);
    setFormData({
      id: client.id,
      name: client.name || '',
      responsible: client.responsible || '',
      phone: client.phone || '',
      whatsapp: client.whatsapp || '',
      email: client.email || '',
      instagram: client.instagram || '',
      plan: client.plan || '',
      monthly_value: client.monthly_value || '',
      start_date: client.start_date || '',
      renewal_date: client.renewal_date || '',
      notes: client.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.responsible.trim()) return;
    
    onSaveClient({
      ...formData,
      monthly_value: Number(formData.monthly_value)
    });
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (selectedClient && window.confirm(`Deseja realmente excluir o cliente "${selectedClient.name}"?`)) {
      onDeleteClient(selectedClient.id);
      setIsModalOpen(false);
    }
  };

  const filteredClients = clients.filter(client => {
    const search = searchTerm.toLowerCase();
    return (
      client.name?.toLowerCase().includes(search) ||
      client.responsible?.toLowerCase().includes(search) ||
      client.plan?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="view-container">
      {/* Cabeçalho */}
      <div className="view-header">
        <div className="view-title-container">
          <h1 className="view-title">Clientes</h1>
          <p className="view-subtitle">Controle de clínicas sob contrato ativo e recorrência de pagamentos.</p>
        </div>
        <div className="view-actions">
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <Plus size={16} strokeWidth={2} />
            <span>Novo Cliente</span>
          </button>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div style={{ display: 'flex', gap: 16, width: '100%', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search 
            size={16} 
            strokeWidth={2} 
            style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} 
          />
          <input
            type="text"
            placeholder="Buscar por clínica, responsável ou plano..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: 40 }}
          />
        </div>
      </div>

      {/* Lista de Clientes */}
      {filteredClients.length > 0 ? (
        <div className="table-container">
          <table className="axon-table">
            <thead>
              <tr>
                <th>Clínica</th>
                <th>Responsável</th>
                <th>Contato</th>
                <th>Plano</th>
                <th>Valor Mensal</th>
                <th>Início</th>
                <th style={{ width: 80 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id}>
                  <td style={{ fontWeight: 600 }}>{client.name}</td>
                  <td>{client.responsible}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, color: 'var(--text-secondary)' }}>
                      {client.whatsapp && <MessageSquare size={14} title={client.whatsapp} />}
                      {client.instagram && <Instagram size={14} title={client.instagram} />}
                      {client.email && <Mail size={14} title={client.email} />}
                    </div>
                  </td>
                  <td>{client.plan}</td>
                  <td style={{ fontWeight: 600 }}>
                    R$ {Number(client.monthly_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>
                    {client.start_date ? new Date(client.start_date).toLocaleDateString('pt-BR') : '-'}
                  </td>
                  <td>
                    <button 
                      className="btn-icon" 
                      onClick={() => handleOpenEditModal(client)}
                      title="Editar"
                    >
                      <Edit2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-state-title">Nenhum cliente cadastrado</div>
          <div className="empty-state-desc">
            Cadastre clínicas diretamente ou feche negociações pelo CRM para transformá-las em clientes.
          </div>
          <button className="btn btn-secondary" onClick={handleOpenAddModal}>
            Adicionar Primeiro Cliente
          </button>
        </div>
      )}

      {/* Modal de CRUD de Cliente */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedClient ? 'Editar Cliente' : 'Novo Cliente'}
        footer={
          <div style={{ display: 'flex', width: '100%', justifySelf: 'stretch', justifyContent: 'space-between' }}>
            {selectedClient && (
              <button className="btn btn-danger" type="button" onClick={handleDelete}>
                <Trash2 size={16} />
                <span>Excluir</span>
              </button>
            )}
            <div style={{ display: 'flex', gap: 12, marginLeft: 'auto' }}>
              <button className="btn btn-secondary" type="button" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" type="submit" form="clientForm">
                Salvar
              </button>
            </div>
          </div>
        }
      >
        <form id="clientForm" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label htmlFor="name">Nome da Clínica *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ex: Clínica Dermato Glow"
              required
            />
          </div>

          <div>
            <label htmlFor="responsible">Responsável Clínico *</label>
            <input
              type="text"
              id="responsible"
              name="responsible"
              value={formData.responsible}
              onChange={handleInputChange}
              placeholder="Ex: Dra. Patricia Lima"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label htmlFor="phone">Telefone</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Ex: (11) 91111-1111"
              />
            </div>
            <div>
              <label htmlFor="whatsapp">WhatsApp</label>
              <input
                type="text"
                id="whatsapp"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleInputChange}
                placeholder="Ex: (11) 91111-1111"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label htmlFor="instagram">Instagram</label>
              <input
                type="text"
                id="instagram"
                name="instagram"
                value={formData.instagram}
                onChange={handleInputChange}
                placeholder="Ex: @dermatoglow"
              />
            </div>
            <div>
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Ex: patricia@dermatoglow.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="plan">Plano Contratado</label>
            <input
              type="text"
              id="plan"
              name="plan"
              value={formData.plan}
              onChange={handleInputChange}
              placeholder="Ex: Tráfego Pago + Social Media"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 12 }}>
            <div>
              <label htmlFor="monthly_value">Valor Mensal (R$)</label>
              <input
                type="number"
                id="monthly_value"
                name="monthly_value"
                value={formData.monthly_value}
                onChange={handleInputChange}
                placeholder="Ex: 4500"
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label htmlFor="start_date">Data de Início</label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                value={formData.start_date}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="renewal_date">Renovação</label>
              <input
                type="date"
                id="renewal_date"
                name="renewal_date"
                value={formData.renewal_date}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="notes">Observações</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Notas gerais, links de pastas de criativos, senhas compartilhadas, etc."
              rows={4}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
