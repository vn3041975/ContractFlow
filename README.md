# ContractFlow - Quản Lý Hợp Đồng Xây Dựng 🏗️

Hệ thống quản lý tiến trình luân chuyển hồ sơ, lịch biểu công việc và hợp đồng chuyên biệt cho ngành **Xây Dựng / Công Trình**.

---

## 🌟 Các Tính Năng Đã Được Cập Nhật Từ Bản Canvas:

### 1. 🏗️ Quy Trình Chuẩn Luân Chuyển Hồ Sơ Xây Dựng (Kanban 5 Cột)
Trực quan hóa vòng đời hợp đồng xây dựng qua 5 giai đoạn:
1. **1. Soạn thảo & Thẩm định kỹ thuật** *(DRAFT)*
2. **2. Đang trình ký nội bộ** *(INTERNAL_REVIEW - Ban Giám Đốc, Kế toán trưởng, Kỹ sư)*
3. **3. Bị trả về / Yêu cầu sửa đổi** *(REJECTED - Yêu cầu bổ sung bảo lãnh, sửa đơn giá)*
4. **4. Đã chuyển đối tác / CĐT ký** *(SENT_TO_PARTNER)*
5. **5. Đã ký đủ - Đang hiệu lực thi công** *(SIGNED_ACTIVE)*
- Kéo thả thẻ (Drag & Drop) mượt mà giữa các cột.
- Phím tắt chuyển trạng thái nhanh trên từng thẻ.

### 2. 📅 Lịch Tháng & Ghi Chú Kế Hoạch (Interactive Calendar)
- Xem lịch tháng trực quan với các chấm màu báo hiệu ngày có việc cần làm hoặc hợp đồng đến hạn.
- Chọn ngày bất kỳ để xem danh sách việc chi tiết hoặc bấm **"Thêm việc"** để lên lịch công tác, nghiệm thu, đối soát.

### 3. ☀️ Bàn Giao: "Hôm Nay Sẽ Làm Gì?" (Today Action Center)
- Nằm ngay đầu trang, tự động tổng hợp:
  - Các hợp đồng có hạn xử lý rơi vào hôm nay (cảnh báo đỏ nổi bật).
  - Các việc cần làm được xếp lịch trong ngày kèm checkbox hoàn thành.
  - Nút thêm nhanh việc hôm nay.

### 4. 🏷️ Phân Loại Ngành & Vai Trò Đối Tác Chuẩn Xây Dựng
- **Phân loại**:
  - 🏗️ Thi công xây dựng
  - 🧱 Cung cấp vật tư / vật liệu
  - 📐 Dịch vụ / Khảo sát / Tư vấn QLDA
  - 🚜 Thuê máy móc / Thiết bị cơ giới
  - 📊 Quyết toán hồ sơ
  - 📄 Khác
- **Vai trò đối tác**:
  - Chủ đầu tư (CĐT)
  - Nhà thầu phụ (NTP)
  - Nhà cung cấp (NCC)
  - Đối tác khác

### 5. 📂 Theo Dõi Đường Dẫn File Trên Máy Tính (`filepath`)
- Ghi nhận vị trí file hợp đồng lưu trên ổ cứng (ví dụ: `D:\DuAn_Landmark\ThepHoaPhat.pdf`).
- Nút bấm **"Copy path"** sao chép đường dẫn vào clipboard 1 chạm, dán vào File Explorer mở file ngay lập tức.

### 6. 💵 Hỗ Trợ Số Tiền Lẻ Thập Phân
- Định dạng tiền tệ chính xác đến từng đồng lẻ (ví dụ: `19.800.000.000,75 ₫`).

### 7. ☁️ Tự Động Đồng Bộ Đám Mây Realtime (Firebase Cloud)
- Đã nhúng sẵn dự án Firebase của bạn (`contractflow-fdacf`).
- Mọi máy tính và điện thoại mở link đều **tự động đồng bộ hợp đồng và lịch biểu công việc trong tích tắc (dưới 1 giây)**.

---

## 🚀 Triển Khai Lên Netlify:
Để cập nhật bản mới lên link web online của bạn:
1. Mở trang quản lý của bạn trên Netlify ➔ Tab **`Deploys`**.
2. Kéo thả thư mục **`ContractFlow`** (hoặc file `ContractFlow.zip`) vào khung tải lên là xong!
