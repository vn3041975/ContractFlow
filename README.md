# ContractFlow - Mini App Quản Lý Quy Trình Hợp Đồng 📑

Ứng dụng web nhỏ gọn, hiện đại, **chạy ngay trực tiếp bằng trình duyệt mà không cần cài đặt môi trường phức tạp (Zero-setup)**. Toàn bộ dữ liệu được lưu an toàn trên máy tính của bạn (LocalStorage) và hỗ trợ Sao lưu / Phục hồi file JSON.

---

## 🌟 Tính Năng Nổi Bật

### 1. ☀️ Điểm Tin & Bàn Giao Đầu Ngày (Morning Action Center)
- **Tự động quét và cảnh báo vào đầu ngày làm việc**:
  - 🔴 **Hợp đồng quá hạn xử lý**: Cần giải quyết gấp để tránh vi phạm tiến độ/phạt hợp đồng.
  - 🟡 **Hợp đồng cần xử lý hôm nay**: Danh sách việc cần làm cụ thể (gặp đối tác, trình ký, đối soát công nợ, đôn đốc...).
  - 🕒 **Hợp đồng sắp hết hạn (30 ngày tới)**: Đưa ra cảnh báo để kịp thời đàm phán gia hạn hoặc thanh lý.
- Có nút **"Đã xử lý"** nhanh để cập nhật ngay tiến độ và hẹn ngày cho bước tiếp theo.

### 2. 📊 Bảng Quy Trình Xử Lý Hợp Đồng (Kanban Pipeline)
Trực quan hóa đường đi của từng hợp đồng qua 5 giai đoạn:
1. **Soạn thảo / Mới tạo** *(Draft)*
2. **Chờ thẩm định / Duyệt** *(Reviewing)*
3. **Chờ ký kết** *(Signing)*
4. **Đang thực hiện** *(Active)*
5. **Sắp hết hạn** *(Expiring)*
- Hỗ trợ chuyển bước tiến độ nhanh chỉ với 1 click.
- Thẻ hợp đồng thể hiện rõ đối tác, giá trị tiền tệ, người phụ trách và nhiệm vụ đầu ngày.

### 3. 📋 Danh Sách Chi Tiết & Bộ Lọc Nâng Cao (Table View)
- Bảng tổng hợp toàn bộ các hợp đồng đang vận hành.
- Tìm kiếm nhanh tức thì theo: Tên hợp đồng, Mã HĐ, Tên đối tác, Người phụ trách.
- Lọc theo loại hợp đồng (Dịch vụ, Mua sắm, Thuê tài sản, Hợp tác, Lao động...) và độ ưu tiên.

### 4. 📦 Kho Lưu Trữ Hợp Đồng Đã Xử Lý Xong (Archive)
- Khi hợp đồng hoàn tất hoặc đã thanh lý nghiệm thu, hợp đồng được chuyển vào **Kho Lưu Trữ**.
- Tách biệt khỏi quy trình đang chạy để tránh rối mắt nhưng vẫn giữ nguyên đầy đủ lịch sử hoạt động, hồ sơ tài liệu.
- Cho phép tra cứu bất kỳ lúc nào hoặc bấm **Khôi phục** nếu phát sinh công việc cần mở lại.

### 5. 📈 Báo Cáo & Biểu Đồ Thống Kê (Analytics)
- Biểu đồ tròn tỷ lệ hợp đồng theo từng giai đoạn.
- Biểu đồ cột tổng giá trị tài chính theo từng nhóm loại hợp đồng.

### 6. 📝 Chi Tiết Hợp Đồng & Nhật Ký Hoạt Động (Timeline Activity Log)
- Xem toàn diện thông tin hợp đồng, hạn thanh toán, hồ sơ đính kèm.
- Ghi nhận nhật ký tiến độ: mỗi khi trao đổi với đối tác hay kế toán, bạn có thể thêm nhanh 1 dòng nhật ký.
- Nút **In phiếu tóm tắt** tiện dụng khi cần in giấy hoặc lưu PDF.

### 7. 💾 An Toàn Dữ Liệu (Backup & Restore)
- Lưu tự động vào trình duyệt.
- Nút **Sao lưu**: Tải về file `.json` để lưu trữ hoặc chuyển sang máy khác.
- Nút **Nhập file**: Phục hồi lại dữ liệu từ file backup bất cứ khi nào.
- Nút **Dữ liệu mẫu**: Nạp lại bộ hợp đồng mẫu để trải nghiệm thử.

---

## 🚀 Hướng Dẫn Sử Dụng

### Cách 1: Mở trực tiếp
1. Vào thư mục dự án: `d:\JOB\Dũng VibeCode - Antigravity\ContractFlow`
2. Nhấp đúp chuột vào file **`index.html`** để mở ngay bằng trình duyệt (Google Chrome, Microsoft Edge, Firefox, Cốc Cốc, Brave...).

### Cách 2: Mở nhanh qua PowerShell / Terminal
Chạy lệnh sau:
```powershell
Start-Process "ContractFlow\index.html"
```
