import React, { useState } from 'react'
import { Plus, ChevronLeft, ChevronRight, Calendar, Clock, MapPin, AlignLeft, Trash2 } from 'lucide-react'
import Modal from '../components/Modal'

export default function AgendaView({ events = [], onSaveEvent, onDeleteEvent }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Controle de Navegação de Mês
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Campos de Formulário
  const [formData, setFormData] = useState({
    title: '',
    type: 'Call',
    date_time: '',
    description: ''
  });

  const types = ['Reunião', 'Call', 'Entrega', 'Follow-up'];

  const handleOpenAddModal = (dateStr) => {
    // Definir data padrão no input datetime-local
    let defaultDateTime = '';
    if (dateStr) {
      // Usar a data do dia clicado com horário padrão de 10:00
      defaultDateTime = `${dateStr}T10:00`;
    } else {
      defaultDateTime = new Date().toISOString().slice(0, 16);
    }

    setFormData({
      title: '',
      type: 'Call',
      date_time: defaultDateTime,
      description: ''
    });
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (event) => {
    setSelectedEvent(event);
    
    // Converter data ISO para formato do input datetime-local (YYYY-MM-DDTHH:MM)
    let formattedDateTime = '';
    if (event.date_time) {
      const d = new Date(event.date_time);
      // Ajustar timezone offset local
      const offset = d.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(d.getTime() - offset)).toISOString().slice(0, 16);
      formattedDateTime = localISOTime;
    }

    setFormData({
      id: event.id,
      title: event.title || '',
      type: event.type || 'Call',
      date_time: formattedDateTime,
      description: event.description || ''
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.date_time) return;

    // Converter para string ISO completa para persistência no banco
    const isoDateTime = new Date(formData.date_time).toISOString();
    
    onSaveEvent({
      ...formData,
      date_time: isoDateTime
    });
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (selectedEvent && window.confirm(`Deseja cancelar o compromisso "${selectedEvent.title}"?`)) {
      onDeleteEvent(selectedEvent.id);
      setIsModalOpen(false);
    }
  };

  // --- Lógica de Geração do Calendário Mensal ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Obter primeiro dia do mês e total de dias
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Domingo) a 6 (Sábado)
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Gerar dias para grid do calendário
  const daysGrid = [];
  
  // Dias em branco do mês anterior para alinhar o primeiro dia
  for (let i = 0; i < firstDayOfMonth; i++) {
    daysGrid.push({ isBlank: true });
  }

  // Dias reais do mês
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Filtrar compromissos deste dia específico
    const dayEvents = events.filter(event => {
      if (!event.date_time) return false;
      const eventDate = new Date(event.date_time);
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === month &&
        eventDate.getFullYear() === year
      );
    }).sort((a, b) => new Date(a.date_time) - new Date(b.date_time));

    daysGrid.push({
      day,
      dateStr,
      events: dayEvents,
      isToday: 
        day === new Date().getDate() &&
        month === new Date().getMonth() &&
        year === new Date().getFullYear()
    });
  }

  // --- Estilos Específicos do Calendário ---
  const styles = `
  .calendar-wrapper {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  .calendar-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid var(--border-subtle);
  }
  
  .calendar-month-title {
    font-family: var(--font-heading);
    font-size: 1.25rem;
    font-weight: 700;
  }
  
  .calendar-grid-header {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    background-color: var(--bg-tertiary);
    border-bottom: 1px solid var(--border-subtle);
  }
  
  .calendar-weekday {
    padding: 12px 0;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--text-secondary);
    letter-spacing: 0.05em;
  }
  
  .calendar-grid-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
  }
  
  .calendar-day-cell {
    border-right: 1px solid var(--border-subtle);
    border-bottom: 1px solid var(--border-subtle);
    min-height: 110px;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 6px;
    background-color: var(--bg-secondary);
    transition: background-color var(--transition-fast);
  }
  
  .calendar-day-cell:nth-child(7n) {
    border-right: none;
  }
  
  .calendar-day-cell:hover:not(.blank-cell) {
    background-color: rgba(255, 255, 255, 0.005);
    cursor: pointer;
  }
  
  .blank-cell {
    background-color: rgba(0, 0, 0, 0.2);
  }
  
  .day-number {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-secondary);
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-full);
  }
  
  .calendar-day-cell.today .day-number {
    background-color: var(--text-primary);
    color: var(--bg-primary);
  }
  
  .day-events-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    overflow-y: auto;
    flex: 1;
  }
  
  .calendar-event-indicator {
    font-size: 0.72rem;
    padding: 3px 6px;
    background-color: var(--bg-tertiary);
    border: 1px solid var(--border-main);
    border-radius: var(--radius-sm);
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
    text-align: left;
  }
  
  .calendar-event-indicator:hover {
    border-color: var(--text-secondary);
  }
  
  /* Indicadores visuais do tipo de compromisso */
  .event-tag {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: var(--radius-full);
    margin-right: 6px;
    background-color: var(--text-secondary);
  }
  
  .event-tag.Reunião { background-color: #ffffff; }
  .event-tag.Call { background-color: #a3a3a3; }
  .event-tag.Entrega { background-color: #ffffff; border: 1px solid #a3a3a3; }
  .event-tag.Follow-up { background-color: #525252; }

  /* Lista de Agenda para Mobile */
  .mobile-agenda-list {
    display: none;
    flex-direction: column;
    gap: 12px;
  }

  .mobile-event-card {
    background-color: var(--bg-secondary);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  @media (max-width: 768px) {
    .calendar-grid-days, .calendar-grid-header {
      display: none;
    }
    .calendar-wrapper {
      border: none;
    }
    .calendar-controls {
      padding: 12px 0;
    }
    .mobile-agenda-list {
      display: flex;
    }
  }
  `

  return (
    <div className="view-container">
      <style>{styles}</style>
      
      {/* Cabeçalho */}
      <div className="view-header">
        <div className="view-title-container">
          <h1 className="view-title">Agenda</h1>
          <p className="view-subtitle">Calendário interno para registro de reuniões, calls de diagnóstico, follow-ups e entregas.</p>
        </div>
        <div className="view-actions">
          <button className="btn btn-primary" onClick={() => handleOpenAddModal()}>
            <Plus size={16} strokeWidth={2} />
            <span>Novo Evento</span>
          </button>
        </div>
      </div>

      {/* Calendário */}
      <div className="calendar-wrapper">
        <div className="calendar-controls">
          <h2 className="calendar-month-title">
            {monthNames[month]} {year}
          </h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-icon" onClick={prevMonth} aria-label="Mês anterior">
              <ChevronLeft size={18} />
            </button>
            <button className="btn-icon" onClick={nextMonth} aria-label="Próximo mês">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Header dos Dias da Semana */}
        <div className="calendar-grid-header">
          <div className="calendar-weekday">Dom</div>
          <div className="calendar-weekday">Seg</div>
          <div className="calendar-weekday">Ter</div>
          <div className="calendar-weekday">Qua</div>
          <div className="calendar-weekday">Qui</div>
          <div className="calendar-weekday">Sex</div>
          <div className="calendar-weekday">Sáb</div>
        </div>

        {/* Grid do Calendário */}
        <div className="calendar-grid-days">
          {daysGrid.map((cell, idx) => {
            if (cell.isBlank) {
              return <div key={`blank-${idx}`} className="calendar-day-cell blank-cell" />;
            }

            return (
              <div 
                key={cell.dateStr} 
                className={`calendar-day-cell ${cell.isToday ? 'today' : ''}`}
                onClick={(e) => {
                  // Só abrir add modal se clicou no espaço vazio da célula, não no indicador de evento
                  if (e.target.closest('.calendar-event-indicator') === null) {
                    handleOpenAddModal(cell.dateStr);
                  }
                }}
              >
                <span className="day-number">{cell.day}</span>
                <div className="day-events-list">
                  {cell.events.map((event) => (
                    <button
                      key={event.id}
                      className="calendar-event-indicator"
                      onClick={() => handleOpenEditModal(event)}
                      title={`${event.type}: ${event.title}`}
                    >
                      <span className={`event-tag ${event.type}`} />
                      {new Date(event.date_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} — {event.title}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visualização de Agenda para Celular */}
      <div className="mobile-agenda-list">
        <h3 style={{ fontSize: '1.1rem', marginBottom: 4 }}>Compromissos Agendados</h3>
        {events.length > 0 ? (
          events
            .filter(event => new Date(event.date_time) >= new Date().setHours(0,0,0,0))
            .sort((a, b) => new Date(a.date_time) - new Date(b.date_time))
            .map((event) => (
              <div key={event.id} className="mobile-event-card" onClick={() => handleOpenEditModal(event)}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className={`event-tag ${event.type}`} style={{ margin: 0 }} />
                    {event.title}
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Calendar size={12} />
                      {new Date(event.date_time).toLocaleDateString('pt-BR')}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} />
                      {new Date(event.date_time).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                <span className="badge" style={{ fontSize: '0.65rem' }}>{event.type}</span>
              </div>
            ))
        ) : (
          <div className="empty-state" style={{ padding: '32px 16px' }}>
            <span style={{ fontSize: '0.85rem' }}>Nenhum compromisso futuro</span>
          </div>
        )}
      </div>

      {/* Modal CRUD Evento */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedEvent ? 'Detalhes do Compromisso' : 'Novo Compromisso'}
        footer={
          <div style={{ display: 'flex', width: '100%', justifySelf: 'stretch', justifyContent: 'space-between' }}>
            {selectedEvent && (
              <button className="btn btn-danger" type="button" onClick={handleDelete}>
                <Trash2 size={16} />
                <span>Cancelar</span>
              </button>
            )}
            <div style={{ display: 'flex', gap: 12, marginLeft: 'auto' }}>
              <button className="btn btn-secondary" type="button" onClick={() => setIsModalOpen(false)}>
                Fechar
              </button>
              <button className="btn btn-primary" type="submit" form="eventForm">
                Salvar
              </button>
            </div>
          </div>
        }
      >
        <form id="eventForm" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label htmlFor="title">Título do Compromisso *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Ex: Call de Alinhamento"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label htmlFor="type">Tipo de Evento</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
              >
                {types.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="date_time">Data e Hora *</label>
              <input
                type="datetime-local"
                id="date_time"
                name="date_time"
                value={formData.date_time}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="description">Descrição / Notas</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Pauta da reunião, link da sala Zoom/Meet, etc..."
              rows={4}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}
