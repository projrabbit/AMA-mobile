import { Platform } from 'react-native';
import Constants from 'expo-constants';

import { apiRequest } from './client';

export type AccountInfo = {
  account_id: number;
  username: string;
  role: string;
  is_active: boolean;
  last_login_at?: string | null;
};

export type EmployeeInfo = {
  employee_id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  position?: string | null;
  department_id: number;
  status: string;
};

export type LoginData = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  account: AccountInfo;
  employee: EmployeeInfo;
};

export type MeData = {
  account: AccountInfo;
  employee: EmployeeInfo;
};

export type TodayRecordInfo = {
  record_id: number;
  timestamp: string;
  status: string;
};

export type ShiftInfo = {
  shift_id: number;
  name: string;
  start_time: string;
  end_time: string;
};

export type TodayStatusData = {
  date: string;
  employee_id: number;
  can_check_in: boolean;
  can_check_out: boolean;
  current_shift: ShiftInfo | null;
  latest_checkin: TodayRecordInfo | null;
  latest_checkout: TodayRecordInfo | null;
};

export type AttendanceSummary = {
  work_days: number;
  total_work_minutes: number;
  late_count: number;
  early_leave_count: number;
  rejected_count: number;
};

export type AttendanceDayRecord = {
  date: string;
  checkin: { record_id: number; timestamp: string; status: string; is_late: boolean } | null;
  checkout: { record_id: number; timestamp: string; status: string; is_early_leave: boolean } | null;
  building_name: string | null;
  floor_name: string | null;
  worked_minutes: number | null;
  status: string;
};

export type AttendanceHistoryData = {
  employee: { employee_id: number; full_name: string };
  range: Record<string, unknown>;
  summary: AttendanceSummary;
  days: AttendanceDayRecord[];
};

export type NotificationItem = {
  notification_id: number;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
  meta: Record<string, unknown> | null;
};

export type CheckInData = {
  record_id: number;
  employee_id: number;
  type: string;
  status: string;
  rejection_reason: string | null;
  message: string;
  timestamp: string;
};

export type RefreshData = {
  access_token: string;
  token_type: string;
  expires_in: number;
};

export type MessageData = {
  message: string;
};

export type DashboardSummaryData = {
  date: string;
  total_employees: number;
  checked_in_today: number;
  on_time_count: number;
  late_count: number;
  early_leave_count: number;
  absent_count: number;
  fraud_alerts_today: number;
  on_time_rate: number;
  active_locations: Array<{
    employee_id: number;
    full_name: string;
    department_name: string;
    latitude: number;
    longitude: number;
    altitude: number | null;
    building_id: number | null;
    building_name: string | null;
    floor_id: number | null;
    floor_name: string | null;
    last_checkin_at: string;
  }>;
};

export type RealtimeLocationItem = {
  employee_id: number;
  full_name: string;
  department_id: number;
  department_name: string;
  record_id: number;
  latitude: number;
  longitude: number;
  altitude: number | null;
  gps_accuracy: number | null;
  building_id: number | null;
  building_name: string | null;
  floor_id: number | null;
  floor_name: string | null;
  arcgis_layer_id: string | null;
  checked_in_at: string;
};

export type AttendanceReportData = {
  range: Record<string, string>;
  summary: {
    employee_count: number;
    total_work_days: number;
    total_work_minutes: number;
    late_count: number;
    early_leave_count: number;
    absent_count: number;
    rejected_count: number;
  };
  employees: Array<{
    employee_id: number;
    full_name: string;
    department_name: string;
    work_days: number;
    total_work_minutes: number;
    late_count: number;
    early_leave_count: number;
    absent_count: number;
    rejected_count: number;
  }>;
  details: Array<{
    date: string;
    employee_id: number;
    full_name: string;
    department_name: string;
    checkin_at: string | null;
    checkout_at: string | null;
    worked_minutes: number | null;
    is_late: boolean;
    is_early_leave: boolean;
    status: string;
  }>;
};

export type ExceptionItem = {
  record_id: number;
  employee: { employee_id: number; full_name: string; department_name: string | null };
  type: string;
  timestamp: string;
  status: string;
  rejection_reason: string | null;
  is_late: boolean;
  is_early_leave: boolean;
  fraud_flags:
    | {
        mock_location_detected: boolean;
        gps_spoofing_detected: boolean;
        buddy_punch_suspected: boolean;
        unknown_device: boolean;
        face_mismatch_detected: boolean;
        liveness_failed: boolean;
      }
    | null;
};

export type EmployeeListItem = {
  employee_id: number;
  department_id: number;
  department_name: string;
  full_name: string;
  email: string;
  phone: string | null;
  position: string | null;
  hire_date: string | null;
  status: string;
  account: { account_id: number; username: string; role: string; is_active: boolean } | null;
};

export type DepartmentListItem = {
  department_id: number;
  name: string;
  description: string | null;
  manager_id: number | null;
  manager_name: string | null;
  employee_count: number;
  created_at: string;
};

export type ShiftListItem = {
  shift_id: number;
  employee_id: number;
  employee_name: string;
  name: string;
  start_time: string;
  end_time: string;
  late_tolerance_min: number;
  early_leave_min: number;
  apply_to_weekends: boolean;
};

export type DeviceDetail = {
  device_id: number;
  device_fingerprint: string;
  platform: string;
  model: string | null;
  os_version: string | null;
  app_version: string | null;
  registered_at: string;
  is_trusted: boolean;
};

export type BuildingListItem = {
  building_id: number;
  name: string | null;
  address: string | null;
  center_lat: number | null;
  center_lng: number | null;
  total_floors: number | null;
  arcgis_layer_id: string | null;
  floors:
    | Array<{
        floor_id: number;
        floor_number: number | null;
        floor_name: string | null;
        altitude_min: number | null;
        altitude_max: number | null;
      }>
    | null;
};

export type FloorListItem = {
  floor_id: number;
  building_id: number;
  floor_number: number | null;
  floor_name: string | null;
  altitude_min: number | null;
  altitude_max: number | null;
};

export type GeofenceListItem = {
  geofence_id: number;
  geofence_rule_id: number;
  name: string | null;
  building_id: number | null;
  building_name: string | null;
  floor_id: number | null;
  floor_name: string | null;
  center_lat: number | null;
  center_lng: number | null;
  radius_meters: number | null;
  altitude_min: number | null;
  altitude_max: number | null;
  allow_checkin: boolean | null;
  allow_checkout: boolean | null;
  is_active: boolean | null;
  created_by_account_id: number | null;
};

export type AuditLogItem = {
  log_id: number;
  account_id: number;
  action_type: string;
  target_entity: string;
  target_id: number | null;
  payload: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
};

export type AuditLogListData = {
  items: AuditLogItem[];
  total: number;
  limit: number;
  offset: number;
};

export type FraudRecordItem = {
  fraud_id: number;
  record_id: number;
  employee: { employee_id: number; full_name: string; department_name: string | null };
  attendance_type: string;
  attendance_timestamp: string;
  mock_location_detected: boolean;
  gps_spoofing_detected: boolean;
  buddy_punch_suspected: boolean;
  unknown_device: boolean;
  face_mismatch_detected: boolean;
  liveness_failed: boolean;
  confidence_score: number | null;
  reason: string | null;
  checked_at: string;
};

export async function login(input: { username: string; password: string }): Promise<LoginData> {
  return apiRequest<LoginData>({
    path: '/api/v1/auth/login',
    method: 'POST',
    json: { username: input.username, password: input.password },
  });
}

export async function refreshAccessToken(input: { refresh_token: string }): Promise<RefreshData> {
  return apiRequest<RefreshData>({
    path: '/api/v1/auth/refresh',
    method: 'POST',
    json: { refresh_token: input.refresh_token },
  });
}

export async function me(token: string): Promise<MeData> {
  return apiRequest<MeData>({ path: '/api/v1/auth/me', token });
}

export async function logout(token: string, input?: { refresh_token?: string }): Promise<MessageData> {
  return apiRequest<MessageData>({
    path: '/api/v1/auth/logout',
    method: 'POST',
    token,
    json: input?.refresh_token ? { refresh_token: input.refresh_token } : undefined,
  });
}

export async function changePassword(
  token: string,
  input: { current_password: string; new_password: string; confirm_password: string },
): Promise<MessageData> {
  return apiRequest<MessageData>({
    path: '/api/v1/auth/change-password',
    method: 'PUT',
    token,
    json: input,
  });
}

export async function todayStatus(token: string): Promise<TodayStatusData> {
  return apiRequest<TodayStatusData>({ path: '/api/v1/attendance/today-status', token });
}

export async function attendanceHistory(token: string, input: { from: string; to: string }): Promise<AttendanceHistoryData> {
  return apiRequest<AttendanceHistoryData>({
    path: '/api/v1/attendance/history',
    token,
    query: { from: input.from, to: input.to, page: 1, limit: 50 },
  });
}

export async function listExceptions(
  token: string,
  input: {
    from?: string;
    to?: string;
    status?: string;
    department_id?: number;
    employee_id?: number;
    reason?: string;
    page?: number;
    limit?: number;
  },
): Promise<{ items: ExceptionItem[] }> {
  const page = input.page ?? 1;
  const limit = input.limit ?? 20;
  const data = await apiRequest<ExceptionItem[]>({
    path: '/api/v1/attendance/exceptions',
    token,
    query: {
      from: input.from,
      to: input.to,
      status: input.status,
      department_id: input.department_id,
      employee_id: input.employee_id,
      reason: input.reason,
      page,
      limit,
    },
  });
  return { items: data };
}

export async function approveAttendanceRecord(
  token: string,
  recordId: number,
  input: { note?: string | null } = {},
): Promise<unknown> {
  return apiRequest<unknown>({
    path: `/api/v1/attendance/${recordId}/approve`,
    method: 'PUT',
    token,
    json: input,
  });
}

export async function attendanceRecordDetail(token: string, recordId: number): Promise<unknown> {
  return apiRequest<unknown>({ path: `/api/v1/attendance/${recordId}`, token });
}

export async function listNotifications(token: string): Promise<NotificationItem[]> {
  return apiRequest<NotificationItem[]>({
    path: '/api/v1/notifications',
    token,
    query: { page: 1, limit: 50 },
  });
}

export async function markAllRead(token: string): Promise<{ marked_count: number }> {
  return apiRequest<{ marked_count: number }>({
    path: '/api/v1/notifications/read-all',
    token,
    method: 'PUT',
  });
}

export async function markRead(token: string, notificationId: number): Promise<{ notification_id: number; is_read: boolean }> {
  return apiRequest<{ notification_id: number; is_read: boolean }>({
    path: `/api/v1/notifications/${notificationId}/read`,
    token,
    method: 'PUT',
  });
}

export async function dashboardSummary(token: string, input: { date?: string }): Promise<DashboardSummaryData> {
  return apiRequest<DashboardSummaryData>({
    path: '/api/v1/dashboard/summary',
    token,
    query: { date: input.date },
  });
}

export async function realtimeLocations(
  token: string,
  input: { building_id?: number; floor_id?: number; department_id?: number },
): Promise<RealtimeLocationItem[]> {
  return apiRequest<RealtimeLocationItem[]>({
    path: '/api/v1/realtime/employees-location',
    token,
    query: input,
  });
}

export async function attendanceReport(
  token: string,
  input: { from: string; to: string; department_id?: number; employee_id?: number },
): Promise<AttendanceReportData> {
  return apiRequest<AttendanceReportData>({
    path: '/api/v1/reports/attendance',
    token,
    query: input,
  });
}

export async function listEmployees(
  token: string,
  input: { department_id?: number; status?: string; q?: string; page?: number; limit?: number },
): Promise<EmployeeListItem[]> {
  return apiRequest<EmployeeListItem[]>({
    path: '/api/v1/employees',
    token,
    query: { ...input, page: input.page ?? 1, limit: input.limit ?? 20 },
  });
}

export async function getEmployeeDetail(token: string, employeeId: number): Promise<unknown> {
  return apiRequest<unknown>({ path: `/api/v1/employees/${employeeId}`, token });
}

export async function listDepartments(
  token: string,
  input: { q?: string; page?: number; limit?: number } = {},
): Promise<DepartmentListItem[]> {
  return apiRequest<DepartmentListItem[]>({
    path: '/api/v1/departments',
    token,
    query: { q: input.q, page: input.page ?? 1, limit: input.limit ?? 50 },
  });
}

export async function listShifts(
  token: string,
  input: { employee_id?: number; page?: number; limit?: number } = {},
): Promise<ShiftListItem[]> {
  return apiRequest<ShiftListItem[]>({
    path: '/api/v1/shifts',
    token,
    query: { employee_id: input.employee_id, page: input.page ?? 1, limit: input.limit ?? 50 },
  });
}

export async function registerDevice(
  token: string,
  input: {
    device_fingerprint: string;
    platform: string;
    model: string;
    os_version: string;
    app_version: string;
  },
): Promise<unknown> {
  return apiRequest<unknown>({
    path: '/api/v1/devices/register',
    method: 'POST',
    token,
    json: input,
  });
}

export async function getMyDevices(token: string): Promise<DeviceDetail[]> {
  return apiRequest<DeviceDetail[]>({ path: '/api/v1/devices/me', token });
}

export async function listDevices(
  token: string,
  input: { employee_id?: number; is_trusted?: boolean; platform?: string; page?: number; limit?: number } = {},
): Promise<DeviceDetail[]> {
  return apiRequest<DeviceDetail[]>({
    path: '/api/v1/devices',
    token,
    query: { ...input, page: input.page ?? 1, limit: input.limit ?? 20 },
  });
}

export async function trustDevice(token: string, deviceId: number, input: { is_trusted: boolean }): Promise<unknown> {
  return apiRequest<unknown>({
    path: `/api/v1/devices/${deviceId}/trust`,
    method: 'PUT',
    token,
    json: input,
  });
}

export async function listBuildings(
  token: string,
  input: { q?: string; include_floors?: boolean } = {},
): Promise<BuildingListItem[]> {
  return apiRequest<BuildingListItem[]>({
    path: '/api/v1/buildings/',
    token,
    query: { q: input.q, include_floors: input.include_floors ?? false },
  });
}

export async function listFloors(token: string, buildingId: number): Promise<FloorListItem[]> {
  return apiRequest<FloorListItem[]>({ path: `/api/v1/buildings/${buildingId}/floors`, token });
}

export async function listGeofences(
  token: string,
  input: { building_id?: number; floor_id?: number; is_active?: boolean } = {},
): Promise<GeofenceListItem[]> {
  return apiRequest<GeofenceListItem[]>({
    path: '/api/v1/geofences/',
    token,
    query: input,
  });
}

export async function listAuditLogs(
  token: string,
  input: { account_id?: number; action_type?: string; target_entity?: string; limit?: number; offset?: number } = {},
): Promise<AuditLogListData> {
  return apiRequest<AuditLogListData>({
    path: '/api/v1/audit-logs/',
    token,
    query: input,
  });
}

export async function listFraudRecords(
  token: string,
  input: { employee_id?: number; from?: string; to?: string; page?: number; limit?: number } = {},
): Promise<FraudRecordItem[]> {
  return apiRequest<FraudRecordItem[]>({
    path: '/api/v1/fraud/records',
    token,
    query: { ...input, page: input.page ?? 1, limit: input.limit ?? 20 },
  });
}

export async function getFraudRecord(token: string, fraudId: number): Promise<unknown> {
  return apiRequest<unknown>({ path: `/api/v1/fraud/records/${fraudId}`, token });
}

function inferImageType(uri: string): string {
  const u = uri.toLowerCase();
  if (u.endsWith('.png')) return 'image/png';
  if (u.endsWith('.heic')) return 'image/heic';
  return 'image/jpeg';
}

export async function submitAttendance(input: {
  token: string;
  type: 'in' | 'out';
  selfieUri: string;
  employeeId?: number;
  deviceFingerprint: string;
  latitude: number;
  longitude: number;
  altitude: number;
  gpsAccuracy: number;
}): Promise<CheckInData> {
  const form = new FormData();
  form.append('device_fingerprint', input.deviceFingerprint);
  form.append('platform', Platform.OS);
  form.append('os_version', String(Platform.Version ?? ''));
  form.append('app_version', String(Constants.expoConfig?.version ?? (Constants as unknown as { nativeAppVersion?: string }).nativeAppVersion ?? ''));
  form.append('latitude', String(input.latitude));
  form.append('longitude', String(input.longitude));
  form.append('altitude', String(input.altitude));
  form.append('gps_accuracy', String(input.gpsAccuracy));
  form.append('liveness_signals', JSON.stringify({}));
  if (input.employeeId !== undefined) form.append('employee_id', String(input.employeeId));

  form.append('face_image', {
    uri: input.selfieUri,
    name: `selfie-${Date.now()}.jpg`,
    type: inferImageType(input.selfieUri),
  } as unknown as Blob);

  const path = input.type === 'out' ? '/api/v1/attendance/check-out' : '/api/v1/attendance/check-in';
  return apiRequest<CheckInData>({
    path,
    method: 'POST',
    token: input.token,
    formData: form,
  });
}
