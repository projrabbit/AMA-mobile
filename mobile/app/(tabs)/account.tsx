import { router } from 'expo-router';
import { useEffect } from 'react';
import { Platform, StyleSheet, Text } from 'react-native';

import { Box, Button, Placeholder, Row, Screen, wf } from '@/components/Wireframe';
import { useSession } from '@/state/session';

export default function AccountScreen() {
  const { me, refreshMe, logout } = useSession();

  useEffect(() => {
    if (!me) void refreshMe();
  }, [me, refreshMe]);

  return (
    <Screen title="Tài khoản" subtitle="Thông tin nhân viên và thiết bị đăng ký">
      <Placeholder label="Ảnh đại diện / khuôn mặt đã đăng ký" />

      <Box>
        <Row label="Nhân viên" value={me?.employee.full_name ?? '—'} />
        <Row label="Phòng ban" value={me ? String(me.employee.department_id) : '—'} />
        <Row label="Email" value={me?.employee.email ?? '—'} />
        <Row label="Quyền" value={me?.account.role ?? '—'} />
      </Box>

      <Box>
        <Text style={styles.sectionTitle}>Thiết bị hiện tại</Text>
        <Row label="Hệ điều hành" value={Platform.OS} />
        <Row label="Dòng máy" value="—" />
        <Row label="Mã thiết bị" value="Đã ẩn một phần để bảo mật" />
        <Row label="Trạng thái" value="Chờ Admin xác nhận" />
      </Box>

      <Button
        label="Đăng xuất"
        variant="secondary"
        onPress={async () => {
          await logout();
          router.replace('/login');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: wf.colors.ink,
    fontWeight: '700',
    marginBottom: wf.spacing.sm,
  },
});
