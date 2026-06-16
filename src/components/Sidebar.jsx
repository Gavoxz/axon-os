import React from 'react'
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  DollarSign, 
  CheckSquare, 
  Calendar, 
  TrendingUp, 
  Database,
  CloudLightning,
  CloudOff
} from 'lucide-react'

// Estilos específicos da Sidebar (incorporados no componente para isolamento e robustez)
const styles = `
.sidebar {
  width: 260px;
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 32px 16px;
  justify-content: space-between;
  transition: width var(--transition-normal);
}

.brand-container {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 12px 32px 12px;
  border-bottom: 1px solid var(--border-subtle);
}

.brand-logo {
  width: 28px;
  height: 28px;
  background-color: var(--text-primary);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--bg-primary);
  font-family: var(--font-heading);
  font-weight: 800;
  font-size: 1rem;
}

.brand-name {
  font-family: var(--font-heading);
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  list-style: none;
  margin-top: 24px;
  flex: 1;
}

.nav-item-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 0.95rem;
  font-weight: 500;
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  text-align: left;
  transition: all var(--transition-fast);
}

.nav-item-btn:hover {
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
}

.nav-item-btn.active {
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
  border-color: var(--border-subtle);
  font-weight: 600;
}

.sync-status {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  font-size: 0.8rem;
  color: var(--text-secondary);
}

.sync-indicator {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
}

.sync-indicator.synced {
  background-color: var(--text-primary);
  box-shadow: 0 0 8px var(--text-primary);
}

.sync-indicator.local {
  background-color: #525252;
}

/* Bottom Nav para Mobile */
.bottom-nav {
  display: none;
  background-color: var(--bg-secondary);
  border-top: 1px solid var(--border-subtle);
  width: 100%;
  height: 64px;
  position: relative;
  z-index: 10;
}

.bottom-nav-list {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 100%;
  list-style: none;
  overflow-x: auto;
  padding: 0 8px;
  gap: 4px;
  -webkit-overflow-scrolling: touch;
}

.bottom-nav-list::-webkit-scrollbar {
  display: none; /* Esconder barra de rolagem na navegação debaixo */
}

.bottom-nav-item-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 12px;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  font-size: 0.7rem;
  font-weight: 500;
  cursor: pointer;
  min-width: 60px;
  transition: color var(--transition-fast);
}

.bottom-nav-item-btn.active {
  color: var(--text-primary);
  font-weight: 600;
}

@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
  .bottom-nav {
    display: block;
  }
}
`

export default function Sidebar({ activeView, onViewChange, isUsingSupabase }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'crm', label: 'CRM', icon: Users },
    { id: 'clients', label: 'Clientes', icon: Briefcase },
    { id: 'financial', label: 'Financeiro', icon: DollarSign },
    { id: 'tasks', label: 'Tarefas', icon: CheckSquare },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'pipeline', label: 'Pipeline', icon: TrendingUp },
  ];

  return (
    <>
      <style>{styles}</style>
      
      {/* Sidebar para Desktop */}
      <aside className="sidebar">
        <div>
          <div className="brand-container">
            <div className="brand-logo">A</div>
            <span className="brand-name">AXON OS</span>
          </div>
          
          <ul className="nav-list">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button 
                    onClick={() => onViewChange(item.id)}
                    className={`nav-item-btn ${activeView === item.id ? 'active' : ''}`}
                  >
                    <Icon size={18} strokeWidth={2} />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="sync-status">
          {isUsingSupabase ? (
            <>
              <CloudLightning size={16} strokeWidth={2} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Supabase</div>
                <div style={{ fontSize: '0.7rem' }}>Sincronização Ativa</div>
              </div>
              <div className="sync-indicator synced" />
            </>
          ) : (
            <>
              <CloudOff size={16} strokeWidth={2} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Local Storage</div>
                <div style={{ fontSize: '0.7rem' }}>Modo Offline/Fallback</div>
              </div>
              <div className="sync-indicator local" />
            </>
          )}
        </div>
      </aside>

      {/* Bottom Nav para Mobile */}
      <nav className="bottom-nav">
        <ul className="bottom-nav-list">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`bottom-nav-item-btn ${activeView === item.id ? 'active' : ''}`}
                >
                  <Icon size={20} strokeWidth={2} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
