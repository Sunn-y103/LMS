import React from 'react';
import { View, type ViewProps } from 'react-native';

type Padding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  padding?: Padding;
  elevated?: boolean;
  className?: string;
}

const paddingMap: Record<Padding, string> = {
  none: '',
  sm:   'p-3',
  md:   'p-4',
  lg:   'p-6',
};

export function Card({ children, padding = 'md', elevated = false, className = '', ...rest }: CardProps) {
  return (
    <View
      className={[
        'rounded-2xl border border-slate-800',
        elevated ? 'bg-slate-800' : 'bg-slate-900',
        paddingMap[padding],
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </View>
  );
}
