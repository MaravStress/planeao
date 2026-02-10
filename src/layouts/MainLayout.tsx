import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Calendar, Timer, CheckSquare, Settings, DollarSign, Briefcase, Lightbulb } from 'lucide-react';
import '../styles/Layout.css';
import '../styles/SidebarTimer.css';

import { usePomodoro } from '../context/PomodoroContext';

const MainLayout: React.FC = () => {
  const { timeLeft, isActive: isTimerActive, mode } = usePomodoro();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' + mins : mins}:${secs < 10 ? '0' + secs : secs}`;
  };

  return (
    <div className="app-container">
      <aside className="sidebar glass-panel">
        <div className="logo-container">
          <h2>Planeao</h2>
        </div>
        <nav className="nav-menu">
          <NavLink
            to="/work"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Briefcase size={24} />
            <span>Work</span>
          </NavLink>
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
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} ${isTimerActive ? `mode-${mode}-text` : ''}`}
          >
            <Timer size={24} className={isTimerActive ? 'timer-active-icon' : ''} />
            <span>{isTimerActive ? formatTime(timeLeft) : 'Pomodoro'}</span>
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
            to="/ideas"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Lightbulb size={24} />
            <span>Ideas Emprendedoras</span>
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
