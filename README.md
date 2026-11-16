# DKV Circuit Lab 3D V0.6.2 — White & Blue Theme

Bản cập nhật trực tiếp từ V0.6.1: đổi giao diện sang trắng/xanh dương, đổi mặt bàn 3D sang nền sáng trơn không caro; giữ logo DKV, chức năng chọn/xóa, kéo thả, nối dây, nhập/xuất JSON. Không có Supabase/Auth/bài học.

## Cập nhật
1. Thay thế **toàn bộ** nội dung repository bằng nội dung thư mục này (không tạo thêm thư mục lồng nhau).
2. Xóa file `src/supabase.ts` và thư mục `supabase` trên GitHub nếu còn sót ở bản cũ; chỉ upload file mới không tự xóa file cũ.
3. Commit lên GitHub để Vercel build. Nếu build lỗi, xem thông báo ở Vercel Build Logs.

## Kiểm tra
`npm install` rồi `npm run build` và `npm run dev` để thử trên máy. Màu và bố cục đã chỉnh trong `src/style.css`, scene 3D trong `src/App.tsx`.

Website vẫn là mô phỏng logic, chưa thực thi firmware ESP32 C/C++ hoặc giải mạch điện thực.
