# DKV Circuit Lab 3D — V0.7.0 Studio UI

## Các thay đổi
- Thiết kế lại inspector bên phải theo bố cục kỹ thuật hai tầng (thông tin linh kiện / code editor), tham khảo cách tổ chức của ảnh Learn ESP32 nhưng không sao chép nội dung hoặc giao diện nguyên bản.
- 4 tab Tổng quan / Chân / Ví dụ / Thông số; nội dung phụ thuộc linh kiện được chọn.
- Code Editor luôn hiển thị, hỗ trợ chỉnh sửa, sao chép, mở rộng. **Chưa biên dịch/chạy code C++**; nút Play chỉ bật/tắt chế độ mô phỏng logic GPIO.
- Camera isometric không xoay tự do. Cho phép pan, zoom, đặt lại góc và preset nhìn trên.
- Giữ logo DKV, trắng–xanh, xóa linh kiện bằng nút hoặc Delete, JSON nhập/xuất và localStorage.
- Không có bài học, Supabase, tài khoản hoặc đăng nhập.

## Deploy
1. Thay **toàn bộ** nội dung repository bằng nội dung thư mục này (đừng tải cả thư mục làm thư mục con).
2. Xóa `src/supabase.ts` và `supabase/` trên GitHub nếu còn sót từ bản cũ.
3. `npm install`, `npm run build` rồi push GitHub. Vercel dùng Vite (`dist`).

## Giới hạn
Mô hình 3D dùng hình học Three.js do dự án dựng. Pinout rút gọn và chưa có bộ giải mạch điện, đo dòng/áp, hoặc mô phỏng firmware ESP32 thực tế. Không dùng để chứng nhận lắp mạch an toàn.
