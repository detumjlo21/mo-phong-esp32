# DKV Circuit Lab 3D V0.3.3 — Cập nhật logo DKV

- Đã thay logo thanh tiêu đề bằng ảnh DKV 3D nền trong suốt (`public/dkv-technology-logo.png`).
- Favicon mới: `public/favicon.png`.
- Tinh chỉnh CSS cho logo trên giao diện xanh navy.
- Không có Supabase và không cần tài khoản.

## Cập nhật GitHub

Cách an toàn nhất: giải nén, dùng Git clone repository hiện tại, xóa dữ liệu mã nguồn cũ ở máy (giữ `.git`), sao chép toàn bộ file của phiên bản này vào thư mục repo và commit/push. Việc upload ZIP bằng giao diện GitHub không tự xóa các file cũ như `src/supabase.ts`.

Nếu chỉnh trực tiếp GitHub, ít nhất hãy thay các file: `src/App.tsx`, `src/style.css`, `index.html`, `package.json`, `public/dkv-technology-logo.png` và thêm `public/favicon.png`; đồng thời xóa `src/supabase.ts` còn sót.

Lệnh kiểm tra khi có Node.js:

```bash
npm install
npm run build
```

Sau khi commit, chờ Vercel deploy trạng thái Ready; mở tab ẩn danh hoặc Ctrl+Shift+R để tránh cache.
