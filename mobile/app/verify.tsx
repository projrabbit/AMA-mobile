import { router, useLocalSearchParams } from 'expo-router';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useMemo, useRef, useState } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';

import { ApiError } from '@/api/client';
import * as ama from '@/api/ama';
import { Button, Screen, StatusBox, wf } from '@/components/Wireframe';
import { useSession } from '@/state/session';

type DetectedFace = {
  faceID?: number;
  bounds?: {
    origin?: { x?: number; y?: number };
    size?: { width?: number; height?: number };
  };
};

type FaceDetectorModule = typeof import('expo-face-detector');

function loadFaceDetector(): FaceDetectorModule | null {
  try {
    return require('expo-face-detector') as FaceDetectorModule;
  } catch {
    return null;
  }
}

const faceDetectorModule = loadFaceDetector();

export default function VerifyScreen() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const { accessToken, me } = useSession();
  const [sending, setSending] = useState(false);
  const [facing, setFacing] = useState<CameraType>('front');
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [deviceFingerprint] = useState(() => `ama-${Platform.OS}-${Math.random().toString(16).slice(2)}`);
  const [faces, setFaces] = useState<DetectedFace[]>([]);
  const faceBoxEnabled = useMemo(() => faceDetectorModule != null, []);

  const actionLabel = useMemo(() => {
    return type === 'out' ? 'Chấm công ra' : 'Chấm công vào';
  }, [type]);

  const canSend = useMemo(() => {
    return !!permission?.granted && !!selfieUri && !sending && me?.account.role === 'employee';
  }, [permission?.granted, selfieUri, sending, me?.account.role]);

  const captureSelfie = async (): Promise<string | null> => {
    if (!permission?.granted || !cameraRef.current) return null;
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.7,
      skipProcessing: true,
    });
    if (photo?.uri) {
      setSelfieUri(photo.uri);
      return photo.uri;
    }
    return null;
  };

  const onSend = async () => {
    if (sending) return;
    if (!accessToken) return;
    if (me?.account.role !== 'employee') {
      setSendError('Tài khoản hiện tại không phải nhân viên (employee) nên không thể chấm công.');
      return;
    }
    setSending(true);
    setSendError(null);

    try {
      let uri = selfieUri;
      if (!uri) uri = await captureSelfie();
      if (!uri) throw new Error('Chưa có ảnh selfie');

      const data = await ama.submitAttendance({
        token: accessToken,
        type: type === 'out' ? 'out' : 'in',
        selfieUri: uri,
        employeeId: me?.employee.employee_id,
        deviceFingerprint,
        latitude: 10.87034,
        longitude: 106.80275,
        altitude: 0.6,
        gpsAccuracy: 10,
      });

      const status =
        data.status === 'approved' || data.status === 'flagged'
          ? 'success'
          : data.rejection_reason === 'outside_geofence'
            ? 'out_of_zone'
            : 'unreliable';

      router.replace({
        pathname: '/result',
        params: { status, type: type === 'out' ? 'out' : 'in', message: data.message },
      });
    } catch (e) {
      const msg =
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : 'Lỗi kết nối';
      setSendError(msg);
      router.replace({
        pathname: '/result',
        params: { status: 'timeout', type: type === 'out' ? 'out' : 'in', message: msg },
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Screen title="Xác minh chấm công" subtitle="Hoàn tất trong vài giây nếu dữ liệu hợp lệ">
      <View style={styles.cameraWrap}>
        {permission?.granted ? (
          <>
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing={facing}
              {...(faceDetectorModule
                ? ({
                    onFacesDetected: (event: { faces?: DetectedFace[] }) => {
                      setFaces(event.faces ?? []);
                    },
                    onFaceDetectionError: () => {
                      setFaces([]);
                    },
                    faceDetectorSettings: {
                      mode: faceDetectorModule.FaceDetectorMode.fast,
                      detectLandmarks: faceDetectorModule.FaceDetectorLandmarks.none,
                      runClassifications: faceDetectorModule.FaceDetectorClassifications.none,
                      tracking: true,
                      minDetectionInterval: 150,
                    },
                  } as any)
                : {})}
            />
            <View pointerEvents="none" style={styles.overlay}>
              <View style={styles.faceGuide} />
              {faceBoxEnabled
                ? faces.map((face, idx) => {
                    const origin = face.bounds?.origin;
                    const size = face.bounds?.size;
                    const x = origin?.x ?? 0;
                    const y = origin?.y ?? 0;
                    const width = size?.width ?? 0;
                    const height = size?.height ?? 0;
                    if (width <= 0 || height <= 0) return null;
                    const key = face.faceID != null ? String(face.faceID) : String(idx);
                    return (
                      <View
                        key={key}
                        style={[
                          styles.faceBox,
                          {
                            left: x,
                            top: y,
                            width,
                            height,
                          },
                        ]}
                      />
                    );
                  })
                : null}
            </View>
          </>
        ) : (
          <View style={styles.cameraPlaceholder}>
            <Text style={styles.cameraPlaceholderTitle}>Cần quyền Camera</Text>
            <Text style={styles.cameraPlaceholderText}>
              Cho phép truy cập camera để xác minh khuôn mặt khi chấm công.
            </Text>
            <View style={styles.cameraPlaceholderActions}>
              <Button label="Cho phép camera" onPress={() => requestPermission()} />
              <Button
                label={facing === 'front' ? 'Dùng camera sau' : 'Dùng camera trước'}
                onPress={() => setFacing((f) => (f === 'front' ? 'back' : 'front'))}
                variant="secondary"
              />
            </View>
          </View>
        )}
      </View>

      {sending ? (
        <StatusBox text={`Đang xác minh và gửi yêu cầu: ${actionLabel}...`} />
      ) : (
        <View style={styles.helperRow}>
          <Text style={styles.helperText}>
            {permission?.granted ? 'Canh mặt vào khung và chụp selfie để xác minh.' : 'Bật GPS và Camera để tiếp tục.'}
          </Text>
        </View>
      )}

      {faceBoxEnabled && faces.length > 0 ? <StatusBox text="Đã nhận diện được gương mặt" /> : null}

      {selfieUri ? (
        <View style={styles.selfiePreviewWrap}>
          <Image source={{ uri: selfieUri }} style={styles.selfiePreview} />
        </View>
      ) : null}

      {sendError ? <StatusBox text={sendError} /> : null}

      <Button
        label={selfieUri ? 'Chụp lại selfie' : 'Chụp selfie'}
        onPress={() => {
          setSelfieUri(null);
          void captureSelfie();
        }}
        disabled={!permission?.granted || sending}
      />
      <Button label="Gửi yêu cầu chấm công" onPress={onSend} size="lg" disabled={!canSend} />
      <Button label="Hủy" onPress={() => router.back()} variant="secondary" disabled={sending} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  cameraWrap: {
    height: 260,
    borderColor: wf.colors.line,
    borderWidth: wf.border.width,
    borderRadius: wf.radius.md,
    backgroundColor: wf.colors.panel,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  faceGuide: {
    position: 'absolute',
    alignSelf: 'center',
    top: 18,
    width: 180,
    height: 220,
    borderColor: wf.colors.accent,
    borderWidth: 3,
    borderRadius: 90,
    backgroundColor: 'transparent',
  },
  faceBox: {
    position: 'absolute',
    borderColor: wf.colors.accent,
    borderWidth: 2,
    borderRadius: wf.radius.md,
    backgroundColor: 'transparent',
  },
  cameraPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: wf.spacing.md,
    gap: wf.spacing.sm,
  },
  cameraPlaceholderTitle: {
    color: wf.colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  cameraPlaceholderText: {
    color: wf.colors.muted,
    textAlign: 'center',
  },
  cameraPlaceholderActions: {
    width: '100%',
    gap: wf.spacing.sm,
  },
  helperRow: {
    paddingHorizontal: wf.spacing.sm,
  },
  helperText: {
    color: wf.colors.muted,
    fontSize: 13,
  },
  selfiePreviewWrap: {
    borderColor: wf.colors.line,
    borderWidth: wf.border.width,
    borderRadius: wf.radius.md,
    backgroundColor: wf.colors.panel,
    overflow: 'hidden',
  },
  selfiePreview: {
    width: '100%',
    height: 160,
  },
});
