# DKV Circuit Lab 3D — V0.1

Website 3D tiếng Việt để đặt linh kiện, nối dây, thử GPIO logic và lưu dự án. **Không phải** mô phỏng vật lý mạch điện hoặc chạy firmware ESP32 thật.

## Chạy tại máy

1. Cài Node.js 22+
2. `npm install`
3. `cp .env.example .env` (Windows: tự sao chép file rồi đổi tên)
4. `npm run dev`
5. `npm run build` để kiểm tra trước khi triển khai.

## Supabase

1. Tạo project tại https://supabase.com.
2. Mở SQL Editor, chạy `supabase/schema.sql` **một lần**.
3. Vào Project Settings / API, lấy Project URL và publishable (anon) key điền vào `.env`. **Không đưa service_role/secret key lên frontend**.
4. Bật Email OTP/Magic Link và cấu hình Site URL + Redirect URLs cho localhost và tên miền Vercel.
5. RLS chỉ cho phép mỗi người dùng truy cập dự án của chính họ.

## GitHub + Vercel

1. Tạo repository mới trên GitHub.
2. Trong thư mục project: `git init`, `git add .`, `git commit -m "Initial DKV Circuit Lab 3D"`.
3. Thêm remote theo URL GitHub của bạn và `git push -u origin main` (nếu nhánh chưa là main, dùng `git branch -M main`).
4. Vào https://vercel.com/new, chọn Import Git Repository. Framework: Vite.
5. Vercel Environment Variables: `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`; deploy.
6. Thêm domain Vercel vào Supabase Auth URL Configuration.

## Phạm vi

- Bàn 3D có camera xoay/zoom; thêm linh kiện; click hai chân để tạo dây.
- GPIO2 HIGH làm LED sáng **nếu** nối trực tiếp GPIO2 với LED:A. Đây chỉ là logic demo; chưa tính điện trở, nối breadboard hoặc vòng dòng điện.
- Lưu cục bộ, đăng nhập email, lưu/tải dự án Supabase.
- V0.2 cần phát triển circuit graph, mô hình breadboard, kiểm tra dòng/áp và kéo thả vị trí linh kiện.
