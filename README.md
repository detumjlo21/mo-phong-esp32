# DKV Circuit Lab 3D V0.6.0 — Workspace Fix

## Sửa lỗi và cải tiến
- Bỏ hoàn toàn nền caro/lưới trong vùng 3D.
- ESP32-C3 và breadboard không được chồng hình khi di chuyển; dự án đã lưu được tự chỉnh nếu hai bo đè lên nhau.
- LED, điện trở, biến trở và nút nhấn được nâng lên mặt breadboard khi nằm trong vùng lắp đặt.
- Điểm nối dây đồng bộ độ cao khi gắn trên breadboard.
- Bấm chọn linh kiện, nhấn **Delete/Backspace** hoặc nút **Xóa linh kiện** ở inspector để xóa, tự động xóa dây liên quan.
- Thêm chi tiết chân header, pad PCB và breadboard, giảm độ dày dây.
- Logo DKV và giao diện xanh được giữ nguyên; không bài học/đăng nhập/Supabase.

### Giới hạn
Mô hình dựng procedural Three.js, chưa phải CAD chính xác như board thật, không tự chạy firmware ESP32. Hình breadboard chưa có liên thông điện thật. Cơ chế gắn linh kiện lên breadboard chỉ là vị trí hiển thị 3D.

## Deploy
Giải nén nội dung root lên GitHub và xóa file src/supabase.ts trên repository nếu còn. Vercel build với `npm run build`, output `dist`.
