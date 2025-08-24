import { useAuth } from '../contexts/AuthContext';

interface ChatAuthState {
  user: any;
  isLoading: boolean;
  error: string | null;
}

export const useChatAuth = (): ChatAuthState => {
  const { user, loading } = useAuth();
  
  return {
    user,
    isLoading: loading,
    error: null
  };
};