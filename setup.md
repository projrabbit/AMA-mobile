# Setup (sau khi pull code)

## 1) Yêu cầu môi trường
- Node.js (khuyến nghị bản LTS)
- Expo Go trên điện thoại (Android/iOS)
- (Tuỳ chọn) Android Studio / emulator nếu chạy giả lập

## 2) Cài dependency
Chạy trong thư mục `mobile`:

```bash
cd mobile
npm install
```

## 3) Chạy app
Chạy Metro bundler:

```bash
cd mobile
npx expo start -c
```

Nếu bị lỗi port 8081 đang dùng:

```bash
cd mobile
npx expo start -c --port 8082
```

## 4) Mở trên điện thoại
- Mở Expo Go
- Scan QR code từ terminal / Expo DevTools

## 5) Nếu gặp lỗi quyền ghi cache (.expo)
Chạy bằng PowerShell để dùng thư mục cache nằm trong project:

```powershell
cd mobile
powershell -NoProfile -Command "Set-Item -Path Env:__UNSAFE_EXPO_HOME_DIRECTORY -Value 'D:\gis\AMA-mobile\mobile\.expo-home'; npx expo start -c"
```

## 6) Cấu hình API (nếu có backend)
App dùng base URL theo biến môi trường:
- `EXPO_PUBLIC_API_BASE_URL`

Ví dụ:

```bash
cd mobile
set EXPO_PUBLIC_API_BASE_URL=http://<IP-may-backend>:8010
npx expo start -c
```

