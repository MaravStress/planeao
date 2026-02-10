import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Calendar, Timer, CheckSquare, Settings, DollarSign } from 'lucide-react';
import '../styles/Layout.css';

const MainLayout: React.FC = () => {
  return (
    <div className="app-container">
      <aside className="sidebar glass-panel">
        <div className="logo-container">
          <h2>Planeao</h2>
        </div>
        <nav className="nav-menu">
          <NavLink
            to="/"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            end
          >
            <Calendar size={24} />
            <span>Calendario</span>
          </NavLink>
          <NavLink
            to="/pomodoro"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Timer size={24} />
            <span>Pomodoro</span>
          </NavLink>
          <NavLink
            to="/habits"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <CheckSquare size={24} />
            <span>Hábitos</span>
          </NavLink>
          <NavLink
            to="/finances"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <DollarSign size={24} />
            <span>Finanzas</span>
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Settings size={24} />
            <span>Ajustes</span>
          </NavLink>
        </nav>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
