import React, { createContext, useContext } from 'react';

type NoAuthContextType = {
  isAuthenticated: boolean;
};

const NoAuthContext = createContext<NoAuthContextType>({ isAuthenticated: false });

export const useNoAuth = () => useContext(NoAuthContext);

type NoAuthProviderProps = {
  children: React.ReactNode;
};

export default function NoAuthProvider({ children }: NoAuthProviderProps) {
  const value = { isAuthenticated: false };

  return <NoAuthContext.Provider value={value}>{children}</NoAuthContext.Provider>;
}
