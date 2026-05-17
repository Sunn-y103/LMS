import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { useNetwork } from '@/providers/NetworkProvider';

export function OfflineBanner() {
  const { isOffline } = useNetwork();
  const translateY = useRef(new Animated.Value(-60)).current;
  const wasOffline = useRef(false);

  useEffect(() => {
    if (isOffline) {
      wasOffline.current = true;
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        friction: 8,
      }).start();
    } else if (wasOffline.current) {
      Animated.timing(translateY, {
        toValue: -60,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [isOffline, translateY]);

  if (!isOffline && !wasOffline.current) return null;

  return (
    <Animated.View
      style={{ transform: [{ translateY }] }}
      className="absolute top-0 left-0 right-0 z-50 bg-red-600 px-4 py-3 flex-row items-center justify-center"
    >
      <Text className="text-white font-medium text-sm text-center">
        📡 You are offline — showing cached content
      </Text>
    </Animated.View>
  );
}
