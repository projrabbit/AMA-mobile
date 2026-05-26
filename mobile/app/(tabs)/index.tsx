import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import * as ama from '@/api/ama';
import { ApiError } from '@/api/client';
import { Box, Button, Metric, Placeholder, Row, Screen, StatusBox, wf } from '@/components/Wireframe';
import { useSession } from '@/state/session';

export default function HomeScreen() {
  const { accessToken, me } = useSession();
  const [today, setToday] = useState<ama.TodayStatusData | null>(null);
  const [summary, setSummary] = useState<ama.DashboardSummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    let alive = true;
    setLoading(true);
    setError(null);

    const role = me?.account.role;
    const p =
      role === 'employee' ? ama.todayStatus(accessToken) : ama.dashboardSummary(accessToken, {});

    p.then((data) => {
      if (!alive) return;
      if (role === 'employee') {
        setSummary(null);
        setToday(data as ama.TodayStatusData);
      } else {
        setToday(null);
        setSummary(data as ama.DashboardSummaryData);
      }
    })
      .catch((e) => {
        if (!alive) return;
        const msg =
          e instanceof ApiError && e.code === 'FORBIDDEN'
            ? 'Tài khoản hiện tại không đủ quyền để xem dữ liệu này.'
            : e instanceof Error
              ? e.message
              : 'Không thể tải dữ liệu';
        setError(msg);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [accessToken, me?.account.role]);

  const shiftText = useMemo(() => {
    if (me?.account.role && me.account.role !== 'employee') return 'Tổng quan hôm nay';
    const s = today?.current_shift;
    if (!s) return 'Ca làm: —';
    return `${s.name}: ${s.start_time} - ${s.end_time}`;
  }, [me?.account.role, today?.current_shift]);

  const latestCheckin = useMemo(() => formatTime(today?.latest_checkin?.timestamp), [today?.latest_checkin?.timestamp]);
  const latestCheckout = useMemo(() => formatTime(today?.latest_checkout?.timestamp), [today?.latest_checkout?.timestamp]);

  return (
    <Screen title={`Xin chào, ${me?.employee.full_name ?? '—'}`} subtitle={shiftText}>
      {me?.account.role === 'employee' ? (
        <View style={styles.metricRow}>
          <Metric value={latestCheckin ?? '—'} label="Chấm công vào gần nhất" />
          <Metric value={latestCheckout ?? '—'} label="Chấm công ra gần nhất" />
        </View>
      ) : (
        <View style={styles.metricRow}>
          <Metric value={String(summary?.checked_in_today ?? '—')} label="Đã chấm công (hôm nay)" />
          <Metric value={String(summary?.late_count ?? '—')} label="Đi trễ (hôm nay)" />
        </View>
      )}

      <Box>
        {me?.account.role === 'employee' ? (
          <>
            <Row
              label="Trạng thái"
              value={
                today
                  ? today.can_check_in
                    ? 'Có thể chấm công vào'
                    : today.can_check_out
                      ? 'Có thể chấm công ra'
                      : 'Không thể chấm công'
                  : '—'
              }
            />
            <Row label="Hôm nay" value={today?.date ?? '—'} />
          </>
        ) : (
          <>
            <Row label="Ngày" value={summary?.date ?? '—'} />
            <Row label="Tổng nhân sự" value={String(summary?.total_employees ?? '—')} />
          </>
        )}
        <Row label="Tài khoản" value={me?.account.username ?? '—'} />
      </Box>

      <Placeholder label="Bản đồ nhỏ / vị trí hiện tại trong vùng cho phép" />

      {loading ? <StatusBox text="Đang tải trạng thái..." /> : null}
      {error ? <StatusBox text={error} /> : null}

      {me?.account.role === 'employee' ? (
        <>
          <Button
            label="Chấm công vào"
            size="lg"
            onPress={() => router.push({ pathname: '/verify', params: { type: 'in' } })}
            disabled={!today?.can_check_in}
          />
          <Button
            label="Chấm công ra"
            variant="secondary"
            onPress={() => router.push({ pathname: '/verify', params: { type: 'out' } })}
            disabled={!today?.can_check_out}
          />
        </>
      ) : (
        <Button label="Quản trị / Báo cáo" size="lg" onPress={() => router.push('/manage')} />
      )}
    </Screen>
  );
}

function formatTime(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

const styles = StyleSheet.create({
  metricRow: {
    flexDirection: 'row',
    gap: wf.spacing.md,
  },
});
