import React from 'react';

type NoAuthProviderProps = {
  children: React.ReactNode;
};

export default function NoAuthProvider({ children }: NoAuthProviderProps) {
  return <>{children}</>;
}
