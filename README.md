# DKV Circuit Lab 3D — V0.4.0

Bản nâng cấp **3D Workspace** dành cho kỹ thuật viên, maker, developer. Giao diện tiếng Việt, màu xanh DKV, logo trong suốt, không yêu cầu đăng nhập, không dùng Supabase.

## Điểm mới

- Mô hình 3D được dựng bằng geometry cho **ESP32-C3, breadboard 140 lỗ hiển thị, LED, điện trở 220Ω, biến trở và nút nhấn**.
- Kéo linh kiện trực tiếp trên bàn làm việc (nhấn giữ chuột trái), xoay và phóng to/thu nhỏ camera; chuyển chế độ nhìn từ trên xuống và reset camera.
- Nhấn vào hai nút chân phát sáng để nối dây; nhấn dây để xóa; chọn linh kiện rồi nhấn thùng rác để xóa.
- Giữ mô phỏng **logic** LED với GPIO2 và đường dây đã nối; không phải tính toán dòng/áp vật lý hay firmware ESP32 thật.
- Tự lưu cục bộ (`localStorage`) và nhập/xuất JSON để chia sẻ sơ đồ.

## Cài đặt

```bash
npm install
npm run dev
npm run build
```

Dự án dùng React + TypeScript + React Three Fiber + Drei + Three.js + Vite.

## Đẩy GitHub & triển khai Vercel

1. **Sao lưu dự án hiện tại**.
2. Tốt nhất dùng Git hoặc GitHub Desktop để **đồng bộ đầy đủ** source V0.4.0 lên repository, thay vì chỉ Add file → Upload files (cách đó không xóa file thừa).
3. XÓA các file/thư mục cũ không còn dùng: `src/supabase.ts`, `supabase/`, các file đăng nhập khác nếu còn. Không để phần mềm cũ lọt vào TypeScript build.
4. Vercel: Framework Vite; Build Command `npm run build`; Output Directory `dist`.
5. Đợi Vercel báo Ready rồi hard reload `Ctrl + Shift + R`.

## Cảnh báo

Các nút chân và lỗ breadboard hiện là **minh họa chức năng**, chưa tái hiện chính xác pinout tất cả board/linh kiện hoặc kết nối nội bộ breadboard. Chưa có SPICE, ADC vật lý, nạp/biên dịch firmware Arduino C/C++ hoặc BLE thật. Không dùng để xác nhận mạch thực tế an toàn.

## Kiểm tra xây dựng

Mã nguồn TSX đã được kiểm tra cú pháp bằng TypeScript transpile; **chưa kiểm tra được build Vite đầy đủ** trong môi trường tạo gói vì npm không tải được dependencies. Build trong Vercel sẽ xác nhận.
