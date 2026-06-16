import React, { useState } from 'react'
import { Plus, Phone, MessageSquare, Instagram, Mail, Info, FileText, Trash } from 'lucide-react'
import Kanban from '../components/Kanban'
import Modal from '../components/Modal'

export default function CRMView({ leads = [], onSaveLead, onDeleteLead }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  
  // Estado para os campos do formulário
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    phone: '',
    whatsapp: '',
    instagram: '',
    email: '',
    origin: 'Instagram',
    notes: '',
    status: 'Novo Lead'
  });

  const columns = [
    'Novo Lead',
    'Contato Feito',
    'Reunião Agendada',
    'Proposta Enviada',
    'Negociação',
    'Fechado',
    'Perdido'
  ];

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      company: '',
      phone: '',
      whatsapp: '',
      instagram: '',
      email: '',
      origin: 'Instagram',
      notes: '',
      status: 'Novo Lead'
    });
    setSelectedLead(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (lead) => {
    setSelectedLead(lead);
    setFormData({
      id: lead.id,
      name: lead.name || '',
      company: lead.company || '',
      phone: lead.phone || '',
      whatsapp: lead.whatsapp || '',
      instagram: lead.instagram || '',
      email: lead.email || '',
      origin: lead.origin || 'Instagram',
      notes: lead.notes || '',
      status: lead.status || 'Novo Lead'
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSaveLead(formData);
    setIsModalOpen(false);
  };

  const handleCardDrop = (cardId, newStatus) => {
    const lead = leads.find(l => l.id === cardId);
    if (lead && lead.status !== newStatus) {
      onSaveLead({ ...lead, status: newStatus });
    }
  };

  const handleDelete = () => {
    if (selectedLead && window.confirm(`Deseja realmente deletar o lead "${selectedLead.name}"?`)) {
      onDeleteLead(selectedLead.id);
      setIsModalOpen(false);
    }
  };

  // Renderizador customizado do conteúdo do cartão do Lead no Kanban
  const renderLeadCard = (lead) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className="flex-between">
          <span className="kanban-card-title">{lead.name}</span>
        </div>
        {lead.company && <span className="kanban-card-company">{lead.company}</span>}
        {lead.notes && (
          <p className="kanban-card-desc" style={{ marginTop: 2 }}>{lead.notes}</p>
        )}
        
        <div style={{ display: 'flex', gap: 8, marginTop: 4, color: 'var(--text-muted)' }}>
          {lead.whatsapp && <MessageSquare size={12} title={lead.whatsapp} />}
          {lead.instagram && <Instagram size={12} title={lead.instagram} />}
          {lead.email && <Mail size={12} title={lead.email} />}
          {lead.origin && (
            <span style={{ 
              marginLeft: 'auto', 
              fontSize: '0.65rem', 
              padding: '1px 6px', 
              backgroundColor: 'var(--bg-secondary)', 
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)'
            }}>
              {lead.origin}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="view-container" style={{ height: '100%' }}>
      {/* Cabeçalho */}
      <div className="view-header">
        <div className="view-title-container">
          <h1 className="view-title">CRM</h1>
          <p className="view-subtitle">Gerenciamento do funil comercial e prospecção ativa de novas clínicas.</p>
        </div>
        <div className="view-actions">
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <Plus size={16} strokeWidth={2} />
            <span>Novo Lead</span>
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Kanban
          columns={columns}
          cards={leads}
          onCardDrop={handleCardDrop}
          onCardClick={handleOpenEditModal}
          renderCardContent={renderLeadCard}
        />
      </div>

      {/* Modal de Adicionar/Editar Lead */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedLead ? 'Detalhes do Lead' : 'Novo Lead'}
        footer={
          <div style={{ display: 'flex', width: '100%', justifySelf: 'stretch', justifyContent: 'space-between' }}>
            {selectedLead && (
              <button className="btn btn-danger" type="button" onClick={handleDelete}>
                <Trash size={16} />
                <span>Excluir</span>
              </button>
            )}
            <div style={{ display: 'flex', gap: 12, marginLeft: 'auto' }}>
              <button className="btn btn-secondary" type="button" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" type="submit" form="leadForm">
                Salvar
              </button>
            </div>
          </div>
        }
      >
        <form id="leadForm" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label htmlFor="name">Nome do Contato *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ex: Dr. Roberto Silva"
              required
            />
          </div>

          <div>
            <label htmlFor="company">Clínica / Empresa</label>
            <input
              type="text"
              id="company"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              placeholder="Ex: Silva Cardio Clínicas"
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
                placeholder="Ex: (11) 99999-9999"
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
                placeholder="Ex: (11) 99999-9999"
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
                placeholder="Ex: @robertosilva.cardio"
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
                placeholder="Ex: roberto@silvacardio.com.br"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label htmlFor="origin">Origem do Lead</label>
              <select
                id="origin"
                name="origin"
                value={formData.origin}
                onChange={handleInputChange}
              >
                <option value="Instagram">Instagram</option>
                <option value="Google Ads">Google Ads</option>
                <option value="Indicação">Indicação</option>
                <option value="Outbound">Outbound / Prospecção</option>
                <option value="Site/Organic">Site / Orgânico</option>
              </select>
            </div>
            <div>
              <label htmlFor="status">Status Comercial</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
              >
                {columns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="notes">Observações</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Digite históricos de reuniões, propostas feitas, etc."
              rows={4}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
