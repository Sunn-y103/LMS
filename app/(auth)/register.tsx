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
import { useRegister } from '@/features/auth/hooks/useRegister';
import { registerSchema } from '@/features/auth/schemas/auth.schema';
import { getErrorMessage } from '@/utils/error.utils';

interface FieldErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterScreen() {
  const { register, isLoading, error, isSuccess, reset } = useRegister();
  const [form, setForm] = useState({
    username: '', email: '', password: '', confirmPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function handleChange(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    if (error) reset();
  }

  function handleSubmit() {
    const result = registerSchema.safeParse(form);
    if (!result.success) {
      const errs: FieldErrors = {};
      result.error.issues.forEach((e: any) => {
        const field = e.path[0] as keyof FieldErrors;
        if (!errs[field]) errs[field] = e.message;
      });
      setFieldErrors(errs);
      return;
    }
    register({ username: result.data.username, email: result.data.email, password: result.data.password });
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-slate-950"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View className="flex-1 px-6 pt-16 pb-10">
          <View className="items-center mb-8">
            <Text className="text-5xl mb-3">🎓</Text>
            <Text className="text-3xl font-bold text-slate-100">Create Account</Text>
            <Text className="text-slate-400 text-base mt-1">Join thousands of learners</Text>
          </View>

          <View className="bg-slate-900 rounded-3xl border border-slate-800 p-6">
            {/* Success message */}
            {isSuccess && (
              <View className="bg-green-900/40 border border-green-700 rounded-xl px-4 py-4 mb-4 items-center">
                <Text className="text-2xl mb-1">✅</Text>
                <Text className="text-green-300 text-base font-semibold">Account created!</Text>
                <Text className="text-green-400/80 text-sm mt-1 text-center">
                  Redirecting to login…
                </Text>
              </View>
            )}

            {/* Error message */}
            {error && !isSuccess && (
              <View className="bg-red-900/40 border border-red-700 rounded-xl px-4 py-3 mb-4">
                <Text className="text-red-300 text-sm">{getErrorMessage(error)}</Text>
              </View>
            )}

            {!isSuccess && (
              <>
                <Input label="Username" placeholder="Choose a username" value={form.username}
                  onChangeText={(v) => handleChange('username', v)} error={fieldErrors.username}
                  autoCapitalize="none" autoCorrect={false} returnKeyType="next" />

                <Input label="Email" placeholder="your@email.com" value={form.email}
                  onChangeText={(v) => handleChange('email', v)} error={fieldErrors.email}
                  keyboardType="email-address" autoCapitalize="none" returnKeyType="next" />

                <Input label="Password" placeholder="Min. 8 characters" value={form.password}
                  onChangeText={(v) => handleChange('password', v)} error={fieldErrors.password}
                  secureTextEntry returnKeyType="next" />

                <Input label="Confirm Password" placeholder="Repeat your password" value={form.confirmPassword}
                  onChangeText={(v) => handleChange('confirmPassword', v)} error={fieldErrors.confirmPassword}
                  secureTextEntry returnKeyType="done" onSubmitEditing={handleSubmit} />

                <Button title="Create Account" onPress={handleSubmit} isLoading={isLoading} fullWidth size="lg" />
              </>
            )}
          </View>

          <View className="flex-row justify-center items-center mt-8">
            <Text className="text-slate-400 text-sm">Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text className="text-brand-400 text-sm font-semibold">Sign in</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
