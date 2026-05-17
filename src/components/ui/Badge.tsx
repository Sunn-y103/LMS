import React from 'react';
import { Text, View } from 'react-native';

type BadgeVariant = 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantMap: Record<BadgeVariant, string> = {
  primary: 'bg-brand-900 ',
  success: 'bg-green-900 ',
  warning: 'bg-amber-900 ',
  error:   'bg-red-900 ',
  info:    'bg-blue-900 ',
  neutral: 'bg-slate-700 ',
};

const textMap: Record<BadgeVariant, string> = {
  primary: 'text-brand-300',
  success: 'text-green-300',
  warning: 'text-amber-300',
  error:   'text-red-300',
  info:    'text-blue-300',
  neutral: 'text-slate-300',
};

export function Badge({ label, variant = 'primary' }: BadgeProps) {
  return (
    <View className={`${variantMap[variant]}px-2.5 py-1 rounded-full self-start`}>
      <Text className={`${textMap[variant]} text-xs font-medium`}>{label}</Text>
    </View>
  );
}
