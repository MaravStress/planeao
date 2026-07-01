import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import PomodoroPage from './pages/PomodoroPage';
import FinancesPage from './pages/FinancesPage';
import SettingsPage from './pages/SettingsPage';

import WorkPage from './pages/WorkPage';
import IdeasPage from './pages/IdeasPage';
import UniProgressPage from './pages/UniProgressPage';

import { PomodoroProvider } from './context/PomodoroContext';
import { WorkProvider } from './context/WorkContext';
import { IdeasProvider } from './context/IdeasContext';
import { UniProgressProvider } from './context/UniProgressContext';
import { FinancesProvider } from './context/FinancesContext';

import { auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { syncData } from './context/OnlineSave';

function App() {
  useEffect(() => {
    const wasReloadedForSync = sessionStorage.getItem('planeao-reload-sync') === 'true';
    if (wasReloadedForSync) {
        sessionStorage.removeItem('planeao-reload-sync');
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (wasReloadedForSync) {
            // Avoid syncing again if we just reloaded to apply online data
            return;
        }
        // Sync local data with firebase globally whenever the app initializes and user is authenticated
        const updatedLocal = await syncData();
        if (updatedLocal) {
            sessionStorage.setItem('planeao-reload-sync', 'true');
            // A hard refresh ensures all contexts re-mount and load the freshly synchronized local storage data automatically.
            window.location.reload();
        }
      }
    });
    return () => unsubscribe();
  }, []);
  return (
    <FinancesProvider>
    <IdeasProvider>
      <WorkProvider>
        <PomodoroProvider>
          <HashRouter>
            <UniProgressProvider>
                <Routes>
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<WorkPage />} />
                  <Route path="pomodoro" element={<PomodoroPage />} />
                  <Route path="finances" element={<FinancesPage />} />
                  <Route path="ideas" element={<IdeasPage />} />
                  <Route path="uni-progress" element={<UniProgressPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  {/* Redirect any unknown routes to home */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
                </Routes>
            </UniProgressProvider>
          </HashRouter>
        </PomodoroProvider>
      </WorkProvider>
    </IdeasProvider>
    </FinancesProvider>
  );
}

export default App;
