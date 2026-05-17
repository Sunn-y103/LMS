import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { COLORS } from '@/theme/colors';

interface CourseWebViewProps {
  htmlContent: string;
  onProgress?: (percent: number) => void;
  onComplete?: () => void;
  onRawMessage?: (event: WebViewMessageEvent) => void;
  onError?: () => void;
}

interface BridgeMessage {
  type: 'PROGRESS' | 'COMPLETE' | 'LESSON_COMPLETE' | 'ERROR';
  payload?: unknown;
}

export function CourseWebView({ htmlContent, onProgress, onComplete, onRawMessage, onError }: CourseWebViewProps) {
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    // Forward raw message to parent if handler provided
    if (onRawMessage) {
      onRawMessage(event);
      return;
    }

    try {
      const msg = JSON.parse(event.nativeEvent.data) as BridgeMessage;
      if (msg.type === 'PROGRESS' && typeof msg.payload === 'number') {
        onProgress?.(msg.payload);
      } else if (msg.type === 'COMPLETE') {
        onComplete?.();
      }
    } catch {
      // ignore malformed messages
    }
  }, [onProgress, onComplete, onRawMessage]);

  const handleError = useCallback(() => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  }, [onError]);

  const handleRetry = useCallback(() => {
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  }, []);

  if (hasError) {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center px-8">
        <Text className="text-4xl mb-4">🌐</Text>
        <Text className="text-slate-100 text-lg font-bold text-center mb-2">
          Content failed to load
        </Text>
        <Text className="text-slate-400 text-sm text-center mb-6">
          Please check your connection and try again.
        </Text>
        <Pressable
          onPress={handleRetry}
          className="bg-brand-600 px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-950">
      {isLoading && (
        <View className="absolute inset-0 items-center justify-center z-10 bg-slate-950">
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text className="text-slate-400 text-sm mt-3">Loading lesson content…</Text>
        </View>
      )}
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        onLoadEnd={() => setIsLoading(false)}
        onError={handleError}
        onHttpError={handleError}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess={false}
        mixedContentMode="never"
        style={{ flex: 1, backgroundColor: COLORS.bgBase }}
        injectedJavaScript={`
          window.ReactNativeBridge = {
            postMessage: function(data) {
              window.ReactNativeWebView.postMessage(JSON.stringify(data));
            }
          };
          true;
        `}
      />
    </View>
  );
}
