import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { Button, Card, Row, Screen, wf } from '@/components/Wireframe';

type Status = 'success' | 'out_of_zone' | 'unreliable' | 'timeout';

function normalizeStatus(input?: string): Status {
  if (input === 'out_of_zone') return 'out_of_zone';
  if (input === 'unreliable') return 'unreliable';
  if (input === 'timeout') return 'timeout';
  return 'success';
}

export default function ResultScreen() {
  const { status: rawStatus, type, message } = useLocalSearchParams<{ status?: string; type?: string; message?: string }>();
  const status = normalizeStatus(rawStatus);
  const actionLabel = type === 'out' ? 'Chấm công ra' : 'Chấm công vào';

  const main = (() => {
    switch (status) {
      case 'success':
        return { result: 'Thành công', message: `${actionLabel} thành công` };
      case 'out_of_zone':
        return { result: 'Ngoài vùng', message: 'Bạn đang ngoài khu vực chấm công.' };
      case 'unreliable':
        return { result: 'Bị từ chối', message: 'Vị trí/thiết bị/khuôn mặt không tin cậy.' };
      case 'timeout':
        return { result: 'Lỗi', message: 'Lỗi kết nối hoặc timeout, vui lòng thử lại.' };
    }
  })();

  return (
    <Screen title="Kết quả chấm công" subtitle="Thông báo ngay sau khi xử lý">
      <Card>
        <Text style={styles.cardTitle}>Trạng thái chính</Text>
        <Row label="Kết quả" value={main.result} />
        <Row label="Thông báo" value={message ?? main.message} />
        <Row label="Vị trí" value="Tòa A - Tầng 3" />
        <Row label="Thời gian chờ" value="1.2 giây" />
      </Card>

      <Button label="Về trang chủ" onPress={() => router.replace('/')} size="lg" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardTitle: {
    marginBottom: wf.spacing.sm,
    color: wf.colors.ink,
    fontWeight: '700',
    fontSize: 16,
  },
});
