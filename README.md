# DKV Circuit Lab 3D — V0.6.1

## Sửa lỗi nút thùng rác

- Chọn linh kiện bằng một cú nhấn chuột.
- Sau khi nhả chuột hoặc rời bàn làm việc 3D, linh kiện **vẫn được chọn**.
- Nút **Xóa linh kiện** trên inspector và thùng rác ở góc canvas vẫn khả dụng.
- Có thể xóa bằng phím Delete / Backspace nếu không nhập văn bản.
- Chỉ bỏ chọn khi xóa linh kiện, tạo dự án mới, hoặc chọn linh kiện khác.

### Nguyên nhân

Bản cũ dùng `Canvas.onPointerMissed` và `onClick` trên mặt phẳng nền để tự hủy chọn. Kết hợp pointer capture khi kéo thả, chúng có thể làm mất trạng thái được chọn ngay sau khi nhả chuột. V0.6.1 loại bỏ các thao tác hủy chọn tự động này và dùng thêm `onClick` để xác nhận lựa chọn.

### Cập nhật

1. Thay nội dung repository GitHub bằng nội dung thư mục này.
2. Xóa các file Supabase cũ nếu repository vẫn còn (upload ZIP không tự xóa file cũ).
3. Commit, chờ Vercel báo Ready và tải lại trang.

### Trạng thái kiểm thử

Đã kiểm tra đối chiếu thay đổi trong mã nguồn. **Chưa xác nhận bản build Vite / hoạt động trong browser** tại môi trường này.
