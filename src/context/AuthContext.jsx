import React, { createContext, useContext, useState, useEffect } from 'react';
import { getApiBaseUrl } from '../data/products';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [container, setContainer] = useState(null);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem('shov_access_token') || null);
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('shov_refresh_token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const API_BASE = getApiBaseUrl();

  // Restore Auth Session on Page Load / Token Refresh
  useEffect(() => {
    async function restoreSession() {
      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setUser(data.user);
            setTenant(data.tenant);
            setUserRole(data.userRole);
            setContainer(data.container);
            setIsLoading(false);
            return;
          }
        }

        // If access token expired, attempt refresh token exchange
        if (refreshToken) {
          const refreshed = await attemptTokenRefresh(refreshToken);
          if (refreshed) {
            setIsLoading(false);
            return;
          }
        }

        // If both failed, clear session
        clearAuthState();
      } catch (err) {
        console.warn('Auth Session Restoration Error:', err.message);
        clearAuthState();
      } finally {
        setIsLoading(false);
      }
    }

    restoreSession();
  }, []);

  const attemptTokenRefresh = async (refToken) => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refToken })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        localStorage.setItem('shov_access_token', data.accessToken);
        localStorage.setItem('shov_refresh_token', data.refreshToken);

        // Fetch /me with new access token
        const meRes = await fetch(`${API_BASE}/auth/me`, {
          headers: { 'Authorization': `Bearer ${data.accessToken}` }
        });
        if (meRes.ok) {
          const meData = await meRes.json();
          if (meData.success) {
            setUser(meData.user);
            setTenant(meData.tenant);
            setUserRole(meData.userRole);
            setContainer(meData.container);
            return true;
          }
        }
      }
    } catch (e) {
      console.warn('Token Refresh Error:', e.message);
    }
    return false;
  };

  const clearAuthState = () => {
    setUser(null);
    setTenant(null);
    setUserRole(null);
    setContainer(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem('shov_access_token');
    localStorage.removeItem('shov_refresh_token');
  };

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid credentials');
      }

      setUser(data.user);
      setTenant(data.tenant);
      setContainer(data.container);
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      localStorage.setItem('shov_access_token', data.accessToken);
      localStorage.setItem('shov_refresh_token', data.refreshToken);

      return { success: true };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  const register = async (name, email, password) => {
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed');
      }

      setUser(data.user);
      setTenant(data.tenant);
      setContainer(data.container);
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      localStorage.setItem('shov_access_token', data.accessToken);
      localStorage.setItem('shov_refresh_token', data.refreshToken);

      return { success: true, container: data.container };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      if (refreshToken) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken })
        });
      }
    } catch (e) {}
    clearAuthState();
  };

  const restartContainer = async () => {
    if (!accessToken) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch(`${API_BASE}/tenant/container/restart`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setContainer(data.container);
        return { success: true, container: data.container };
      }
      throw new Error(data.error || 'Failed to restart container');
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        userRole,
        container,
        accessToken,
        isAuthenticated: Boolean(user && accessToken),
        isLoading,
        authError,
        login,
        register,
        logout,
        restartContainer
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
