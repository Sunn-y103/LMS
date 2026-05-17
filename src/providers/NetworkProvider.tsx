import React, { createContext, useContext } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

interface NetworkContextValue {
  isConnected: boolean;
  isOffline: boolean;
}

const NetworkContext = createContext<NetworkContextValue>({
  isConnected: true,
  isOffline: false,
});

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const { isConnected, isOffline } = useNetworkStatus();
  return (
    <NetworkContext.Provider value={{ isConnected, isOffline }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork(): NetworkContextValue {
  return useContext(NetworkContext);
}
