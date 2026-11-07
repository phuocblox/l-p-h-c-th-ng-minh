# SMART CLASS – QUẢN LÝ LỚP HỌC THÔNG MINH

Hệ thống quản lý lớp học số thông minh toàn diện, phục vụ 4 vai trò:
1. **Admin (Quản trị viên trường)**
2. **Giáo viên (Chủ nhiệm & Bộ môn)**
3. **Học sinh**
4. **Phụ huynh**

---

## 🚀 TÀI KHOẢN DÙNG THỬ (DEMO TEST ACCOUNTS)

Ứng dụng tích hợp nút **"Đổi vai trò xem thử" (1-Click)** ngay trên thanh Header và màn hình Đăng nhập để bạn có thể kiểm tra luồng nghiệp vụ của cả 4 vai trò mà không cần nhớ mật khẩu:

| Vai trò | Họ và tên | Email đăng nhập | Mật khẩu mẫu | Ghi chú quyền hạn |
|---|---|---|---|---|
| **Giáo viên** | Cô Nguyễn Thu Hà | `teacher@smartclass.edu.vn` | `123456` | GVCN Lớp 9A1, phụ trách dạy Toán khối 8 & 9 |
| **Học sinh** | Lê Hoàng Long | `student@smartclass.edu.vn` | `123456` | Học sinh Lớp 9A1, Tổ 1, nộp bài, xem điểm |
| **Phụ huynh** | Lê Văn Hùng | `parent@smartclass.edu.vn` | `123456` | Bố em Lê Hoàng Long, nhận xét, theo dõi con |
| **Quản trị viên (Admin)** | Thầy Trần Minh Đức | `admin@smartclass.edu.vn` | `123456` | Toàn quyền cấu hình trường, năm học, audit log |

---

## 🛠️ CÔNG NGHỆ SỬ DỤNG

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Canvas Confetti.
- **Routing:** React Router v7.
- **State & Data Layer:** Service reactive Store tích hợp LocalStorage persistence, auto-seeding dữ liệu mẫu tiếng Việt chuẩn quy chế giáo dục.
- **Database Backend (Supabase / PostgreSQL):** File migration hoàn chỉnh tại `supabase/schema.sql` với đầy đủ DDL, Foreign Keys, Indexes và Row Level Security (RLS) policies.

---

## 📁 CẤU TRÚC THƯ MỤC DỰ ÁN

```
src/
  ├── components/
  │    ├── auth/           # ProtectedRoute, RoleGuard, PermissionGuard
  │    └── common/         # Breadcrumb, PageHeader, StatCard, Modal, ConfirmDialog, Tabs, StatusChip, SearchBox
  ├── contexts/           # AuthContext (Role switcher, user state), ToastContext
  ├── data/               # seedData.ts (Dữ liệu mẫu trường THCS Chu Văn An, 3 lớp, 12 học sinh, bài tập, điểm số)
  ├── layouts/            # AppLayout (Sidebar 260px theo vai trò, Header tìm kiếm toàn cục, tạo nhanh, thông báo)
  ├── pages/
  │    ├── admin/          # AdminDashboard (Audit log trail, trường học, cấu hình sao lưu dữ liệu)
  │    ├── auth/           # LoginPage, ForbiddenPage (403), NotFoundPage (404)
  │    ├── parent/         # ParentDashboard (Theo dõi con 360°, kết quả học tập, trao đổi với cô giáo)
  │    ├── student/        # StudentDashboard (Thời khóa biểu, nộp bài tập online, bảng điểm, thi đua)
  │    └── teacher/        # TeacherDashboard, ClassesPage, ClassDetailPage, StudentsPage, AttendancePage, AssignmentsPage, GradesPage, ClassroomToolsPage, AlertsPage, AnnouncementsPage, AIAssistantPage, ReportsPage
  ├── services/           # db.ts (API mô phỏng Supabase với đầy đủ CRUD, lưu trữ cục bộ, audit trail)
  └── types/              # index.ts (Toàn bộ TypeScript interfaces cho hệ thống)
supabase/
  └── schema.sql          # File SQL migration và chính sách RLS cho Supabase/PostgreSQL
```

---

## ⚡ HƯỚNG DẪN CHẠY VÀ TRIỂN KHAI

### 1. Chạy trên môi trường Local
```bash
npm install
npm run dev
```
Mở trình duyệt tại: `http://localhost:3000`

### 2. Kiểm tra TypeScript & Build Production
```bash
npm run lint
npm run build
```

### 3. Triển khai lên Supabase & Vercel / Netlify
1. Tạo project mới trên [Supabase](https://supabase.com).
2. Vào **SQL Editor** trên Supabase, dán toàn bộ nội dung file `supabase/schema.sql` và nhấn **Run** để khởi tạo bảng và chính sách bảo mật RLS.
3. Cấu hình biến môi trường trên Vercel:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Build command: `npm run build`, Output directory: `dist`.
