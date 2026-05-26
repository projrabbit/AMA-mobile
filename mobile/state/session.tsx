import { createContext, PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

import { ApiError } from '@/api/client';
import * as ama from '@/api/ama';

type SessionState = {
  accessToken: string | null;
  refreshToken: string | null;
  me: ama.MeData | null;
};

type SessionContextValue = SessionState & {
  isAuthenticated: boolean;
  login: (input: { username: string; password: string }) => Promise<ama.LoginData>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [meData, setMeData] = useState<ama.MeData | null>(null);

  const isAuthenticated = !!accessToken;

  const logout = useCallback(async () => {
    try {
      if (accessToken) {
        await ama.logout(accessToken, refreshToken ? { refresh_token: refreshToken } : undefined);
      }
    } catch {
    } finally {
      setAccessToken(null);
      setRefreshToken(null);
      setMeData(null);
    }
  }, [accessToken, refreshToken]);

  const login = useCallback(async (input: { username: string; password: string }) => {
    try {
      const data = await ama.login(input);
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);
      setMeData({ account: data.account, employee: data.employee });
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        throw new Error(err.message || 'Đăng nhập thất bại');
      }
      throw err;
    }
  }, []);

  const refreshMe = useCallback(async () => {
    if (!accessToken) return;
    const data = await ama.me(accessToken);
    setMeData(data);
  }, [accessToken]);

  const value = useMemo<SessionContextValue>(
    () => ({
      accessToken,
      refreshToken,
      me: meData,
      isAuthenticated,
      login,
      logout,
      refreshMe,
    }),
    [accessToken, refreshToken, meData, isAuthenticated, login, logout, refreshMe],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('SessionProvider is missing');
  return ctx;
}
