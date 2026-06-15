import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  if (location.pathname === '/') {
    return <Navigate to="/events" replace />;
  }

  void navigate;

  return (
    <div className="flex min-h-screen bg-paper-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 min-w-0 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
