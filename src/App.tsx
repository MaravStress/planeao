import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import PomodoroPage from './pages/PomodoroPage';
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
            <Route index element={<WorkPage />} />
            <Route path="pomodoro" element={<PomodoroPage />} />
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
