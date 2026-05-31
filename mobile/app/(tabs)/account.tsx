import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import * as ama from '@/api/ama';
import { ApiError } from '@/api/client';
import { Box, Button, Placeholder, Row, Screen, wf } from '@/components/Wireframe';
import { useSession } from '@/state/session';

export default function AccountScreen() {
  const { accessToken, me, refreshMe, logout } = useSession();
  const [devices, setDevices] = useState<ama.DeviceDetail[] | null>(null);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [devicesError, setDevicesError] = useState<string | null>(null);

  useEffect(() => {
    if (!me) void refreshMe();
  }, [me, refreshMe]);

  useEffect(() => {
    if (!accessToken) return;
    if (me?.account.role !== 'employee') {
      setDevices(null);
      setDevicesError(null);
      return;
    }
    let alive = true;
    setDevicesLoading(true);
    setDevicesError(null);
    ama
      .getMyDevices(accessToken)
      .then((d) => {
        if (!alive) return;
        setDevices(d);
      })
      .catch((e) => {
        if (!alive) return;
        const msg =
          e instanceof ApiError
            ? e.message
            : e instanceof Error
              ? e.message
              : 'Không thể tải danh sách thiết bị';
        setDevices(null);
        setDevicesError(msg);
      })
      .finally(() => {
        if (!alive) return;
        setDevicesLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [accessToken, me?.account.role]);

  const deviceSubtitle = useMemo(() => {
    if (me?.account.role !== 'employee') return 'Thiết bị đăng ký chỉ áp dụng cho nhân viên';
    if (devicesLoading) return 'Đang tải thiết bị...';
    if (devicesError) return 'Không tải được thiết bị';
    return devices && devices.length > 0 ? `Đã đăng ký: ${devices.length}` : 'Chưa có thiết bị nào';
  }, [devices, devicesError, devicesLoading, me?.account.role]);

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
        <Text style={styles.sectionTitle}>Thiết bị</Text>
        <Text style={styles.sectionSubtitle}>{deviceSubtitle}</Text>

        <Row label="Hệ điều hành" value={Platform.OS} />

        {devicesError ? <Text style={styles.errorText}>{devicesError}</Text> : null}

        {devices?.length ? (
          <View style={styles.deviceList}>
            {devices.map((d) => (
              <View key={d.device_id} style={styles.deviceItem}>
                <Text style={styles.deviceTitle}>
                  {d.platform} • {d.model ?? '—'}
                </Text>
                <Text style={styles.deviceDetail}>
                  Trusted: {d.is_trusted ? 'Yes' : 'No'} • {maskFingerprint(d.device_fingerprint)}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
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

function maskFingerprint(v: string): string {
  if (!v) return '—';
  if (v.length <= 12) return v;
  return `${v.slice(0, 6)}…${v.slice(-4)}`;
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: wf.colors.ink,
    fontWeight: '700',
    marginBottom: wf.spacing.sm,
  },
  sectionSubtitle: {
    color: wf.colors.muted,
    fontSize: 12,
    marginTop: -6,
    marginBottom: wf.spacing.sm,
  },
  errorText: {
    color: wf.colors.dangerText,
    marginTop: wf.spacing.sm,
  },
  deviceList: {
    marginTop: wf.spacing.md,
    gap: wf.spacing.sm,
  },
  deviceItem: {
    backgroundColor: wf.colors.soft,
    borderColor: wf.colors.line,
    borderWidth: wf.border.width,
    borderRadius: wf.radius.md,
    padding: wf.spacing.md,
  },
  deviceTitle: {
    color: wf.colors.ink,
    fontWeight: '700',
    marginBottom: 4,
  },
  deviceDetail: {
    color: wf.colors.muted,
    fontSize: 12,
    lineHeight: 16,
  },
});
