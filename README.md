# DKV Circuit Lab 3D — V0.5.0 (Visual Upgrade)

Bản cập nhật **giao diện và mô hình 3D** dành cho DKV Technology. Website tiếng Việt, không đăng nhập, không bài học, deploy Vite lên Vercel từ GitHub.

## Thay đổi V0.5

- ESP32-C3: bổ sung nhãn PCB, ký hiệu chân tham khảo, chi tiết linh kiện và pad.
- Breadboard: bổ sung rãnh giữa, lỗ và ký hiệu đường nguồn, số cột.
- Pin kết nối: thu nhỏ điểm chọn, dùng vật liệu kim loại thay vì các cầu xanh lớn.
- Dây: thêm phần đầu nối kim loại và vỏ màu.
- 3D scene: thêm mặt bàn, ánh sáng bổ sung, camera nhìn gần hơn, overlay trạng thái.
- Giao diện: không gian bàn lắp mạch rộng hơn, giảm kích thước header / sidebar.
- Giữ logo DKV nền trong suốt; giữ thao tác di chuyển, nối/xóa dây, lưu và nhập/xuất JSON.
- Không có Supabase/Auth/lesson.

**Giới hạn quan trọng:** Các mô hình 3D hiện là hình học dựng theo phong cách linh kiện thực, **không phải bản sao đúng kích thước/cấu trúc chân của sản phẩm cụ thể**. Chỉ có 4 chân tương tác trên ESP32-C3. Breadboard chưa mô phỏng liên thông hàng lỗ. Code Arduino được hiển thị nhưng **chưa biên dịch hay chạy ESP32 firmware**. Mô phỏng LED vẫn là kiểm tra kết nối logic đơn giản.

## Chạy dự án

```bash
npm install
npm run dev
npm run build
```

Mã nguồn đã qua kiểm tra cú pháp TypeScript TSX (không có diagnostics cú pháp); chưa xác nhận build đầy đủ vì môi trường đóng gói không cài được dependencies. Vui lòng kiểm tra Vercel Build Logs.

## Cập nhật GitHub

Cập nhật **toàn bộ nội dung thư mục này vào thư mục gốc repository**. Lưu ý: GitHub Upload Files không tự xóa file cũ không có trong bản mới. Hãy xóa `src/supabase.ts`, thư mục `supabase/`, các component cũ nếu vẫn tồn tại trong repository; những file đó không có trong ZIP. Không tải thư mục ngoài cùng như một thư mục con.

Giữ cấu hình Vercel: Framework Vite, Build `npm run build`, Output `dist`.
