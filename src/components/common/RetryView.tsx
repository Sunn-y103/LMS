import React from 'react';
import { View, Text } from 'react-native';
import { Button } from '@/components/ui/Button';
import type { ApiError } from '@/types/api.types';
import { getErrorMessage } from '@/utils/error.utils';

interface RetryViewProps {
  error: ApiError | Error | null;
  onRetry: () => void;
  isRetrying?: boolean;
}

export function RetryView({ error, onRetry, isRetrying = false }: RetryViewProps) {
  const message =
    error instanceof Error
      ? error.message
      : error
      ? getErrorMessage(error)
      : 'Something went wrong.';

  return (
    <View className="flex-1 items-center justify-center px-8 py-16">
      <Text className="text-4xl mb-4">🚫</Text>
      <Text className="text-slate-100 text-lg font-bold text-center mb-2">
        Failed to load
      </Text>
      <Text className="text-slate-400 text-sm text-center mb-8 leading-6">{message}</Text>
      <Button
        title="Retry"
        onPress={onRetry}
        isLoading={isRetrying}
        variant="outline"
        size="md"
      />
    </View>
  );
}
