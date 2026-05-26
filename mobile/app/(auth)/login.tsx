import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Field, Placeholder, Screen, StatusBox, wf } from '@/components/Wireframe';
import { useSession } from '@/state/session';

export default function LoginScreen() {
  const { login } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const canSubmit = useMemo(() => email.trim().length > 0 && password.length > 0, [email, password]);

  const onSubmit = async () => {
    if (sending) return;
    const username = email.trim();
    if (username.length === 0 || password.length === 0) return;

    setSending(true);
    setError(null);
    try {
      await login({ username, password });
      router.replace('/');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Đăng nhập thất bại';
      setError(message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Screen title="Chấm công 3D" subtitle="Ứng dụng nhân viên">
      <Placeholder label="Logo / tên công ty" />
      <Field
        label="Tài khoản"
        value={email}
        onChangeText={(v) => {
          setEmail(v);
          if (error) setError(null);
        }}
        placeholder="username / email"
      />
      <Field
        label="Mật khẩu"
        value={password}
        onChangeText={(v) => {
          setPassword(v);
          if (error) setError(null);
        }}
        placeholder="********"
        secureTextEntry
      />
      <Button label="Đăng nhập" onPress={onSubmit} size="lg" disabled={!canSubmit} />
      <Button
        label="Quên mật khẩu"
        onPress={() => setError('Vui lòng liên hệ HR/Admin để được hỗ trợ đặt lại mật khẩu.')}
        variant="secondary"
      />
      {error ? (
        <View style={styles.errorWrap}>
          <StatusBox text={error} />
        </View>
      ) : null}
      {sending ? (
        <View style={styles.errorWrap}>
          <StatusBox text="Đang đăng nhập..." />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  errorWrap: {
    gap: wf.spacing.sm,
  },
});
