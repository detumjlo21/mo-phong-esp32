# DKV Circuit Lab 3D — V0.2

Website tiếng Việt mô phỏng linh kiện 3D, dành cho cộng đồng sử dụng **không cần đăng nhập**. Giao diện sáng lấy cảm hứng từ trải nghiệm học trực quan của Learn ESP32, nhưng mã nguồn, bố cục và mô hình 3D được viết riêng.

## Chức năng
- Bàn lắp mạch 3D: xoay, zoom, chọn linh kiện, kéo linh kiện, nhấn 2 chân để nối dây, nhấn dây để xóa.
- Thư viện ESP32-C3, breadboard, LED, điện trở, biến trở, nút nhấn.
- Ba bài thực hành mẫu (LED / nút nhấn / biến trở).
- Mô phỏng GPIO2 HIGH/LOW **theo logic đơn giản**: LED được bật khi có đường kết nối GPIO2 → điện trở → LED(A) và LED(K) → GND.
- Tự động lưu dự án vào `localStorage` (trình duyệt hiện tại), nhập/xuất JSON để chia sẻ.
- Không có Supabase, tài khoản, server hoặc yêu cầu biến môi trường.

**Giới hạn rõ ràng:** Chưa phải bộ giải mạch điện vật lý, breadboard chưa mô phỏng liên thông lỗ, chưa chạy firmware C/C++ ESP32. Trình editor chỉ cho xem/sửa ví dụ.

## Chạy ở máy
1. Cài Node.js 22+
2. `npm install`
3. `npm run dev`
4. `npm run build` để kiểm tra

## Deploy GitHub / Vercel
1. Sao chép toàn bộ file trong ZIP vào thư mục gốc repository, thay thế các file cũ.
2. Xóa file Supabase cũ nếu còn (`src/supabase.ts`, `supabase/`, `.env.example`).
3. Commit và push lên nhánh `main`.
4. Vercel tự deploy. Chọn framework **Vite**, Build Command `npm run build`, Output `dist`.
5. Xóa các biến `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` khỏi Vercel nếu không dùng nữa (không bắt buộc cho build).

## Lộ trình tiếp
- Mô hình chân ESP32-C3 đầy đủ và thực tế hơn, breadboard có quy tắc điện.
- Bộ giải mạch điện / bộ kiểm tra kết nối, ADC, PWM, UART, I2C.
- Bộ thực thi firmware riêng / tích hợp có cấp phép: **chưa hỗ trợ ở V0.2**.

## Bản quyền thiết kế
Không sử dụng mã nguồn, logo hoặc hình 3D từ Learn ESP32. Chỉ tham khảo phong cách sản phẩm giáo dục tương tác.
