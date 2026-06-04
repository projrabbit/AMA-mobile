# AMA Mobile — Trang & Thao tác

Tài liệu này mô tả các trang hiện có trong app Expo (thư mục `mobile/`) và luồng thao tác chính theo từng vai trò.

## Điều hướng tổng quan

- Điều hướng dùng `expo-router`.
- Sau khi đăng nhập thành công, app vào nhóm tab: `app/(tabs)/*`.
- Các màn độc lập:
  - `app/verify.tsx`: chụp selfie xác minh khi chấm công.
  - `app/result.tsx`: hiển thị kết quả chấm công (thành công/ngoài vùng/không đáng tin/timeout…).
  - `app/modal.tsx`: màn modal demo.

## Vai trò (role)

- `employee`: chấm công, xem lịch sử cá nhân, xem thiết bị của mình, xem thông báo.
- `manager`, `hr`, `admin`: xem dashboard/báo cáo, một số mục quản trị tùy role (màn Manage).

## Danh sách trang (routes)

### 1) Đăng nhập

- Route: `/(auth)/login`
- File: `mobile/app/(auth)/login.tsx`
- Thao tác:
  - Nhập `username` + `password`.
  - Đăng nhập thành công sẽ lưu token và chuyển vào tabs.

### 2) Home (Tab)

- Route: `/(tabs)`
- File: `mobile/app/(tabs)/index.tsx`
- Thao tác theo role:
  - `employee`:
    - Xem ca hiện tại + trạng thái hôm nay.
    - Bấm “Chấm công vào/ra” → đi tới màn `verify` để mở camera và chụp selfie.
  - `manager/hr/admin`:
    - Xem chỉ số tổng quan (dashboard summary).

### 3) Verify (Chụp selfie)

- Route: `/verify?type=in|out`
- File: `mobile/app/verify.tsx`
- Thao tác:
  - Cấp quyền camera (nếu chưa).
  - Canh gương mặt vào khung, chụp selfie.
  - Khi hệ thống nhận diện được gương mặt (nếu tính năng face detector có sẵn), hiện trạng thái “Đã nhận diện được gương mặt”.
  - Bấm “Gửi yêu cầu chấm công” để gửi multipart lên backend:
    - `/api/v1/attendance/check-in` hoặc `/api/v1/attendance/check-out`

### 4) Result (Kết quả chấm công)

- Route: `/result`
- File: `mobile/app/result.tsx`
- Thao tác:
  - Xem thông báo kết quả sau khi gửi chấm công.
  - Quay lại màn trước/Tab.

### 5) History (Tab)

- Route: `/(tabs)/history`
- File: `mobile/app/(tabs)/history.tsx`
- Thao tác theo role:
  - `employee`: xem lịch sử chấm công của bản thân theo khoảng ngày.
  - `manager/hr/admin`: xem báo cáo chấm công (report) theo khoảng ngày và lọc.

### 6) Notifications (Tab)

- Route: `/(tabs)/notifications`
- File: `mobile/app/(tabs)/notifications.tsx`
- Thao tác:
  - Xem danh sách thông báo, lọc theo tab (tất cả/chưa đọc/chấm công).
  - Bấm 1 item để mở modal chi tiết; tự đánh dấu đã đọc.
  - Bấm “Đánh dấu tất cả đã đọc”.

### 7) Manage (Tab)

- Route: `/(tabs)/manage`
- File: `mobile/app/(tabs)/manage.tsx`
- Thao tác:
  - Chọn “section” theo role để tải dữ liệu và hiển thị dạng UI (metrics/lists) thay vì raw JSON.
  - Ví dụ các mục (tùy role): Dashboard, Báo cáo chấm công, Realtime vị trí, Ngoại lệ, Nhân viên, Phòng ban, Ca làm, Tòa nhà/Tầng, Geofence, Fraud records, Audit logs, Devices.

### 8) Account (Tab)

- Route: `/(tabs)/account`
- File: `mobile/app/(tabs)/account.tsx`
- Thao tác:
  - Xem thông tin tài khoản/nhân viên.
  - `employee`: tải và hiển thị danh sách thiết bị đã đăng ký (`/api/v1/devices/me`).
  - Đăng xuất.

### 9) Khác

- Not Found:
  - Route: `+not-found`
  - File: `mobile/app/+not-found.tsx`
- Modal demo:
  - Route: `/modal`
  - File: `mobile/app/modal.tsx`

## UI/Navigation

- Bottom tabs: `mobile/app/(tabs)/_layout.tsx`
  - Tab label active dùng “pill” (nền chỉ quanh chữ), không tô full ô.

