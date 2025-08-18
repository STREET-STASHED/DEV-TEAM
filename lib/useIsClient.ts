import { useEffect, useState } from 'react';

export function useIsClient() {
  const [isClient, set] = useState(false);
  useEffect(() => set(true), []);
  return isClient;
}
