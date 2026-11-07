import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { db } from '../services/db';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  CheckSquare,
  Calendar,
  FileText,
  HelpCircle,
  Database,
  BookOpen,
  Sparkles,
  BarChart2,
  Clock,
  Award,
  Bell,
  Wrench,
  FileCheck,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  Plus,
  Shield,
  HeartHandshake,
  UserCheck,
  ChevronDown,
  RotateCcw,
  BookMarked,
  Layers,
  School,
  Sliders,
  AlertTriangle,
} from 'lucide-react';
import { Modal } from '../components/common/Modal';

export const AppLayout: React.FC = () => {
  const { user, role, logout, switchRole, demoAccounts } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  // Collapsible sidebar modules state
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionName: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  // Notifications from db
  const alerts = db.getAlerts().slice(0, 4);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleResetData = () => {
    if (window.confirm('Bạn có chắc muốn khôi phục dữ liệu ban đầu không?')) {
      db.resetToSeed();
      success('Đã khôi phục dữ liệu ban đầu thành công!');
      window.location.reload();
    }
  };

  // Nav items per role
  const getNavLinks = () => {
    if (role === 'ADMIN') {
      return [
        {
          section: 'TỔNG QUAN',
          items: [
            { label: 'Tổng quan hệ thống', path: '/admin/dashboard', icon: LayoutDashboard },
          ],
        },
        {
          section: 'QUẢN TRỊ TRƯỜNG & KHỐI',
          items: [
            { label: 'Trường học', path: '/admin/schools', icon: School },
            { label: 'Năm học & Khối', path: '/admin/academic-years', icon: Layers },
            { label: 'Môn học', path: '/admin/subjects', icon: BookMarked },
            { label: 'Quản lý Lớp học', path: '/admin/classes', icon: GraduationCap },
          ],
        },
        {
          section: 'NGƯỜI DÙNG & PHÂN QUYỀN',
          items: [
            { label: 'Quản lý Giáo viên', path: '/admin/teachers', icon: UserCheck },
            { label: 'Quản lý Học sinh', path: '/admin/students', icon: Users },
            { label: 'Quản lý Phụ huynh', path: '/admin/parents', icon: HeartHandshake },
            { label: 'Phân quyền & Vai trò', path: '/admin/roles', icon: Shield },
          ],
        },
        {
          section: 'BÁO CÁO & BẢO MẬT',
          items: [
            { label: 'Nhật ký hoạt động (Audit)', path: '/admin/audit-logs', icon: Clock },
            { label: 'Báo cáo toàn trường', path: '/admin/reports', icon: BarChart2 },
            { label: 'Cấu hình hệ thống', path: '/admin/settings', icon: Sliders },
          ],
        },
      ];
    }

    if (role === 'STUDENT') {
      return [
        {
          section: 'TỔNG QUAN',
          items: [
            { label: 'Trang chủ học tập', path: '/student/dashboard', icon: LayoutDashboard },
          ],
        },
        {
          section: 'LỊCH HỌC & CHUYÊN CẦN',
          items: [
            { label: 'Thời khóa biểu', path: '/student/schedule', icon: Calendar },
            { label: 'Chuyên cần của em', path: '/student/attendance', icon: CheckSquare },
          ],
        },
        {
          section: 'HỌC TẬP & ĐÁNH GIÁ',
          items: [
            { label: 'Bài tập về nhà', path: '/student/assignments', icon: FileText },
            { label: 'Kiểm tra & Quiz', path: '/student/quizzes', icon: HelpCircle },
            { label: 'Kho học liệu số', path: '/student/resources', icon: BookOpen },
            { label: 'Bảng điểm cá nhân', path: '/student/grades', icon: BarChart2 },
          ],
        },
        {
          section: 'KHEN THƯỞNG & THÔNG BÁO',
          items: [
            { label: 'Thành tích & Khen thưởng', path: '/student/achievements', icon: Award },
            { label: 'Thông báo lớp & trường', path: '/student/announcements', icon: Bell },
            { label: 'Hồ sơ học sinh', path: '/student/profile', icon: Users },
          ],
        },
      ];
    }

    if (role === 'PARENT') {
      return [
        {
          section: 'TỔNG QUAN',
          items: [
            { label: 'Tổng quan theo dõi', path: '/parent/dashboard', icon: LayoutDashboard },
          ],
        },
        {
          section: 'THEO DÕI HỌC TẬP',
          items: [
            { label: 'Hồ sơ con', path: '/parent/children', icon: Users },
            { label: 'Kết quả học tập & Điểm', path: '/parent/grades', icon: BarChart2 },
            { label: 'Theo dõi chuyên cần', path: '/parent/attendance', icon: CheckSquare },
            { label: 'Bài tập & Nhiệm vụ', path: '/parent/assignments', icon: FileText },
          ],
        },
        {
          section: 'KẾT NỐI & TRAO ĐỔI',
          items: [
            { label: 'Nhận xét & Thi đua', path: '/parent/comments', icon: Award },
            { label: 'Lịch học trong tuần', path: '/parent/schedule', icon: Calendar },
            { label: 'Thông báo từ giáo viên', path: '/parent/announcements', icon: Bell },
            { label: 'Trao đổi với cô giáo', path: '/parent/messages', icon: HeartHandshake },
          ],
        },
      ];
    }

    // Default: TEACHER navigation
    return [
      {
        section: 'TỔNG QUAN',
        items: [
          { label: 'Bàn làm việc (Dashboard)', path: '/teacher/dashboard', icon: LayoutDashboard },
        ],
      },
      {
        section: 'QUẢN LÝ LỚP HỌC',
        items: [
          { label: 'Lớp của tôi', path: '/teacher/classes', icon: GraduationCap },
          { label: 'Học sinh', path: '/teacher/students', icon: Users },
          { label: 'Điểm danh', path: '/teacher/attendance', icon: CheckSquare },
          { label: 'Thời khóa biểu', path: '/teacher/schedule', icon: Calendar },
        ],
      },
      {
        section: 'DẠY & HỌC',
        items: [
          { label: 'Bài tập', path: '/teacher/assignments', icon: FileText },
          { label: 'Kiểm tra / Quiz Online', path: '/teacher/quizzes', icon: HelpCircle },
          { label: 'Ngân hàng câu hỏi', path: '/teacher/question-bank', icon: Database },
          { label: 'Kho học liệu số', path: '/teacher/resources', icon: BookOpen },
          { label: 'Trợ lý AI hỗ trợ', path: '/teacher/ai', icon: Sparkles, badge: 'AI' },
        ],
      },
      {
        section: 'THEO DÕI & ĐÁNH GIÁ',
        items: [
          { label: 'Sổ điểm điện tử', path: '/teacher/grades', icon: BarChart2 },
          { label: 'Báo cáo Chuyên cần', path: '/teacher/attendance-analytics', icon: Clock },
          { label: 'Nhật ký Hành vi', path: '/teacher/behavior', icon: FileCheck },
          { label: 'Thi đua & Khen thưởng', path: '/teacher/rewards', icon: Award },
          { label: 'Cảnh báo học tập', path: '/teacher/alerts', icon: AlertTriangle, badge: alerts.length },
        ],
      },
      {
        section: 'CÔNG CỤ LỚP HỌC',
        items: [
          { label: 'Tool Hub (Vòng quay, Timer)', path: '/teacher/tools', icon: Wrench },
        ],
      },
      {
        section: 'KẾT NỐI & BÁO CÁO',
        items: [
          { label: 'Bảng tin & Thông báo', path: '/teacher/announcements', icon: Bell },
          { label: 'Xuất báo cáo & Thống kê', path: '/teacher/reports', icon: BarChart2 },
          { label: 'Cài đặt tài khoản', path: '/teacher/settings', icon: Settings },
        ],
      },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased font-sans text-slate-800">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 h-16 flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Brand Logo */}
          <div
            onClick={() => navigate(role === 'ADMIN' ? '/admin/dashboard' : role === 'STUDENT' ? '/student/dashboard' : role === 'PARENT' ? '/parent/dashboard' : '/teacher/dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                SMART CLASS
              </span>
              <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Quản lý lớp học số
              </p>
            </div>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={globalSearchTerm}
              onChange={e => setGlobalSearchTerm(e.target.value)}
              placeholder="Tìm kiếm lớp học, học sinh, bài tập, điểm số..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100/70 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-blue-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-800"
            />
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Role Switcher for instant Demo testing */}
          <div className="relative hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            {demoAccounts.map(acc => {
              const isActive = role === acc.role;
              return (
                <button
                  key={acc.role}
                  onClick={() => {
                    switchRole(acc.role);
                    const dest =
                      acc.role === 'ADMIN'
                        ? '/admin/dashboard'
                        : acc.role === 'STUDENT'
                        ? '/student/dashboard'
                        : acc.role === 'PARENT'
                        ? '/parent/dashboard'
                        : '/teacher/dashboard';
                    navigate(dest);
                    success(`Đã chuyển sang vai trò: ${acc.label}`);
                  }}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                    isActive
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={acc.label}
                >
                  {acc.role === 'TEACHER' && 'Giáo viên'}
                  {acc.role === 'STUDENT' && 'Học sinh'}
                  {acc.role === 'PARENT' && 'Phụ huynh'}
                  {acc.role === 'ADMIN' && 'Admin'}
                </button>
              );
            })}
          </div>

          {/* Quick Create Button (Teacher & Admin) */}
          {(role === 'TEACHER' || role === 'ADMIN') && (
            <button
              onClick={() => setIsQuickCreateOpen(true)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo nhanh</span>
            </button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 relative transition-colors"
              aria-label="Thông báo"
            >
              <Bell className="w-5 h-5" />
              {alerts.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-800">Cảnh báo & Thông báo mới</span>
                  <span className="text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full font-bold">
                    {alerts.length} việc cần chú ý
                  </span>
                </div>
                <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                  {alerts.map(a => (
                    <div
                      key={a.id}
                      onClick={() => {
                        setIsNotifOpen(false);
                        navigate('/teacher/alerts');
                      }}
                      className="p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-800">{a.title}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                          a.severity === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {a.severity === 'high' ? 'Khẩn cấp' : 'Nhắc nhở'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{a.message}</p>
                    </div>
                  ))}
                </div>
                <div className="px-3 pt-2 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      setIsNotifOpen(false);
                      navigate('/teacher/alerts');
                    }}
                    className="text-xs text-blue-600 font-semibold hover:underline"
                  >
                    Xem tất cả cảnh báo
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 pl-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'}
                alt={user?.fullName || 'User'}
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
              <div className="hidden xl:block text-left text-xs">
                <p className="font-semibold text-slate-800 leading-tight">{user?.fullName}</p>
                <p className="text-slate-400 text-[10px] font-medium uppercase tracking-wider">{role}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800">{user?.fullName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      navigate(role === 'STUDENT' ? '/student/profile' : role === 'PARENT' ? '/parent/profile' : '/teacher/profile');
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>Hồ sơ cá nhân</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      handleResetData();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4 text-amber-500" />
                    <span>Khôi phục dữ liệu mẫu</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Body: Sidebar + Main Content Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar (260px) */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200/80 flex-shrink-0 overflow-y-auto">
          {/* School badge */}
          <div className="p-4 border-b border-slate-100 flex items-center gap-2.5 bg-slate-50/50">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs flex-shrink-0">
              CVA
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-800 truncate">THCS Chu Văn An</p>
              <p className="text-[10px] text-slate-500">Năm học 2026 - 2027</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-4">
            {navLinks.map((group, gIdx) => {
              const isCollapsed = !!collapsedSections[group.section];
              return (
                <div key={gIdx} className="space-y-1">
                  {/* Collapsible Section Header Toggle */}
                  <button
                    type="button"
                    onClick={() => toggleSection(group.section)}
                    className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[10px] font-extrabold text-slate-400 hover:text-slate-800 uppercase tracking-wider hover:bg-slate-100/80 transition-all cursor-pointer group"
                    title={isCollapsed ? `Nhấn để mở ${group.section}` : `Nhấn để đóng ${group.section}`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="truncate">{group.section}</span>
                      {isCollapsed && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 normal-case font-mono">
                          {group.items.length}
                        </span>
                      )}
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform duration-200 flex-shrink-0 ${
                        isCollapsed ? '-rotate-90' : 'rotate-0'
                      }`}
                    />
                  </button>

                  {/* Collapsible Items Container */}
                  {!isCollapsed && (
                    <div className="space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                      {group.items.map((item: any, iIdx: number) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/'));
                        return (
                          <NavLink
                            key={iIdx}
                            to={item.path}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                              isActive
                                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 truncate">
                              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                              <span className="truncate">{item.label}</span>
                            </div>
                            {item.badge && (
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ${
                                  isActive
                                    ? 'bg-white/20 text-white'
                                    : item.badge === 'AI'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-rose-100 text-rose-700'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Quick Support / Version */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-400 text-center">
            <span className="font-semibold text-slate-600">Smart Class v2.4</span> • Chuẩn số hóa 2026
          </div>
        </aside>

        {/* Mobile Drawer */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[85%] bg-white h-full flex flex-col z-50 shadow-2xl animate-in slide-in-from-left">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-slate-800 text-sm">SMART CLASS</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Role Switcher */}
              <div className="p-3 bg-slate-50 border-b border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Đổi vai trò xem thử
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {demoAccounts.map(acc => (
                    <button
                      key={acc.role}
                      onClick={() => {
                        switchRole(acc.role);
                        setIsMobileMenuOpen(false);
                        const dest =
                          acc.role === 'ADMIN'
                            ? '/admin/dashboard'
                            : acc.role === 'STUDENT'
                            ? '/student/dashboard'
                            : acc.role === 'PARENT'
                            ? '/parent/dashboard'
                            : '/teacher/dashboard';
                        navigate(dest);
                      }}
                      className={`px-2 py-1.5 text-xs font-semibold rounded-lg text-left truncate ${
                        role === acc.role
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-700'
                      }`}
                    >
                      {acc.label.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Nav */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {navLinks.map((group, gIdx) => {
                  const isCollapsed = !!collapsedSections[group.section];
                  return (
                    <div key={gIdx} className="space-y-1">
                      {/* Section Header Toggle in Mobile */}
                      <button
                        type="button"
                        onClick={() => toggleSection(group.section)}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-slate-800 uppercase tracking-wider hover:bg-slate-100 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="truncate">{group.section}</span>
                          {isCollapsed && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 normal-case font-mono">
                              {group.items.length}
                            </span>
                          )}
                        </div>
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform duration-200 flex-shrink-0 ${
                            isCollapsed ? '-rotate-90' : 'rotate-0'
                          }`}
                        />
                      </button>

                      {/* Items */}
                      {!isCollapsed && (
                        <div className="space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-150">
                          {group.items.map((item: any, iIdx: number) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/'));
                            return (
                              <NavLink
                                key={iIdx}
                                to={item.path}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium ${
                                  isActive ? 'bg-blue-600 text-white font-semibold' : 'text-slate-600 hover:bg-slate-100'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 truncate">
                                  <Icon className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate">{item.label}</span>
                                </div>
                                {item.badge && (
                                  <span
                                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold flex-shrink-0 ${
                                      isActive
                                        ? 'bg-white/20 text-white'
                                        : item.badge === 'AI'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-rose-100 text-rose-700'
                                    }`}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                              </NavLink>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="p-3 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 rounded-xl"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Quick Create Modal */}
      <Modal
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
        title="Tạo nhanh tác vụ mới"
        maxWidth="md"
      >
        <div className="grid grid-cols-2 gap-3 py-2">
          <button
            onClick={() => {
              setIsQuickCreateOpen(false);
              navigate('/teacher/classes?create=true');
            }}
            className="flex flex-col items-center p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Tạo Lớp học mới</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Khối, môn, phòng, mã tham gia</span>
          </button>

          <button
            onClick={() => {
              setIsQuickCreateOpen(false);
              navigate('/teacher/students?add=true');
            }}
            className="flex flex-col items-center p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Thêm Học sinh</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Thêm thủ công hoặc Excel</span>
          </button>

          <button
            onClick={() => {
              setIsQuickCreateOpen(false);
              navigate('/teacher/assignments?create=true');
            }}
            className="flex flex-col items-center p-4 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/50 transition-all text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Giao Bài tập</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Đề cương, hạn nộp, thang điểm</span>
          </button>

          <button
            onClick={() => {
              setIsQuickCreateOpen(false);
              navigate('/teacher/announcements?create=true');
            }}
            className="flex flex-col items-center p-4 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 transition-all text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Bell className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-800">Gửi Thông báo</span>
            <span className="text-[10px] text-slate-500 mt-0.5">Toàn trường hoặc từng lớp</span>
          </button>
        </div>
      </Modal>
    </div>
  );
};
