import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import CalendarPage from './pages/CalendarPage';
import PomodoroPage from './pages/PomodoroPage';
import HabitsPage from './pages/HabitsPage';
import FinancesPage from './pages/FinancesPage';
import SettingsPage from './pages/SettingsPage';

import WorkPage from './pages/WorkPage';
import IdeasPage from './pages/IdeasPage';

import { PomodoroProvider } from './context/PomodoroContext';

function App() {
  return (
    <PomodoroProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route path="work" element={<WorkPage />} />
            <Route index element={<CalendarPage />} />
            <Route path="pomodoro" element={<PomodoroPage />} />
            <Route path="habits" element={<HabitsPage />} />
            <Route path="finances" element={<FinancesPage />} />
            <Route path="ideas" element={<IdeasPage />} />
            <Route path="settings" element={<SettingsPage />} />
            {/* Redirect any unknown routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </PomodoroProvider>
  );
}

export default App;
