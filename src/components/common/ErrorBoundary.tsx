import React, { Component, type ReactNode } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    // In production: log to crash reporting (e.g. Sentry)
    if (__DEV__) {
      console.error('[ErrorBoundary]', error, info);
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <ScrollView
          contentContainerStyle={{ flex: 1 }}
          className="flex-1 bg-slate-950"
        >
          <View className="flex-1 items-center justify-center px-8 py-16">
            <Text className="text-5xl mb-4">⚠️</Text>
            <Text className="text-slate-100 text-xl font-bold text-center mb-3">
              Something went wrong
            </Text>
            <Text className="text-slate-400 text-sm text-center mb-8 leading-6">
              {this.state.error?.message ?? 'An unexpected error occurred.'}
            </Text>
            <Pressable
              onPress={this.handleRetry}
              className="bg-brand-600 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold text-base">Try Again</Text>
            </Pressable>
          </View>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}
