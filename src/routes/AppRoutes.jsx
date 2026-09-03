import { Navigate, Outlet, Route, Routes, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import toast from 'react-hot-toast';
import { LoadingSpinner } from '../components/common/ui.jsx';
import { AppShell } from '../components/layout/AppShell.jsx';
import Login from '../pages/Login.jsx';
import Register from '../pages/Register.jsx';
import Dashboard from '../pages/Dashboard.jsx';
import MyDrive from '../pages/MyDrive.jsx';
import SharedWithMe from '../pages/SharedWithMe.jsx';
import Starred from '../pages/Starred.jsx';
import Trash from '../pages/Trash.jsx';
import Search from '../pages/Search.jsx';
import Profile from '../pages/Profile.jsx';
import Pricing from '../pages/Pricing.jsx';
import PublicShare from '../pages/PublicShare.jsx';

function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner label="Loading session..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

function OAuthCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithOAuthCode, setSessionFromOAuth } = useAuth();
  const [exchanging, setExchanging] = useState(true);

  useEffect(() => {
    const code = params.get('code');
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (code) {
      loginWithOAuthCode(code)
        .then(() => {
          toast.success('Successfully logged in with Google');
          navigate('/dashboard', { replace: true });
        })
        .catch((err) => {
          toast.error(err.message || 'Google authentication failed');
          navigate('/login', { replace: true });
        })
        .finally(() => setExchanging(false));
    } else if (accessToken && refreshToken) {
      setSessionFromOAuth(accessToken, refreshToken);
      navigate('/dashboard', { replace: true });
    } else {
      toast.error('Authentication code missing');
      navigate('/login', { replace: true });
    }
  }, [params, loginWithOAuthCode, setSessionFromOAuth, navigate]);

  return <LoadingSpinner label="Completing authentication..." />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/share/:token" element={<PublicShare />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/drive" element={<MyDrive />} />
        <Route path="/shared" element={<SharedWithMe />} />
        <Route path="/starred" element={<Starred />} />
        <Route path="/trash" element={<Trash />} />
        <Route path="/search" element={<Search />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/pricing" element={<Pricing />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
