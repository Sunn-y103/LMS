import React, { useState } from 'react';
import { TextInput, Text, View, Pressable, type TextInputProps } from 'react-native';
import { COLORS } from '@/theme/colors';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  rightIcon?: React.ReactNode;
}

export const Input = React.memo(function Input({
  label,
  error,
  hint,
  rightIcon,
  secureTextEntry,
  ...rest
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry ?? false);

  return (
    <View className="w-full mb-4">
      {label && (
        <Text className="text-slate-300 text-sm font-medium mb-1.5">{label}</Text>
      )}
      <View
        className={[
          'flex-row items-center rounded-xl border bg-slate-800 px-4',
          error
            ? 'border-red-500'
            : isFocused
            ? 'border-brand-500'
            : 'border-slate-700',
        ].join(' ')}
      >
        <TextInput
          className="flex-1 text-slate-100 text-base py-3.5"
          placeholderTextColor={COLORS.textMuted}
          selectionColor={COLORS.primary}
          secureTextEntry={isSecure}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...rest}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setIsSecure((v) => !v)}
            hitSlop={8}
            accessibilityLabel={isSecure ? 'Show password' : 'Hide password'}
          >
            <Text className="text-slate-400 text-sm ml-2">
              {isSecure ? 'Show' : 'Hide'}
            </Text>
          </Pressable>
        )}
        {rightIcon && !secureTextEntry && <View className="ml-2">{rightIcon}</View>}
      </View>
      {error && <Text className="text-red-400 text-xs mt-1.5 ml-1">{error}</Text>}
      {hint && !error && <Text className="text-slate-500 text-xs mt-1.5 ml-1">{hint}</Text>}
    </View>
  );
});
