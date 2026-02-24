import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import PomodoroPage from './pages/PomodoroPage';
import FinancesPage from './pages/FinancesPage';
import SettingsPage from './pages/SettingsPage';

import WorkPage from './pages/WorkPage';
import IdeasPage from './pages/IdeasPage';

import { PomodoroProvider } from './context/PomodoroContext';
import { WorkProvider } from './context/WorkContext';
import { IdeasProvider } from './context/IdeasContext';

import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { syncData } from './context/OnlineSave';

function App() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Sync local data with firebase globally whenever the app initializes and user is authenticated
        const updatedLocal = await syncData();
        if (updatedLocal) {
            // A hard refresh ensures all contexts re-mount and load the freshly synchronized local storage data automatically.
            window.location.reload();
        }
      }
    });
    return () => unsubscribe();
  }, []);
  return (
    <IdeasProvider>
      <WorkProvider>
        <PomodoroProvider>
          <HashRouter>
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
          </HashRouter>
        </PomodoroProvider>
      </WorkProvider>
    </IdeasProvider>
  );
}

export default App;
