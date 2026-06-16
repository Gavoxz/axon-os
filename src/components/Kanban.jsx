import React, { useState } from 'react'

const styles = `
.kanban-container {
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding-bottom: 16px;
  height: 100%;
  align-items: flex-start;
  -webkit-overflow-scrolling: touch;
}

.kanban-column {
  flex: 0 0 280px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  max-height: 100%;
  transition: border-color var(--transition-fast), background-color var(--transition-fast);
}

.kanban-column.drag-over {
  border-color: var(--text-primary);
  background-color: rgba(255, 255, 255, 0.015);
}

.kanban-column-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-subtle);
}

.kanban-column-title {
  font-family: var(--font-heading);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
}

.kanban-column-count {
  font-size: 0.75rem;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-main);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  color: var(--text-secondary);
}

.kanban-cards-list {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  flex: 1;
  min-height: 150px;
}

.kanban-card {
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-main);
  border-radius: var(--radius-md);
  padding: 14px;
  cursor: grab;
  transition: all var(--transition-fast);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.kanban-card:active {
  cursor: grabbing;
}

.kanban-card.dragging {
  opacity: 0.4;
  transform: scale(0.98);
  border-style: dashed;
}

.kanban-card:hover {
  border-color: var(--text-secondary);
}

.kanban-card-title {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-primary);
  line-height: 1.3;
}

.kanban-card-company {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.kanban-card-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.kanban-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 4px;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.priority-indicator {
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.priority-indicator.Alta {
  background-color: #331313;
  color: #ff8888;
  border: 1px solid #592020;
}

.priority-indicator.Média {
  background-color: #262626;
  color: #a3a3a3;
  border: 1px solid #404040;
}

.priority-indicator.Baixa {
  background-color: #121212;
  color: #737373;
  border: 1px solid #262626;
}
`

export default function Kanban({ columns = [], cards = [], onCardDrop, onCardClick, renderCardContent }) {
  const [draggedCardId, setDraggedCardId] = useState(null);
  const [activeColumnId, setActiveColumnId] = useState(null);

  const handleDragStart = (e, cardId) => {
    setDraggedCardId(cardId);
    e.dataTransfer.setData('text/plain', cardId);
    // Adicionar classe dragging após pequeno delay para manter imagem fantasma visível
    setTimeout(() => {
      e.target.classList.add('dragging');
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('dragging');
    setDraggedCardId(null);
    setActiveColumnId(null);
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    if (activeColumnId !== columnId) {
      setActiveColumnId(columnId);
    }
  };

  const handleDragLeave = () => {
    setActiveColumnId(null);
  };

  const handleDrop = (e, columnId) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain') || draggedCardId;
    if (cardId && onCardDrop) {
      onCardDrop(cardId, columnId);
    }
    setDraggedCardId(null);
    setActiveColumnId(null);
  };

  return (
    <>
      <style>{styles}</style>
      <div className="kanban-container">
        {columns.map((column) => {
          // Filtrar os cards pertencentes a esta coluna
          const columnCards = cards.filter(card => card.status === column);

          return (
            <div
              key={column}
              className={`kanban-column ${activeColumnId === column ? 'drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, column)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column)}
            >
              <div className="kanban-column-header">
                <span className="kanban-column-title">{column}</span>
                <span className="kanban-column-count">{columnCards.length}</span>
              </div>
              
              <div className="kanban-cards-list">
                {columnCards.map((card) => (
                  <div
                    key={card.id}
                    className={`kanban-card ${draggedCardId === card.id ? 'dragging' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, card.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onCardClick && onCardClick(card)}
                  >
                    {renderCardContent ? (
                      renderCardContent(card)
                    ) : (
                      // Render padrão minimalista
                      <>
                        <span className="kanban-card-title">{card.title || card.name}</span>
                        {card.company && <span className="kanban-card-company">{card.company}</span>}
                        {card.description && <span className="kanban-card-desc">{card.description}</span>}
                      </>
                    )}
                  </div>
                ))}

                {columnCards.length === 0 && (
                  <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', padding: '24px 0' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      Solte cards aqui
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
