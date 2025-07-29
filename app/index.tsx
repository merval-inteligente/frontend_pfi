import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Redirigir según el estado de autenticación
    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      router.replace('./welcome');
    }
  }, [router, isAuthenticated]);

  return null; // No renderizar nada mientras redirige
}
