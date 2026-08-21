import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import GoogleIcon from '../components/GoogleIcon';
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
      {/* Dynamic Background Glows */}
      <div className="bg-glow-container">
        <div className="bg-glow-1"></div>
        <div className="bg-glow-2"></div>
      </div>

      <aside className="sidebar glass-panel">
        <div className="logo-container">
          <h2 className="logo-text-full">Planeao</h2>
          <h2 className="logo-text-collapsed">P</h2>
        </div>
        <nav className="nav-menu">
          <NavLink
            to="/"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            end
          >
            <GoogleIcon name="work" size={24} />
            <span>Work</span>
          </NavLink>
          <NavLink
            to="/habits"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <GoogleIcon name="favorite" size={24} />
            <span>Hábitos</span>
          </NavLink>
          <NavLink
            to="/pomodoro"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} ${isTimerActive ? `mode-${mode}-text` : ''}`}
          >
            <div className="pomodoro-icon-wrapper">
              {isTimerActive ? (
                <>
                  <GoogleIcon name="timer" size={24} className="pomodoro-default-icon timer-active-icon" />
                  <span className="pomodoro-timer-capsule">{formatTime(timeLeft)}</span>

                </>
              ) : (
                <GoogleIcon name="timer" size={24} className="pomodoro-default-icon" />
              )}
            </div>
            <span>
              {isTimerActive ? (
                <>
                  <span className="pomodoro-text-default">Pomodoro</span>
                  <span className="pomodoro-text-active">{formatTime(timeLeft)}</span>
                </>
              ) : (
                'Pomodoro'
              )}
            </span>
          </NavLink>
          <NavLink
            to="/finances"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <GoogleIcon name="attach_money" size={24} />
            <span>Finanzas</span>
          </NavLink>
          <NavLink
            to="/ideas"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <GoogleIcon name="lightbulb" size={24} />
            <span>Ideas Emprendedoras</span>
          </NavLink>

          <NavLink
            to="/uni-progress"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <GoogleIcon name="school" size={24} />
            <span>Progreso Uni</span>
          </NavLink>
          
          <NavLink
            to="/settings"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <GoogleIcon name="settings" size={24} />
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
