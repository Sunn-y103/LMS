import React, { useState, useCallback } from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: AvatarSize;
}

const sizeMap: Record<AvatarSize, { container: string; text: string; px: number }> = {
  xs: { container: 'w-7 h-7 rounded-full',  text: 'text-xs',  px: 28 },
  sm: { container: 'w-9 h-9 rounded-full',  text: 'text-sm',  px: 36 },
  md: { container: 'w-11 h-11 rounded-full', text: 'text-base', px: 44 },
  lg: { container: 'w-14 h-14 rounded-full', text: 'text-lg',  px: 56 },
  xl: { container: 'w-20 h-20 rounded-full', text: 'text-2xl', px: 80 },
};

function getInitials(name?: string): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export const Avatar = React.memo(function Avatar({ uri, name, size = 'md' }: AvatarProps) {
  const { container, text, px } = sizeMap[size];
  const [loadError, setLoadError] = useState(false);

  React.useEffect(() => {
    setLoadError(false);
  }, [uri]);

  const handleError = useCallback(() => {
    setLoadError(true);
  }, []);

  if (uri && !loadError) {
    return (
      <Image
        source={{ uri }}
        style={{ width: px, height: px, borderRadius: px / 2 }}
        contentFit="cover"
        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        transition={300}
        cachePolicy="memory-disk"
        recyclingKey={`avatar-${uri}`}
        onError={handleError}
      />
    );
  }

  return (
    <View className={`${container} bg-brand-700 items-center justify-center`}>
      <Text className={`${text} text-white font-bold`}>{getInitials(name)}</Text>
    </View>
  );
});
