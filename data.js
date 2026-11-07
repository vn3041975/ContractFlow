// Dữ liệu mẫu khởi tạo ban đầu cho hệ thống Quản Lý Hợp Đồng
const initialContracts = [
  {
    id: "HD-2026-001",
    title: "Hợp đồng Cung cấp Dịch vụ Phần mềm Quản trị Doanh nghiệp",
    partner: "Công ty Cổ phần Công nghệ Alpha Việt Nam",
    partnerContact: "0912.345.678 - contact@alphatech.vn",
    contractType: "Dịch vụ",
    value: 180000000,
    startDate: "2026-10-01",
    endDate: "2027-10-01",
    nextActionDate: "2026-11-07", // Hôm nay
    nextActionNote: "Gặp đối tác rà soát tiến độ sprint 1 và ký biên bản nghiệm thu giai đoạn 1",
    priority: "high", // high, medium, low
    stage: "active", // draft, review, signing, active, expiring, completed
    assignee: "Nguyễn Văn Dũng",
    notes: [
      { date: "2026-10-01", content: "Ký hợp đồng và nhận tạm ứng đợt 1 (30%)" },
      { date: "2026-10-25", content: "Hoàn tất triển khai môi trường Staging" }
    ],
    documents: ["HD_DichVu_Alpha_signed.pdf", "Phuluc_01_Phamvi.pdf"],
    isArchived: false,
    completedAt: null
  },
  {
    id: "HD-2026-002",
    title: "Hợp đồng Thuê Văn phòng Tầng 8 - Tòa nhà Landmark",
    partner: "Công ty TNHH Quản lý Bất động sản Thịnh Vượng",
    partnerContact: "0903.111.222 - info@thinhvuongland.vn",
    contractType: "Thuê tài sản",
    value: 450000000,
    startDate: "2025-11-15",
    endDate: "2026-11-15", // Sắp hết hạn trong vài ngày
    nextActionDate: "2026-11-07", // Cần xử lý đầu ngày hôm nay
    nextActionNote: "Gửi công văn gia hạn hợp đồng thuê năm 2027 và đàm phán lại mức giá chiết khấu",
    priority: "high",
    stage: "expiring",
    assignee: "Trần Thị Mai",
    notes: [
      { date: "2026-10-15", content: "Họp nội bộ thống nhất nhu cầu mở rộng thêm 50m2" },
      { date: "2026-11-02", content: "Bên cho thuê gửi bảng giá mới" }
    ],
    documents: ["HD_ThueVanPhong_2025_2026.pdf"],
    isArchived: false,
    completedAt: null
  },
  {
    id: "HD-2026-003",
    title: "Hợp đồng Mua sắm Thiết bị Tin học và Máy chủ Dell PowerEdge",
    partner: "Công ty Thiết bị Máy tính Sao Nam",
    partnerContact: "0988.999.888 - saonam@computer.vn",
    contractType: "Mua sắm",
    value: 320000000,
    startDate: "2026-11-05",
    endDate: "2026-12-31",
    nextActionDate: "2026-11-08",
    nextActionNote: "Phòng pháp chế kiểm tra điều khoản bảo hành 36 tháng tận nơi",
    priority: "medium",
    stage: "review",
    assignee: "Lê Hoàng Long",
    notes: [
      { date: "2026-11-05", content: "Nhận bản thảo hợp đồng lần 1 từ NCC" }
    ],
    documents: ["BaoGia_SaoNam_v2.xlsx", "HopDong_Draft_MayChu.docx"],
    isArchived: false,
    completedAt: null
  },
  {
    id: "HD-2026-004",
    title: "Hợp đồng Hợp tác Phân phối Độc quyền Sản phẩm Khu vực Miền Trung",
    partner: "Tập đoàn Phân phối & Bán lẻ Phương Nam",
    partnerContact: "0934.555.666 - phuongnam@corp.vn",
    contractType: "Hợp tác",
    value: 1200000000,
    startDate: "2026-11-10",
    endDate: "2028-11-10",
    nextActionDate: "2026-11-07", // Hôm nay
    nextActionNote: "Trình Tổng Giám Đốc ký đóng dấu 04 bản hợp đồng chính thức",
    priority: "high",
    stage: "signing",
    assignee: "Nguyễn Văn Dũng",
    notes: [
      { date: "2026-10-20", content: "Hai bên đã chốt các điều khoản chiết khấu thương mại" },
      { date: "2026-11-04", content: "Pháp chế hai bên đã thông qua bản thảo cuối cùng" }
    ],
    documents: ["HD_HopTac_PhuongNam_Final.pdf"],
    isArchived: false,
    completedAt: null
  },
  {
    id: "HD-2026-005",
    title: "Hợp đồng Lao động Chuyên gia Tư vấn Chuyển đổi số",
    partner: "Ông Phạm Minh Khôi (Chuyên gia tư vấn)",
    partnerContact: "0918.777.888 - khoi.pham@gmail.com",
    contractType: "Lao động",
    value: 240000000,
    startDate: "2026-11-15",
    endDate: "2027-05-15",
    nextActionDate: "2026-11-10",
    nextActionNote: "Soạn thảo phụ lục bảo mật thông tin (NDA) và quyền sở hữu trí tuệ",
    priority: "low",
    stage: "draft",
    assignee: "Phạm Thu Hà",
    notes: [
      { date: "2026-11-01", content: "Thống nhất mức lương và mục tiêu KPI công việc" }
    ],
    documents: ["CV_KhoiPham.pdf", "ThoaThuan_SoBo.pdf"],
    isArchived: false,
    completedAt: null
  },
  {
    id: "HD-2026-006",
    title: "Hợp đồng Nâng cấp Hạ tầng Mạng Lan và Firewall",
    partner: "Công ty Cổ phần Giải pháp Mạng NetTech",
    partnerContact: "0909.444.333 - contact@nettech.vn",
    contractType: "Dịch vụ",
    value: 85000000,
    startDate: "2026-08-01",
    endDate: "2026-10-30",
    nextActionDate: null,
    nextActionNote: "Đã hoàn tất thanh lý và bảo lưu hồ sơ bảo hành 12 tháng",
    priority: "low",
    stage: "completed",
    assignee: "Lê Hoàng Long",
    notes: [
      { date: "2026-10-28", content: "Nghiệm thu toàn bộ hệ thống cáp và cấu hình Firewall Fortinet" },
      { date: "2026-10-30", content: "Kế toán thanh toán 100% giá trị hợp đồng, chuyển lưu trữ" }
    ],
    documents: ["BienBan_NghiemThu_NetTech.pdf", "HoaDon_ThanhToan_NetTech.pdf"],
    isArchived: true,
    completedAt: "2026-10-30"
  },
  {
    id: "HD-2026-007",
    title: "Hợp đồng Thiết kế Bộ Nhận Diện Thương Hiệu 2026",
    partner: "Studio Sáng Tạo BrandX",
    partnerContact: "0945.123.456 - hello@brandx.vn",
    contractType: "Dịch vụ",
    value: 95000000,
    startDate: "2026-05-01",
    endDate: "2026-09-01",
    nextActionDate: null,
    nextActionNote: "Đã bàn giao đầy đủ file vector và hướng dẫn sử dụng thương hiệu",
    priority: "low",
    stage: "completed",
    assignee: "Trần Thị Mai",
    notes: [
      { date: "2026-09-01", content: "Hoàn tất hợp đồng, đã thanh lý" }
    ],
    documents: ["HD_BrandX_Liquidation.pdf"],
    isArchived: true,
    completedAt: "2026-09-01"
  }
];

// Danh mục giai đoạn quy trình (Process Pipeline Stages)
const STAGES = {
  draft: {
    id: "draft",
    name: "Soạn thảo / Mới tạo",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
    icon: "file-edit",
    color: "#64748b"
  },
  review: {
    id: "review",
    name: "Chờ thẩm định / Duyệt",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-200",
    icon: "clock",
    color: "#d97706"
  },
  signing: {
    id: "signing",
    name: "Chờ ký kết",
    badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
    icon: "pen-tool",
    color: "#9333ea"
  },
  active: {
    id: "active",
    name: "Đang thực hiện",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
    icon: "activity",
    color: "#2563eb"
  },
  expiring: {
    id: "expiring",
    name: "Sắp hết hạn",
    badgeClass: "bg-rose-100 text-rose-800 border-rose-200",
    icon: "alert-triangle",
    color: "#e11d48"
  },
  completed: {
    id: "completed",
    name: "Đã hoàn tất / Lưu trữ",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: "check-circle",
    color: "#059669"
  }
};

const CONTRACT_TYPES = [
  "Dịch vụ",
  "Mua sắm",
  "Thuê tài sản",
  "Hợp tác",
  "Lao động",
  "Bảo mật thông tin (NDA)",
  "Khác"
];
