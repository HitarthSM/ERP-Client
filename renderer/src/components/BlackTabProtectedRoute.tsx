import { Navigate } from 'react-router-dom';
import { useBlackTab } from '../context/BlackTabContext';
import { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

export default function BlackTabProtectedRoute({ children }: { children: ReactNode }) {
  const { isUnlocked } = useBlackTab();
  const { user } = useAuth();
  
  const isOrgAdmin = user?.roles?.includes('org:admin');

  if (!isUnlocked || !isOrgAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
