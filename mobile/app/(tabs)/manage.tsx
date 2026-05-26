import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '@/api/client';
import * as ama from '@/api/ama';
import { Box, Button, Metric, Row, Screen, StatusBox, wf } from '@/components/Wireframe';
import { useSession } from '@/state/session';

type SectionKey =
  | 'dashboard'
  | 'report'
  | 'realtime'
  | 'exceptions'
  | 'employees'
  | 'departments'
  | 'shifts'
  | 'buildings'
  | 'geofences'
  | 'fraud'
  | 'audit'
  | 'my_devices'
  | 'devices';

type Section = {
  key: SectionKey;
  label: string;
  visible: (role: string) => boolean;
};

function normalizeArrayPayload<T>(input: unknown): T[] {
  if (Array.isArray(input)) return input as T[];
  if (input && typeof input === 'object' && Array.isArray((input as { items?: unknown }).items)) {
    return (input as { items: T[] }).items;
  }
  return [];
}

function normalizeAuditPayload(input: unknown): ama.AuditLogListData | null {
  if (!input || typeof input !== 'object') return null;
  const anyInput = input as Record<string, unknown>;

  const raw = (anyInput.data && typeof anyInput.data === 'object' ? (anyInput.data as Record<string, unknown>) : anyInput) as Record<
    string,
    unknown
  >;

  const items = Array.isArray(raw.items) ? (raw.items as ama.AuditLogItem[]) : [];
  const total = typeof raw.total === 'number' ? raw.total : items.length;
  const limit = typeof raw.limit === 'number' ? raw.limit : items.length;
  const offset = typeof raw.offset === 'number' ? raw.offset : 0;
  return { items, total, limit, offset };
}

export default function ManageScreen() {
  const { accessToken, me } = useSession();
  const role = me?.account.role ?? '—';

  const [sectionKey, setSectionKey] = useState<SectionKey>('dashboard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<unknown>(null);

  const sections = useMemo<Section[]>(
    () => [
      { key: 'dashboard', label: 'Dashboard', visible: (r) => r === 'manager' || r === 'hr' || r === 'admin' },
      { key: 'report', label: 'Báo cáo chấm công', visible: (r) => r === 'manager' || r === 'hr' || r === 'admin' },
      { key: 'realtime', label: 'Realtime vị trí', visible: (r) => r === 'hr' || r === 'admin' },
      { key: 'exceptions', label: 'Ngoại lệ chấm công', visible: (r) => r === 'hr' || r === 'admin' },
      { key: 'employees', label: 'Nhân viên', visible: (r) => r === 'hr' || r === 'admin' },
      { key: 'departments', label: 'Phòng ban', visible: (r) => r === 'hr' || r === 'admin' },
      { key: 'shifts', label: 'Ca làm', visible: (r) => r === 'hr' || r === 'admin' },
      { key: 'buildings', label: 'Tòa nhà / Tầng', visible: (r) => r === 'hr' || r === 'admin' },
      { key: 'geofences', label: 'Geofence', visible: (r) => r === 'hr' || r === 'admin' },
      { key: 'fraud', label: 'Fraud records', visible: (r) => r === 'hr' || r === 'admin' },
      { key: 'audit', label: 'Audit logs', visible: (r) => r === 'hr' || r === 'admin' },
      { key: 'my_devices', label: 'Thiết bị của tôi', visible: (r) => r === 'employee' },
      { key: 'devices', label: 'Thiết bị (admin)', visible: (r) => r === 'admin' },
    ],
    [],
  );

  const visibleSections = useMemo(() => sections.filter((s) => s.visible(role)), [sections, role]);

  useEffect(() => {
    const first = visibleSections[0]?.key;
    if (!first) return;
    if (!visibleSections.some((s) => s.key === sectionKey)) setSectionKey(first);
  }, [sectionKey, visibleSections]);

  const range = useMemo(() => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 7);
    return { from: toYmd(from), to: toYmd(to) };
  }, []);

  const loadSection = async (key: SectionKey) => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    setPayload(null);
    try {
      switch (key) {
        case 'dashboard': {
          const data = await ama.dashboardSummary(accessToken, {});
          setPayload(data);
          return;
        }
        case 'report': {
          const data = await ama.attendanceReport(accessToken, { from: range.from, to: range.to });
          setPayload(data);
          return;
        }
        case 'realtime': {
          const data = await ama.realtimeLocations(accessToken, {});
          setPayload(normalizeArrayPayload<ama.RealtimeLocationItem>(data));
          return;
        }
        case 'exceptions': {
          const data = await ama.listExceptions(accessToken, { from: range.from, to: range.to, page: 1, limit: 20 });
          setPayload(data.items);
          return;
        }
        case 'employees': {
          const data = await ama.listEmployees(accessToken, { page: 1, limit: 20 });
          setPayload(normalizeArrayPayload<ama.EmployeeListItem>(data));
          return;
        }
        case 'departments': {
          const data = await ama.listDepartments(accessToken, { page: 1, limit: 50 });
          setPayload(normalizeArrayPayload<ama.DepartmentListItem>(data));
          return;
        }
        case 'shifts': {
          const data = await ama.listShifts(accessToken, { page: 1, limit: 50 });
          setPayload(normalizeArrayPayload<ama.ShiftListItem>(data));
          return;
        }
        case 'buildings': {
          const data = await ama.listBuildings(accessToken, { include_floors: true });
          setPayload(normalizeArrayPayload<ama.BuildingListItem>(data));
          return;
        }
        case 'geofences': {
          const data = await ama.listGeofences(accessToken, {});
          setPayload(normalizeArrayPayload<ama.GeofenceListItem>(data));
          return;
        }
        case 'fraud': {
          const data = await ama.listFraudRecords(accessToken, { from: range.from, to: range.to, page: 1, limit: 20 });
          setPayload(normalizeArrayPayload<ama.FraudRecordItem>(data));
          return;
        }
        case 'audit': {
          const data = await ama.listAuditLogs(accessToken, { limit: 50, offset: 0 });
          setPayload(data);
          return;
        }
        case 'my_devices': {
          const data = await ama.getMyDevices(accessToken);
          setPayload(normalizeArrayPayload<ama.DeviceDetail>(data));
          return;
        }
        case 'devices': {
          const data = await ama.listDevices(accessToken, { page: 1, limit: 20 });
          setPayload(normalizeArrayPayload<ama.DeviceDetail>(data));
          return;
        }
      }
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Không thể tải dữ liệu';
      setError(msg);
      setPayload(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!accessToken) return;
    if (!visibleSections.some((s) => s.key === sectionKey)) return;
    void loadSection(sectionKey);
  }, [accessToken, sectionKey, visibleSections]);

  const sectionTitle = useMemo(
    () => visibleSections.find((s) => s.key === sectionKey)?.label ?? '—',
    [visibleSections, sectionKey],
  );

  const dashboard = payload && sectionKey === 'dashboard' ? (payload as ama.DashboardSummaryData) : null;
  const report = payload && sectionKey === 'report' ? (payload as ama.AttendanceReportData) : null;
  const realtime = sectionKey === 'realtime' ? normalizeArrayPayload<ama.RealtimeLocationItem>(payload) : null;
  const exceptions = sectionKey === 'exceptions' ? normalizeArrayPayload<ama.ExceptionItem>(payload) : null;
  const employees = sectionKey === 'employees' ? normalizeArrayPayload<ama.EmployeeListItem>(payload) : null;
  const departments = sectionKey === 'departments' ? normalizeArrayPayload<ama.DepartmentListItem>(payload) : null;
  const shifts = sectionKey === 'shifts' ? normalizeArrayPayload<ama.ShiftListItem>(payload) : null;
  const buildings = sectionKey === 'buildings' ? normalizeArrayPayload<ama.BuildingListItem>(payload) : null;
  const geofences = sectionKey === 'geofences' ? normalizeArrayPayload<ama.GeofenceListItem>(payload) : null;
  const fraud = sectionKey === 'fraud' ? normalizeArrayPayload<ama.FraudRecordItem>(payload) : null;
  const audit = sectionKey === 'audit' ? normalizeAuditPayload(payload) : null;
  const myDevices = sectionKey === 'my_devices' ? normalizeArrayPayload<ama.DeviceDetail>(payload) : null;
  const devices = sectionKey === 'devices' ? normalizeArrayPayload<ama.DeviceDetail>(payload) : null;

  return (
    <Screen title="Quản trị / Báo cáo" subtitle={`Role: ${role}`}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sectionRow}>
        {visibleSections.map((s) => (
          <View key={s.key} style={styles.sectionChip}>
            <Button
              label={s.label}
              variant={s.key === sectionKey ? 'primary' : 'secondary'}
              onPress={() => setSectionKey(s.key)}
            />
          </View>
        ))}
      </ScrollView>

      <Box>
        <Row label="Mục" value={sectionTitle} />
        <Row label="Khoảng (mặc định)" value={`${toDmy(range.from)} - ${toDmy(range.to)}`} />
      </Box>

      {dashboard ? <DashboardPanel data={dashboard} /> : null}
      {report ? <ReportPanel data={report} /> : null}
      {realtime !== null ? <RealtimePanel items={realtime} /> : null}
      {exceptions !== null ? <ExceptionsPanel items={exceptions} /> : null}
      {employees !== null ? <EmployeesPanel items={employees} /> : null}
      {departments !== null ? <DepartmentsPanel items={departments} /> : null}
      {shifts !== null ? <ShiftsPanel items={shifts} /> : null}
      {buildings !== null ? <BuildingsPanel items={buildings} /> : null}
      {geofences !== null ? <GeofencesPanel items={geofences} /> : null}
      {fraud !== null ? <FraudPanel items={fraud} /> : null}
      {audit !== null ? <AuditPanel data={audit} /> : null}
      {myDevices !== null ? <DevicesPanel title="Thiết bị của tôi" items={myDevices} /> : null}
      {devices !== null ? <DevicesPanel title="Thiết bị (admin)" items={devices} /> : null}

      {loading ? <StatusBox text="Đang tải..." /> : null}
      {error ? <StatusBox text={error} /> : null}
    </Screen>
  );
}

function toYmd(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function toDmy(ymd: string): string {
  const [y, m, d] = ymd.split('-');
  if (!y || !m || !d) return ymd;
  return `${d}/${m}/${y}`;
}

function formatTime(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm} ${hh}:${mi}`;
}

function minutesToHourLabel(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h <= 0) return `${m}m`;
  if (m <= 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function truthyFlagLabels(flags: Record<string, boolean | undefined | null>): string[] {
  return Object.entries(flags)
    .filter(([, v]) => !!v)
    .map(([k]) => k);
}

function DashboardPanel({ data }: { data: ama.DashboardSummaryData }) {
  const onTimeRate = Number.isFinite(data.on_time_rate) ? `${Math.round(data.on_time_rate * 100)}%` : '—';
  const activeLocations = Array.isArray(data.active_locations) ? data.active_locations : [];

  return (
    <>
      <View style={styles.metricRow}>
        <Metric value={String(data.total_employees ?? 0)} label="Tổng nhân sự" />
        <Metric value={String(data.checked_in_today ?? 0)} label="Đã chấm công" />
      </View>
      <View style={styles.metricRow}>
        <Metric value={String(data.late_count ?? 0)} label="Đi trễ" />
        <Metric value={String(data.absent_count ?? 0)} label="Vắng" />
      </View>
      <Box>
        <Row label="Đúng giờ" value={String(data.on_time_count ?? 0)} />
        <Row label="Về sớm" value={String(data.early_leave_count ?? 0)} />
        <Row label="Fraud alerts" value={String(data.fraud_alerts_today ?? 0)} />
        <Row label="Tỉ lệ đúng giờ" value={onTimeRate} />
      </Box>

      <Box>
        <Text style={styles.sectionTitle}>Đang hoạt động</Text>
        {activeLocations.length <= 0 ? (
          <Text style={styles.emptyText}>Không có ai đang check-in trong khoảng thời gian gần đây.</Text>
        ) : (
          activeLocations.slice(0, 20).map((x) => (
            <View key={x.employee_id} style={styles.item}>
              <Text style={styles.itemTitle}>{x.full_name}</Text>
              <Text style={styles.itemDetail}>
                {x.department_name}
                {x.building_name ? ` • ${x.building_name}` : ''}
                {x.floor_name ? ` • ${x.floor_name}` : ''}
              </Text>
              <Text style={styles.itemDetail}>
                {formatTime(x.last_checkin_at)} • {typeof x.latitude === 'number' ? x.latitude.toFixed(6) : '—'},{' '}
                {typeof x.longitude === 'number' ? x.longitude.toFixed(6) : '—'}
              </Text>
            </View>
          ))
        )}
      </Box>
    </>
  );
}

function ReportPanel({ data }: { data: ama.AttendanceReportData }) {
  if (!data.summary || !Array.isArray(data.employees)) {
    return <StatusBox text="Dữ liệu báo cáo không hợp lệ (thiếu summary/employees)." />;
  }

  return (
    <>
      <View style={styles.metricRow}>
        <Metric value={String(data.summary.employee_count)} label="Nhân viên" />
        <Metric value={minutesToHourLabel(data.summary.total_work_minutes)} label="Tổng giờ" />
      </View>
      <View style={styles.metricRow}>
        <Metric value={String(data.summary.late_count)} label="Đi trễ" />
        <Metric value={String(data.summary.rejected_count)} label="Bị từ chối" />
      </View>

      <Box>
        <Text style={styles.sectionTitle}>Theo nhân viên</Text>
        {data.employees.length <= 0 ? (
          <Text style={styles.emptyText}>Không có dữ liệu trong khoảng thời gian này.</Text>
        ) : (
          data.employees.slice(0, 30).map((e) => (
            <View key={e.employee_id} style={styles.item}>
              <Text style={styles.itemTitle}>{e.full_name}</Text>
              <Text style={styles.itemDetail}>{e.department_name}</Text>
              <Text style={styles.itemDetail}>
                Giờ: {minutesToHourLabel(e.total_work_minutes)} • Trễ: {e.late_count} • Vắng: {e.absent_count}
              </Text>
            </View>
          ))
        )}
        <Text style={styles.hintText}>Hiển thị tối đa 30 nhân viên (có thể mở rộng sau).</Text>
      </Box>
    </>
  );
}

function RealtimePanel({ items }: { items: ama.RealtimeLocationItem[] }) {
  const list = Array.isArray(items) ? items : normalizeArrayPayload<ama.RealtimeLocationItem>(items);
  return (
    <Box>
      <Text style={styles.sectionTitle}>Realtime vị trí</Text>
      {list.length <= 0 ? (
        <Text style={styles.emptyText}>Chưa có dữ liệu realtime.</Text>
      ) : (
        list.slice(0, 30).map((x) => (
          <View key={x.record_id} style={styles.item}>
            <Text style={styles.itemTitle}>{x.full_name}</Text>
            <Text style={styles.itemDetail}>
              {x.department_name}
              {x.building_name ? ` • ${x.building_name}` : ''}
              {x.floor_name ? ` • ${x.floor_name}` : ''}
            </Text>
            <Text style={styles.itemDetail}>
              {formatTime(x.checked_in_at)} • {x.latitude.toFixed(6)}, {x.longitude.toFixed(6)}
            </Text>
          </View>
        ))
      )}
      <Text style={styles.hintText}>Hiển thị tối đa 30 bản ghi.</Text>
    </Box>
  );
}

function ExceptionsPanel({ items }: { items: ama.ExceptionItem[] }) {
  return (
    <Box>
      <Text style={styles.sectionTitle}>Ngoại lệ chấm công</Text>
      {items.length <= 0 ? (
        <Text style={styles.emptyText}>Không có ngoại lệ trong khoảng thời gian này.</Text>
      ) : (
        items.map((x) => {
          const flags = x.fraud_flags
            ? truthyFlagLabels({
                mock_location: x.fraud_flags.mock_location_detected,
                gps_spoofing: x.fraud_flags.gps_spoofing_detected,
                buddy_punch: x.fraud_flags.buddy_punch_suspected,
                unknown_device: x.fraud_flags.unknown_device,
                face_mismatch: x.fraud_flags.face_mismatch_detected,
                liveness_failed: x.fraud_flags.liveness_failed,
              })
            : [];
          const flagText = flags.length ? `Fraud: ${flags.join(', ')}` : null;
          const reasonText = x.rejection_reason ? `Lý do: ${x.rejection_reason}` : null;

          return (
            <View key={x.record_id} style={styles.item}>
              <Text style={styles.itemTitle}>{x.employee.full_name}</Text>
              <Text style={styles.itemDetail}>{x.employee.department_name ?? '—'}</Text>
              <Text style={styles.itemDetail}>
                {x.type.toUpperCase()} • {formatTime(x.timestamp)} • {x.status}
              </Text>
              {x.is_late ? <Text style={styles.badgeText}>Đi trễ</Text> : null}
              {x.is_early_leave ? <Text style={styles.badgeText}>Về sớm</Text> : null}
              {reasonText ? <Text style={styles.itemDetail}>{reasonText}</Text> : null}
              {flagText ? <Text style={styles.itemDetail}>{flagText}</Text> : null}
            </View>
          );
        })
      )}
    </Box>
  );
}

function EmployeesPanel({ items }: { items: ama.EmployeeListItem[] }) {
  return (
    <Box>
      <Text style={styles.sectionTitle}>Nhân viên</Text>
      {items.length <= 0 ? (
        <Text style={styles.emptyText}>Không có nhân viên.</Text>
      ) : (
        items.map((e, idx) => (
          <View key={`${e.employee_id}-${idx}`} style={styles.item}>
            <Text style={styles.itemTitle}>{e.full_name}</Text>
            <Text style={styles.itemDetail}>
              {e.department_name} • {e.position ?? '—'}
            </Text>
            <Text style={styles.itemDetail}>
              {e.email} • {e.status}
              {e.account ? ` • ${e.account.role}` : ''}
            </Text>
          </View>
        ))
      )}
    </Box>
  );
}

function DepartmentsPanel({ items }: { items: ama.DepartmentListItem[] }) {
  return (
    <Box>
      <Text style={styles.sectionTitle}>Phòng ban</Text>
      {items.length <= 0 ? (
        <Text style={styles.emptyText}>Không có phòng ban.</Text>
      ) : (
        items.map((d, idx) => (
          <View key={`${d.department_id}-${idx}`} style={styles.item}>
            <Text style={styles.itemTitle}>{d.name}</Text>
            <Text style={styles.itemDetail}>
              Quản lý: {d.manager_name ?? '—'} • Nhân sự: {d.employee_count}
            </Text>
          </View>
        ))
      )}
    </Box>
  );
}

function ShiftsPanel({ items }: { items: ama.ShiftListItem[] }) {
  return (
    <Box>
      <Text style={styles.sectionTitle}>Ca làm</Text>
      {items.length <= 0 ? (
        <Text style={styles.emptyText}>Không có ca làm.</Text>
      ) : (
        items.map((s) => (
          <View key={s.shift_id} style={styles.item}>
            <Text style={styles.itemTitle}>{s.name}</Text>
            <Text style={styles.itemDetail}>
              {s.employee_name} • {s.start_time} - {s.end_time}
            </Text>
            <Text style={styles.itemDetail}>
              Trễ: {s.late_tolerance_min}m • Về sớm: {s.early_leave_min}m • Cuối tuần: {s.apply_to_weekends ? 'Có' : 'Không'}
            </Text>
          </View>
        ))
      )}
    </Box>
  );
}

function BuildingsPanel({ items }: { items: ama.BuildingListItem[] }) {
  return (
    <Box>
      <Text style={styles.sectionTitle}>Tòa nhà / Tầng</Text>
      {items.length <= 0 ? (
        <Text style={styles.emptyText}>Không có tòa nhà.</Text>
      ) : (
        items.map((b) => (
          <View key={b.building_id} style={styles.item}>
            <Text style={styles.itemTitle}>{b.name ?? `Building #${b.building_id}`}</Text>
            <Text style={styles.itemDetail}>{b.address ?? '—'}</Text>
            <Text style={styles.itemDetail}>
              Tầng: {b.floors?.length ?? 0} • ArcGIS: {b.arcgis_layer_id ?? '—'}
            </Text>
          </View>
        ))
      )}
    </Box>
  );
}

function GeofencesPanel({ items }: { items: ama.GeofenceListItem[] }) {
  return (
    <Box>
      <Text style={styles.sectionTitle}>Geofence</Text>
      {items.length <= 0 ? (
        <Text style={styles.emptyText}>Không có geofence.</Text>
      ) : (
        items.map((g) => (
          <View key={g.geofence_id} style={styles.item}>
            <Text style={styles.itemTitle}>{g.name ?? `Geofence #${g.geofence_id}`}</Text>
            <Text style={styles.itemDetail}>
              {g.building_name ?? '—'}
              {g.floor_name ? ` • ${g.floor_name}` : ''}
            </Text>
            <Text style={styles.itemDetail}>
              R={g.radius_meters ?? '—'}m • Active: {g.is_active ? 'Yes' : 'No'} • In/Out: {g.allow_checkin ? 'In' : '—'}/
              {g.allow_checkout ? 'Out' : '—'}
            </Text>
          </View>
        ))
      )}
    </Box>
  );
}

function FraudPanel({ items }: { items: ama.FraudRecordItem[] }) {
  const list = Array.isArray(items) ? items : normalizeArrayPayload<ama.FraudRecordItem>(items);
  return (
    <Box>
      <Text style={styles.sectionTitle}>Fraud records</Text>
      {list.length <= 0 ? (
        <Text style={styles.emptyText}>Không có bản ghi fraud.</Text>
      ) : (
        list.map((f) => {
          const employeeName = f.employee?.full_name ?? `Fraud #${f.fraud_id}`;
          const deptName = f.employee?.department_name ?? '—';
          const flags = truthyFlagLabels({
            mock_location: f.mock_location_detected,
            gps_spoofing: f.gps_spoofing_detected,
            buddy_punch: f.buddy_punch_suspected,
            unknown_device: f.unknown_device,
            face_mismatch: f.face_mismatch_detected,
            liveness_failed: f.liveness_failed,
          });
          return (
            <View key={f.fraud_id} style={styles.item}>
              <Text style={styles.itemTitle}>{employeeName}</Text>
              <Text style={styles.itemDetail}>{deptName}</Text>
              <Text style={styles.itemDetail}>
                {String(f.attendance_type ?? '—').toUpperCase()} • {formatTime(f.attendance_timestamp)} • Score:{' '}
                {f.confidence_score != null ? String(f.confidence_score) : '—'}
              </Text>
              {f.reason ? <Text style={styles.itemDetail}>Lý do: {f.reason}</Text> : null}
              {flags.length ? <Text style={styles.itemDetail}>Flags: {flags.join(', ')}</Text> : null}
            </View>
          );
        })
      )}
    </Box>
  );
}

function AuditPanel({ data }: { data: ama.AuditLogListData }) {
  const items = Array.isArray(data.items) ? data.items : [];
  return (
    <Box>
      <Text style={styles.sectionTitle}>Audit logs</Text>
      <Text style={styles.hintText}>
        Total: {data.total} • Limit: {data.limit} • Offset: {data.offset}
      </Text>
      {items.length <= 0 ? (
        <Text style={styles.emptyText}>Không có log.</Text>
      ) : (
        items.slice(0, 30).map((l) => (
          <View key={l.log_id} style={styles.item}>
            <Text style={styles.itemTitle}>
              {l.action_type} • {l.target_entity}
              {l.target_id != null ? `#${l.target_id}` : ''}
            </Text>
            <Text style={styles.itemDetail}>
              Account #{l.account_id} • {formatTime(l.created_at)} • {l.ip_address ?? '—'}
            </Text>
          </View>
        ))
      )}
      <Text style={styles.hintText}>Hiển thị tối đa 30 log.</Text>
    </Box>
  );
}

function DevicesPanel({ title, items }: { title: string; items: ama.DeviceDetail[] }) {
  return (
    <Box>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.length <= 0 ? (
        <Text style={styles.emptyText}>Không có thiết bị.</Text>
      ) : (
        items.map((d) => (
          <View key={d.device_id} style={styles.item}>
            <Text style={styles.itemTitle}>
              {d.platform} • {d.model ?? '—'}
            </Text>
            <Text style={styles.itemDetail}>Trusted: {d.is_trusted ? 'Yes' : 'No'} • {formatTime(d.registered_at)}</Text>
            <Text style={styles.itemDetail}>Fingerprint: {maskFingerprint(d.device_fingerprint)}</Text>
          </View>
        ))
      )}
    </Box>
  );
}

function maskFingerprint(v: string): string {
  if (!v) return '—';
  if (v.length <= 10) return v;
  return `${v.slice(0, 6)}…${v.slice(-4)}`;
}

const styles = StyleSheet.create({
  sectionRow: {
    paddingHorizontal: wf.spacing.md,
    gap: wf.spacing.sm,
  },
  sectionChip: {
    minWidth: 140,
  },
  metricRow: {
    flexDirection: 'row',
    gap: wf.spacing.md,
  },
  sectionTitle: {
    color: wf.colors.ink,
    fontWeight: '700',
    marginBottom: wf.spacing.sm,
  },
  emptyText: {
    color: wf.colors.muted,
  },
  hintText: {
    color: wf.colors.muted,
    fontSize: 12,
    marginTop: wf.spacing.sm,
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
  badgeText: {
    color: wf.colors.ink,
    fontSize: 12,
    marginTop: 4,
  },
});
