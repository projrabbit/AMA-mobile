import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import * as ama from '@/api/ama';
import { Field, Metric, Screen, StatusBox, Tabs3, wf } from '@/components/Wireframe';
import { useSession } from '@/state/session';

export default function HistoryScreen() {
  const { accessToken, me } = useSession();
  const [tab, setTab] = useState(0);
  const [data, setData] = useState<ama.AttendanceHistoryData | null>(null);
  const [report, setReport] = useState<ama.AttendanceReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const range = useMemo(() => {
    const now = new Date();
    if (tab === 0) {
      const d = toYmd(now);
      return { from: d, to: d };
    }
    if (tab === 1) {
      const { from, to } = lastWeekRange(now);
      return { from: toYmd(from), to: toYmd(to) };
    }
    const { from, to } = lastMonthRange(now);
    return { from: toYmd(from), to: toYmd(to) };
  }, [tab]);

  const rangeTitle = useMemo(() => {
    if (tab === 0) return 'Hôm nay';
    if (tab === 1) return 'Tuần trước';
    return 'Tháng trước';
  }, [tab]);

  useEffect(() => {
    if (!accessToken) return;
    let alive = true;
    setLoading(true);
    setError(null);
    const role = me?.account.role;
    const p =
      role === 'employee'
        ? ama.attendanceHistory(accessToken, range)
        : ama.attendanceReport(accessToken, { from: range.from, to: range.to });
    p.then((d) => {
      if (!alive) return;
      if (role === 'employee') {
        setReport(null);
        setData(d as ama.AttendanceHistoryData);
      } else {
        setData(null);
        setReport(d as ama.AttendanceReportData);
      }
    })
      .catch((e) => {
        if (!alive) return;
        const msg = e instanceof Error ? e.message : 'Không thể tải dữ liệu';
        setError(msg);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [accessToken, range.from, range.to, me?.account.role]);

  const metricTotal = useMemo(() => {
    const min = data?.summary.total_work_minutes ?? report?.summary.total_work_minutes ?? 0;
    return minutesToHourLabel(min);
  }, [data?.summary.total_work_minutes, report?.summary.total_work_minutes]);
  const metricLate = useMemo(() => String(data?.summary.late_count ?? report?.summary.late_count ?? 0), [
    data?.summary.late_count,
    report?.summary.late_count,
  ]);
  const rangeLabel = useMemo(() => `${toDmy(range.from)} - ${toDmy(range.to)}`, [range.from, range.to]);

  return (
    <Screen
      title={me?.account.role === 'employee' ? 'Lịch sử chấm công' : 'Báo cáo chấm công'}
      subtitle={me?.account.role === 'employee' ? 'Xem theo hôm nay / tuần trước / tháng trước' : 'Tổng hợp theo phòng ban / nhân viên'}
    >
      <Tabs3 value={tab} onChange={setTab} labels={['Hôm nay', 'Tuần trước', 'Tháng trước']} />

      <Field
        label={`Khoảng thời gian (${rangeTitle})`}
        value={rangeLabel}
        onChangeText={() => {}}
        placeholder="dd/mm/yyyy - dd/mm/yyyy"
      />

      <View style={styles.metricRow}>
        <Metric value={metricTotal} label="Tổng giờ" />
        <Metric value={metricLate} label="Lần đi trễ" />
      </View>

      <View>
        {loading ? <StatusBox text="Đang tải lịch sử..." /> : null}
        {error ? <StatusBox text={error} /> : null}
        {data?.days?.map((d) => (
          <View key={d.date} style={styles.item}>
            <Text style={styles.itemTitle}>{toDmy(d.date)}</Text>
            <Text style={styles.itemDetail}>{formatDayDetail(d)}</Text>
          </View>
        ))}
        {report?.details?.slice(0, 30).map((d, idx) => (
          <View key={`${d.employee_id}-${d.date}-${idx}`} style={styles.item}>
            <Text style={styles.itemTitle}>
              {toDmy(d.date)} • {d.full_name}
            </Text>
            <Text style={styles.itemDetail}>{formatReportDetail(d)}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

function toYmd(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function startOfWeekMonday(d: Date): Date {
  const x = startOfDay(d);
  const dow = x.getDay(); // 0=Sun..6=Sat
  const delta = dow === 0 ? -6 : 1 - dow;
  return addDays(x, delta);
}

function lastWeekRange(now: Date): { from: Date; to: Date } {
  const thisWeekStart = startOfWeekMonday(now);
  const lastWeekStart = addDays(thisWeekStart, -7);
  const lastWeekEnd = addDays(thisWeekStart, -1);
  return { from: lastWeekStart, to: lastWeekEnd };
}

function lastMonthRange(now: Date): { from: Date; to: Date } {
  const to = startOfDay(now);
  const from = addDays(to, -29);
  return { from, to };
}

function toDmy(ymd: string): string {
  const [y, m, d] = ymd.split('-');
  if (!y || !m || !d) return ymd;
  return `${d}/${m}/${y}`;
}

function minutesToHourLabel(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h <= 0) return `${m}m`;
  if (m <= 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function formatTime(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function formatDayDetail(d: ama.AttendanceDayRecord): string {
  const ci = formatTime(d.checkin?.timestamp);
  const co = formatTime(d.checkout?.timestamp);

  const parts: string[] = [];
  if (ci) parts.push(`Vào ${ci}`);
  if (co) parts.push(`Ra ${co}`);

  const location = [d.building_name, d.floor_name].filter(Boolean).join(' - ');
  if (location) parts.push(location);

  const worked = d.worked_minutes != null ? minutesToHourLabel(d.worked_minutes) : null;
  if (worked) parts.push(`Giờ: ${worked}`);

  parts.push(`Trạng thái: ${d.status}`);
  return parts.join(' • ');
}

function formatReportDetail(d: ama.AttendanceReportData['details'][number]): string {
  const ci = formatTime(d.checkin_at ?? undefined);
  const co = formatTime(d.checkout_at ?? undefined);

  const parts: string[] = [];
  if (ci) parts.push(`Vào ${ci}`);
  if (co) parts.push(`Ra ${co}`);

  if (d.department_name) parts.push(d.department_name);

  const worked = d.worked_minutes != null ? minutesToHourLabel(d.worked_minutes) : null;
  if (worked) parts.push(`Giờ: ${worked}`);

  parts.push(`Trạng thái: ${d.status}`);
  return parts.join(' • ');
}

const styles = StyleSheet.create({
  metricRow: {
    flexDirection: 'row',
    gap: wf.spacing.md,
  },
  item: {
    backgroundColor: wf.colors.panel,
    borderColor: wf.colors.line,
    borderWidth: wf.border.width,
    borderRadius: wf.radius.md,
    padding: wf.spacing.md,
    marginBottom: wf.spacing.sm,
  },
  itemTitle: {
    color: wf.colors.ink,
    fontWeight: '700',
    marginBottom: 4,
  },
  itemDetail: {
    color: wf.colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
});
