// mobile/src/hooks/useAuth.ts
import { useCallback } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/api';
import { User, AuthTokens } from '@/types';
import { router } from 'expo-router';
import { Alert } from 'react-native';

export function useAuth() {
  const {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,
    setAuth,
    setUser,
    setTokens,
    setLoading,
    setError,
    logout,
    updateUser,
  } = useAuthStore();

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(email, password);
      const { access_token, refresh_token, token_type, expires_in } = response;
      const userData = await authService.getMe();

      const tokens: AuthTokens = {
        access_token,
        refresh_token,
        token_type,
        expires_in,
      };

      setAuth(userData, tokens);
      router.replace('/(tabs)');
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Login failed';
      setError(message);
      Alert.alert('Login Failed', message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setAuth, setLoading, setError]);

  const register = useCallback(async (email: string, password: string, name: string) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await authService.register({ email, password, name });
      const response = await authService.login(email, password);
      const { access_token, refresh_token, token_type, expires_in } = response;

      const tokens: AuthTokens = {
        access_token,
        refresh_token,
        token_type,
        expires_in,
      };

      setAuth(userData, tokens);
      router.replace('/(tabs)');
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Registration failed';
      setError(message);
      Alert.alert('Registration Failed', message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setAuth, setLoading, setError]);

  const handleLogout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      // Ignore logout errors
    } finally {
      logout();
      router.replace('/auth/login');
    }
  }, [logout]);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
    } catch (err) {
      // Silently fail
    }
  }, [setUser]);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    updateUser(updates);
  }, [updateUser]);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    try {
      await authService.changePassword(currentPassword, newPassword);
      Alert.alert('Success', 'Password changed successfully');
    } catch (err: any) {
      const message = err.response?.data?.error?.message || 'Password change failed';
      Alert.alert('Error', message);
      throw err;
    }
  }, []);

  return {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout: handleLogout,
    refreshUser,
    updateProfile,
    changePassword,
  };
}