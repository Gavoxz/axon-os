import React, { useState } from 'react'
import { Plus, Check, Clock, AlertTriangle, Calendar, Trash2 } from 'lucide-react'
import Kanban from '../components/Kanban'
import Modal from '../components/Modal'

export default function TasksView({ tasks = [], clients = [], onSaveTask, onDeleteTask }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    client_name: '',
    priority: 'Média',
    due_date: '',
    status: 'A Fazer'
  });

  const columns = ['A Fazer', 'Em Andamento', 'Concluído'];

  const handleOpenAddModal = () => {
    setFormData({
      title: '',
      description: '',
      client_name: clients.length > 0 ? clients[0].name : '',
      priority: 'Média',
      due_date: new Date().toISOString().split('T')[0],
      status: 'A Fazer'
    });
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setSelectedTask(task);
    setFormData({
      id: task.id,
      title: task.title || '',
      description: task.description || '',
      client_name: task.client_name || '',
      priority: task.priority || 'Média',
      due_date: task.due_date || '',
      status: task.status || 'A Fazer'
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSaveTask(formData);
    setIsModalOpen(false);
  };

  const handleCardDrop = (cardId, newStatus) => {
    const task = tasks.find(t => t.id === cardId);
    if (task && task.status !== newStatus) {
      onSaveTask({ ...task, status: newStatus });
    }
  };

  const handleDelete = () => {
    if (selectedTask && window.confirm(`Deseja realmente excluir a tarefa "${selectedTask.title}"?`)) {
      onDeleteTask(selectedTask.id);
      setIsModalOpen(false);
    }
  };

  const renderTaskCard = (task) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div className="flex-between">
          <span className="kanban-card-title">{task.title}</span>
        </div>
        
        {task.client_name && (
          <span className="kanban-card-company" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
            {task.client_name}
          </span>
        )}

        {task.description && <p className="kanban-card-desc">{task.description}</p>}

        <div className="kanban-card-footer">
          <span className={`priority-indicator ${task.priority}`}>
            {task.priority}
          </span>
          {task.due_date && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={10} />
              {new Date(task.due_date).toLocaleDateString('pt-BR')}
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
          <h1 className="view-title">Tarefas</h1>
          <p className="view-subtitle">Gerenciador de entregas e cronograma interno de demandas operacionais.</p>
        </div>
        <div className="view-actions">
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <Plus size={16} strokeWidth={2} />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Kanban
          columns={columns}
          cards={tasks}
          onCardDrop={handleCardDrop}
          onCardClick={handleOpenEditModal}
          renderCardContent={renderTaskCard}
        />
      </div>

      {/* Modal CRUD Tarefa */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedTask ? 'Editar Tarefa' : 'Nova Tarefa'}
        footer={
          <div style={{ display: 'flex', width: '100%', justifySelf: 'stretch', justifyContent: 'space-between' }}>
            {selectedTask && (
              <button className="btn btn-danger" type="button" onClick={handleDelete}>
                <Trash2 size={16} />
                <span>Excluir</span>
              </button>
            )}
            <div style={{ display: 'flex', gap: 12, marginLeft: 'auto' }}>
              <button className="btn btn-secondary" type="button" onClick={() => setIsModalOpen(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" type="submit" form="taskForm">
                Salvar
              </button>
            </div>
          </div>
        }
      >
        <form id="taskForm" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label htmlFor="title">Título da Tarefa *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ex: Subir novos anúncios Meta Ads"
              required
            />
          </div>

          <div>
            <label htmlFor="client_name">Cliente Vinculado</label>
            {clients.length > 0 ? (
              <select
                id="client_name"
                name="client_name"
                value={formData.client_name}
                onChange={handleInputChange}
              >
                <option value="">Nenhum cliente (Geral)</option>
                {clients.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                id="client_name"
                name="client_name"
                value={formData.client_name}
                onChange={handleInputChange}
                placeholder="Ex: Clínica Dermato Glow"
              />
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label htmlFor="priority">Prioridade</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
            <div>
              <label htmlFor="due_date">Prazo Limite</label>
              <input
                type="date"
                id="due_date"
                name="due_date"
                value={formData.due_date}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div>
            <label htmlFor="status">Status</label>
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

          <div>
            <label htmlFor="description">Descrição</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Descreva o escopo da tarefa, entregáveis e checklists..."
              rows={4}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
