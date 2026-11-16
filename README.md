# DKV Circuit Lab 3D — V0.3

Công cụ mô phỏng logic mạch điện tử 3D trên trình duyệt, giao diện tiếng Việt. Không cần đăng nhập hoặc Supabase.

## Tính năng hiện có

- Workspace 3D (ESP32-C3 minh họa, breadboard, LED, điện trở, biến trở, nút nhấn).
- Nhấn chọn hai chân để nối dây; chọn dây để xóa; di chuyển linh kiện trên mặt bàn.
- Mô phỏng logic GPIO2 HIGH/LOW và kết nối LED đơn giản.
- Chỉnh sửa mã C/C++ làm bản nháp **chưa thể chạy firmware thật**.
- Lưu cục bộ (localStorage), xuất và nhập dự án JSON.
- Logo DKV do người dùng cung cấp, tông xanh công nghệ. Không có bài học và không cần đăng nhập.

**Giới hạn:** Không giải mạch tương tự, không mô phỏng đầy đủ breadboard, không biên dịch hoặc chạy ESP32 firmware. Đừng dùng để kết luận mạch thật an toàn.

## Triển khai

```bash
npm install
npm run build
```

Deploy lên Vercel với Framework `Vite`, Build `npm run build`, Output `dist`. Không cần environment variables.

Để giữ phiên bản đã lưu trước đó, key localStorage tiếp tục là `dkv-circuit-lab-v02`.

## Cập nhật GitHub

Sao chép **nội dung bên trong thư mục này** vào **gốc repo**. Xóa file `src/supabase.ts` và thư mục `supabase/` còn sót từ V0.1 nếu có (không chứa trong ZIP V0.3). GitHub web upload không tự xóa file cũ; nên dùng Git CLI hoặc xóa chúng trực tiếp.
