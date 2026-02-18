import { useAuth as useGlobalAuth } from '../context/AuthContext';

/**
 * useAuth Hook
 * 
 * This is a proxy hook that points to the global AuthProvider state.
 * It ensures all components (like Header and Dashboard) share the same 
 * authentication state and react immediately to changes.
 */
export const useAuth = () => {
    return useGlobalAuth();
};

export default useAuth;