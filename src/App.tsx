import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import PomodoroPage from './pages/PomodoroPage';
import FinancesPage from './pages/FinancesPage';
import SettingsPage from './pages/SettingsPage';

import WorkPage from './pages/WorkPage';
import WhiteboardsPage from './pages/WhiteboardsPage';
import HabitsPage from './pages/HabitsPage';

import { PomodoroProvider } from './context/PomodoroContext';
import { WorkProvider } from './context/WorkContext';
import { WhiteboardsProvider } from './context/WhiteboardsContext';

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
    <WorkProvider>
      <WhiteboardsProvider>
        <PomodoroProvider>
          <HashRouter>
            <Routes>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<WorkPage />} />
                <Route path="pomodoro" element={<PomodoroPage />} />
                <Route path="finances" element={<FinancesPage />} />
                <Route path="habits" element={<HabitsPage />} />
                <Route path="whiteboards" element={<WhiteboardsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                {/* Redirect any unknown routes to home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Routes>
          </HashRouter>
        </PomodoroProvider>
      </WhiteboardsProvider>
    </WorkProvider>
  );
}

export default App;
