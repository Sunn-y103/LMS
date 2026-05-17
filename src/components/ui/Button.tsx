import React from 'react';
import { Pressable, Text, ActivityIndicator, type PressableProps } from 'react-native';
import { COLORS } from '@/theme/colors';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  title: string;
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-brand-600 active:bg-brand-700',
  secondary: 'bg-slate-700 active:bg-slate-600',
  outline:   'border border-brand-500 bg-transparent active:bg-brand-950',
  ghost:     'bg-transparent active:bg-slate-800',
  danger:    'bg-red-600 active:bg-red-700',
};

const textClasses: Record<Variant, string> = {
  primary:   'text-white',
  secondary: 'text-slate-100',
  outline:   'text-brand-400',
  ghost:     'text-slate-300',
  danger:    'text-white',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-2 rounded-lg',
  md: 'px-5 py-3 rounded-xl',
  lg: 'px-6 py-4 rounded-xl',
};

const textSizeClasses: Record<Size, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export const Button = React.memo(function Button({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  leftIcon,
  disabled,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      className={[
        'flex-row items-center justify-center',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : 'self-start',
        isDisabled ? 'opacity-50' : 'opacity-100',
      ].join(' ')}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? COLORS.primary : '#fff'}
        />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text
            className={[
              'font-semibold text-center',
              textClasses[variant],
              textSizeClasses[size],
              leftIcon ? 'ml-2' : '',
            ].join(' ')}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
});
