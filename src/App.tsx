import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import './index.css';
import { useAppStore } from './store/useAppStore';

function App() {
  useEffect(() => {
    const STORAGE_KEY = 'book-club-store-v1';
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue && e.newValue !== e.oldValue) {
        try {
          const data = JSON.parse(e.newValue);
          useAppStore.setState({
            events: data.state?.events || [],
            participants: data.state?.participants || [],
            registrations: data.state?.registrations || [],
            checkIns: data.state?.checkIns || [],
            notifications: data.state?.notifications || [],
            blacklist: data.state?.blacklist || [],
            tags: data.state?.tags || [],
            feedbacks: data.state?.feedbacks || [],
          });
        } catch {
          /* ignore parse errors */
        }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return <RouterProvider router={router} />;
}

export default App;
