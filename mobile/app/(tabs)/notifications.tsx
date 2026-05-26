import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import * as ama from '@/api/ama';
import { Box, Button, Row, Screen, StatusBox, Tabs3, wf } from '@/components/Wireframe';
import { useSession } from '@/state/session';

function noticeTypeLabel(type: string) {
  switch (type) {
    case 'checkin_approved':
      return 'Chấm công vào: Duyệt';
    case 'checkin_rejected':
      return 'Chấm công vào: Từ chối';
    case 'checkout_approved':
      return 'Chấm công ra: Duyệt';
    case 'checkout_rejected':
      return 'Chấm công ra: Từ chối';
    case 'device_trusted':
      return 'Thiết bị';
    case 'exception_flagged':
      return 'Ngoại lệ';
    default:
      return type;
  }
}

export default function NotificationsScreen() {
  const { accessToken } = useSession();
  const [tab, setTab] = useState(0);
  const [items, setItems] = useState<ama.NotificationItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    let alive = true;
    setLoading(true);
    setError(null);
    ama
      .listNotifications(accessToken)
      .then((data) => {
        if (!alive) return;
        setItems(data);
        setSelectedId((cur) => cur ?? data[0]?.notification_id ?? null);
      })
      .catch((e) => {
        if (!alive) return;
        const msg = e instanceof Error ? e.message : 'Không thể tải thông báo';
        setError(msg);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [accessToken]);

  const notices = useMemo(() => {
    if (tab === 1) return items.filter((n) => !n.is_read);
    if (tab === 2) return items.filter((n) => n.type.startsWith('checkin_') || n.type.startsWith('checkout_'));
    return items;
  }, [items, tab]);

  const selected = useMemo(() => {
    return notices.find((n) => n.notification_id === selectedId) ?? notices[0] ?? null;
  }, [notices, selectedId]);

  return (
    <Screen title="Thông báo" subtitle="Cập nhật mới nhất từ hệ thống">
      <Tabs3 value={tab} onChange={setTab} labels={['Tất cả', 'Chưa đọc', 'Chấm công']} />

      {loading ? <StatusBox text="Đang tải thông báo..." /> : null}
      {error ? <StatusBox text={error} /> : null}

      <View>
        {notices.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Không có thông báo.</Text>
          </View>
        ) : (
          notices.map((n) => {
            const active = n.notification_id === selected?.notification_id;
            return (
              <Pressable
                key={n.notification_id}
                onPress={() => {
                  setSelectedId(n.notification_id);
                  if (!accessToken || n.is_read) return;
                  ama
                    .markRead(accessToken, n.notification_id)
                    .then(() => {
                      setItems((prev) =>
                        prev.map((x) => (x.notification_id === n.notification_id ? { ...x, is_read: true } : x)),
                      );
                    })
                    .catch(() => {});
                }}
                style={[styles.item, active ? styles.itemActive : null]}>
                <Text style={styles.itemTitle}>
                  {!n.is_read ? '• ' : ''}
                  {n.title}
                </Text>
                <Text style={styles.itemBody}>{n.body}</Text>
              </Pressable>
            );
          })
        )}
      </View>

      <Box>
        <Text style={styles.detailTitle}>Chi tiết thông báo được chọn</Text>
        {selected ? (
          <>
            <Row label="Loại" value={noticeTypeLabel(selected.type)} />
            <Row label="Thời gian" value={formatDateTime(selected.created_at)} />
            <Row label="Nội dung" value={selected.body} />
          </>
        ) : (
          <Text style={styles.emptyText}>Chọn một thông báo để xem chi tiết.</Text>
        )}
      </Box>

      <Button
        label="Đánh dấu tất cả đã đọc"
        variant="secondary"
        onPress={() => {
          if (!accessToken) return;
          ama
            .markAllRead(accessToken)
            .then(() => setItems((prev) => prev.map((n) => ({ ...n, is_read: true }))))
            .catch(() => {});
        }}
        disabled={!accessToken || items.length === 0 || items.every((n) => n.is_read)}
      />
    </Screen>
  );
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: wf.colors.panel,
    borderColor: wf.colors.line,
    borderWidth: wf.border.width,
    borderRadius: wf.radius.md,
    padding: wf.spacing.md,
    marginBottom: wf.spacing.sm,
  },
  itemActive: {
    backgroundColor: wf.colors.accent,
  },
  itemTitle: {
    color: wf.colors.ink,
    fontWeight: '700',
    marginBottom: 4,
  },
  itemBody: {
    color: wf.colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  detailTitle: {
    color: wf.colors.ink,
    fontWeight: '700',
    marginBottom: wf.spacing.sm,
  },
  empty: {
    backgroundColor: wf.colors.panel,
    borderColor: wf.colors.line,
    borderWidth: wf.border.width,
    borderRadius: wf.radius.md,
    padding: wf.spacing.md,
  },
  emptyText: {
    color: wf.colors.muted,
  },
});
