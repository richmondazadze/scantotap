import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LightLogin } from '@/components/ui/sign-in';

export default function AuthPage() {
  const { session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      navigate('/dashboard/profile', { replace: true });
    }
  }, [session, navigate]);

  return <LightLogin />;
} 