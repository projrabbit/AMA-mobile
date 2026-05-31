import { router } from 'expo-router';
import * as Location from 'expo-location';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

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
  const [coords, setCoords] = useState<{ latitude: number; longitude: number; accuracy: number | null } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

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

  useEffect(() => {
    if (!accessToken) return;
    if (me?.account.role !== 'employee') return;
    let alive = true;
    setLocationError(null);

    (async () => {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (!alive) return;
      if (!perm.granted) {
        setCoords(null);
        setLocationError('Chưa được cấp quyền vị trí.');
        return;
      }

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      if (!alive) return;
      setCoords({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy ?? null,
      });
    })().catch((e) => {
      if (!alive) return;
      setCoords(null);
      setLocationError(e instanceof Error ? e.message : 'Không thể lấy vị trí.');
    });

    return () => {
      alive = false;
    };
  }, [accessToken, me?.account.role]);

  const shiftText = useMemo(() => {
    if (me?.account.role && me.account.role !== 'employee') return 'Tổng quan hôm nay';
    const s = today?.current_shift;
    if (!s) return 'Ca làm: —';
    const name = s.name === 'Office Day Shift' ? 'Ca hành chính' : s.name;
    const start = String(s.start_time ?? '').slice(0, 5);
    const end = String(s.end_time ?? '').slice(0, 5);
    return `${name}: ${start} - ${end}`;
  }, [me?.account.role, today?.current_shift]);

  const latestCheckin = useMemo(() => formatTime(today?.latest_checkin?.timestamp), [today?.latest_checkin?.timestamp]);
  const latestCheckout = useMemo(() => formatTime(today?.latest_checkout?.timestamp), [today?.latest_checkout?.timestamp]);

  const mapHtml = useMemo(() => {
    const user = coords
      ? {
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
        }
      : null;

    if (!user) return null;
    return arcgisMiniMapHtml({ user });
  }, [coords]);

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

      {me?.account.role === 'employee' ? (
        <View style={styles.mapWrap}>
          {mapHtml ? (
            <WebView
              source={{ html: mapHtml }}
              originWhitelist={['*']}
              javaScriptEnabled
              domStorageEnabled
              scrollEnabled={false}
              style={styles.map}
            />
          ) : (
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapPlaceholderTitle}>Bản đồ</Text>
              <Text style={styles.mapPlaceholderText}>Đang lấy vị trí để hiển thị trên ArcGIS.</Text>
            </View>
          )}
        </View>
      ) : (
        <Placeholder label="Bản đồ nhỏ / vị trí hiện tại trong vùng cho phép" />
      )}

      {me?.account.role === 'employee' ? (
        <Box>
          <Row label="Vị trí" value={coords ? `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}` : '—'} />
          <Row label="Độ chính xác" value={coords?.accuracy != null ? `${Math.round(coords.accuracy)}m` : '—'} />
        </Box>
      ) : null}

      {loading ? <StatusBox text="Đang tải trạng thái..." /> : null}
      {error ? <StatusBox text={error} /> : null}
      {locationError ? <StatusBox text={locationError} /> : null}

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
      ) : null}
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

function distanceMeters(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
): number {
  const R = 6371000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLon / 2);
  const h = s1 * s1 + Math.cos(lat1) * Math.cos(lat2) * s2 * s2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function arcgisMiniMapHtml(input: { user: { latitude: number; longitude: number; accuracy: number | null } }): string {
  const payload = JSON.stringify(input);
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <link rel="stylesheet" href="https://js.arcgis.com/4.29/esri/themes/light/main.css" />
    <style>
      html, body, #viewDiv { height: 100%; width: 100%; margin: 0; padding: 0; overflow: hidden; background: #ffffff; }
    </style>
    <script src="https://js.arcgis.com/4.29/"></script>
  </head>
  <body>
    <div id="viewDiv"></div>
    <script>
      const payload = ${payload};
      const user = payload.user;
      const fallbackCenter = user ? [user.longitude, user.latitude] : [105.83416, 21.02776];
      const zoom = 17;

      require(["esri/Map", "esri/views/MapView", "esri/Graphic", "esri/layers/GraphicsLayer", "esri/geometry/Circle"],
        function(Map, MapView, Graphic, GraphicsLayer, Circle) {
          const map = new Map({ basemap: "streets-vector" });
          const layer = new GraphicsLayer();
          map.add(layer);

          const view = new MapView({
            container: "viewDiv",
            map,
            center: fallbackCenter,
            zoom,
            ui: { components: [] }
          });

          if (user && typeof user.latitude === "number" && typeof user.longitude === "number") {
            layer.add(new Graphic({
              geometry: { type: "point", latitude: user.latitude, longitude: user.longitude },
              symbol: {
                type: "simple-marker",
                style: "circle",
                color: [31, 41, 51, 1],
                size: 10,
                outline: { color: [255, 255, 255, 1], width: 2 }
              }
            }));
          }
        }
      );
    </script>
  </body>
</html>`;
}

const styles = StyleSheet.create({
  metricRow: {
    flexDirection: 'row',
    gap: wf.spacing.md,
  },
  mapWrap: {
    height: 170,
    borderColor: wf.colors.line,
    borderWidth: wf.border.width,
    borderRadius: wf.radius.md,
    backgroundColor: wf.colors.panel,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
    backgroundColor: wf.colors.panel,
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: wf.spacing.md,
    gap: wf.spacing.xs,
  },
  mapPlaceholderTitle: {
    color: wf.colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  mapPlaceholderText: {
    color: wf.colors.muted,
    fontSize: 13,
    textAlign: 'center',
  },
});
