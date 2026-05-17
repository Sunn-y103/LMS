import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

export function useAppState(onChange?: (status: AppStateStatus) => void): AppStateStatus {
  const currentState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      currentState.current = nextState;
      onChange?.(nextState);
    });
    return () => subscription.remove();
  }, [onChange]);

  return currentState.current;
}
