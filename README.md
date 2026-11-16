# DKV Circuit Lab 3D V0.3.2 — Logo update

- Logo mới ở `public/dkv-technology-logo.png`.
- Thanh header trong `src/App.tsx` tham chiếu `/dkv-technology-logo.png`.
- Favicon trong `index.html` tham chiếu cùng ảnh.
- Đã bỏ ảnh logo cũ khỏi gói và không có Supabase/Auth.

## Cập nhật GitHub

**Quan trọng:** GitHub Upload Files không xóa file cũ. Trước khi cập nhật, hãy xóa `src/supabase.ts` và thư mục `supabase/` cũ nếu còn.

Cách đáng tin cậy nhất là dùng Git clone repository và **đồng bộ nội dung thư mục** mới (xóa file cũ), rồi commit/push:

```bash
git add -A
git commit -m "Update DKV logo and cleanup v0.3.2"
git push
```

Tham khảo Vercel Build Logs, chỉ khi deployment `Ready` mới là bản mới được hiển thị.

## Kiểm tra logo

- Vào `https://<ten-mien>/dkv-technology-logo.png` để kiểm tra asset trả về.
- Truy cập web bằng tab riêng tư hoặc Ctrl+Shift+R để bỏ cache.
- Ảnh gốc chứa nền caro (không trong suốt thực).

## Scope

Bản này thay giao diện/branding; mô phỏng vẫn là logic demo, không biên dịch ESP32 firmware.
