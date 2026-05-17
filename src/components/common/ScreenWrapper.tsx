import React from 'react';
import { SafeAreaView, StatusBar, View, type ViewStyle } from 'react-native';
import { COLORS } from '@/theme/colors';

interface ScreenWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
  className?: string;
}

export function ScreenWrapper({ children, className = '' }: ScreenWrapperProps) {
  return (
    <SafeAreaView className={`flex-1 bg-slate-950 ${className}`}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgBase} />
      {children}
    </SafeAreaView>
  );
}
