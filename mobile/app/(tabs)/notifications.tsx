import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

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
  const [modalOpen, setModalOpen] = useState(false);
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
    return items.find((n) => n.notification_id === selectedId) ?? null;
  }, [items, selectedId]);

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
            const active = n.notification_id === selectedId;
            return (
              <Pressable
                key={n.notification_id}
                onPress={() => {
                  setSelectedId(n.notification_id);
                  setModalOpen(true);
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

      <Modal
        visible={modalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setModalOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            {selected ? (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selected.title}</Text>
                  {!selected.is_read ? <Text style={styles.modalBadge}>Mới</Text> : null}
                </View>

                <Box>
                  <Row label="Loại" value={noticeTypeLabel(selected.type)} />
                  <Row label="Thời gian" value={formatDateTime(selected.created_at)} />
                </Box>

                <Box>
                  <Text style={styles.modalSectionTitle}>Nội dung</Text>
                  <ScrollView style={styles.modalBodyScroll} contentContainerStyle={styles.modalBodyContent}>
                    <Text style={styles.modalBodyText}>{selected.body}</Text>
                  </ScrollView>
                </Box>

                <Button label="Đóng" variant="secondary" onPress={() => setModalOpen(false)} />
              </>
            ) : (
              <Box>
                <Text style={styles.emptyText}>Không có thông báo được chọn.</Text>
                <Button label="Đóng" variant="secondary" onPress={() => setModalOpen(false)} />
              </Box>
            )}
          </Pressable>
        </Pressable>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    padding: wf.spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: wf.colors.page,
    borderColor: wf.colors.line,
    borderWidth: wf.border.width,
    borderRadius: wf.radius.lg,
    padding: wf.spacing.md,
    gap: wf.spacing.md,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wf.spacing.sm,
  },
  modalTitle: {
    flex: 1,
    color: wf.colors.ink,
    fontWeight: '700',
    fontSize: 16,
  },
  modalBadge: {
    color: wf.colors.dangerText,
    fontWeight: '700',
  },
  modalSectionTitle: {
    color: wf.colors.ink,
    fontWeight: '700',
    marginBottom: wf.spacing.sm,
  },
  modalBodyScroll: {
    maxHeight: 220,
  },
  modalBodyContent: {
    paddingBottom: wf.spacing.sm,
  },
  modalBodyText: {
    color: wf.colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
});
