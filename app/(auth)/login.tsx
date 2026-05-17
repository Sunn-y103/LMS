import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { loginSchema, type LoginFormData } from '@/features/auth/schemas/auth.schema';
import { getErrorMessage } from '@/utils/error.utils';
import { APP_NAME } from '@/constants/app.constants';

export default function LoginScreen() {
  const { login, isLoading, error, reset } = useLogin();
  const [form, setForm] = useState<LoginFormData>({ username: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<Partial<LoginFormData>>({});

  function handleChange(field: keyof LoginFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    if (error) reset();
  }

  function handleSubmit() {
    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const errs: Partial<LoginFormData> = {};
      result.error.issues.forEach((e: any) => {
        const field = e.path[0] as keyof LoginFormData;
        errs[field] = e.message;
      });
      setFieldErrors(errs);
      return;
    }
    login(result.data);
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-slate-950"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 px-6 pt-20 pb-10">
          {/* Header */}
          <View className="items-center mb-10">
            <Text className="text-5xl mb-3">📚</Text>
            <Text className="text-3xl font-bold text-slate-100">{APP_NAME}</Text>
            <Text className="text-slate-400 text-base mt-1">Welcome back</Text>
          </View>

          {/* Card */}
          <View className="bg-slate-900 rounded-3xl border border-slate-800 p-6">
            <Text className="text-slate-100 text-xl font-bold mb-6">Sign In</Text>

            {error && (
              <View className="bg-red-900/40 border border-red-700 rounded-xl px-4 py-3 mb-4">
                <Text className="text-red-300 text-sm">{getErrorMessage(error)}</Text>
              </View>
            )}

            <Input
              label="Username"
              placeholder="Enter your username"
              value={form.username}
              onChangeText={(v) => handleChange('username', v)}
              error={fieldErrors.username}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              accessibilityLabel="Username input"
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={form.password}
              onChangeText={(v) => handleChange('password', v)}
              error={fieldErrors.password}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              accessibilityLabel="Password input"
            />

            <Button
              title="Sign In"
              onPress={handleSubmit}
              isLoading={isLoading}
              fullWidth
              size="lg"
              accessibilityLabel="Sign in button"
            />
          </View>

          {/* Footer */}
          <View className="flex-row justify-center items-center mt-8">
            <Text className="text-slate-400 text-sm">Don't have an account? </Text>
            <Link href="/(auth)/register" asChild>
              <Pressable>
                <Text className="text-brand-400 text-sm font-semibold">Create one</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
