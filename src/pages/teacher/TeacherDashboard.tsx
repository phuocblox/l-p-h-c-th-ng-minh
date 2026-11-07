import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { db } from '../../services/db';
import {
  Users,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  FileText,
  PlusCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Volume2,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { StatusChip } from '../../components/common/StatusChip';
import { Modal } from '../../components/common/Modal';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const [isAnnounceModalOpen, setIsAnnounceModalOpen] = useState(false);
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceContent, setAnnounceContent] = useState('');

  // Fetch real data from DB
  const classes = db.getClasses();
  const students = db.getStudents();
  const alerts = db.getAlerts();
  const schedules = db.getSchedules();
  const assignments = db.getAssignments();
  const auditLogs = db.getAuditLogs().slice(0, 5);

  // Today attendance stats
  const todaySessions = db.getAttendanceSessions();
  const latestSession = todaySessions[0];
  const presentCount = latestSession ? latestSession.presentCount : 10;
  const excusedCount = latestSession ? latestSession.excusedCount : 1;
  const lateCount = latestSession ? latestSession.lateCount : 1;

  // Pending grading
  const totalSubmissions = assignments.reduce((acc, a) => acc + (a.submittedCount || 0), 0);
  const totalGraded = assignments.reduce((acc, a) => acc + (a.gradedCount || 0), 0);
  const pendingGradingCount = Math.max(0, totalSubmissions - totalGraded);

  // Quick announcement create
  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announceTitle.trim() || !announceContent.trim()) return;

    db.createAnnouncement({
      title: announceTitle,
      content: announceContent,
      priority: 'HIGH',
      targetType: 'ALL',
      authorName: user?.fullName || 'Cô Nguyễn Thu Hà',
      authorRole: 'Giáo viên chủ nhiệm',
      totalRecipients: students.length,
    });

    success('Đã gửi thông báo thành công đến học sinh và phụ huynh!');
    setIsAnnounceModalOpen(false);
    setAnnounceTitle('');
    setAnnounceContent('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-blue-100 mb-3 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Năm học 2026 - 2027 • Học kỳ I</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Xin chào, {user?.fullName || 'Cô Nguyễn Thu Hà'}! 👋
            </h1>
            <p className="text-sm text-blue-100 mt-2 max-w-2xl leading-relaxed">
              Hôm nay là Thứ Bảy, 10/10/2026. Lớp chủ nhiệm 9A1 có 10/12 học sinh có mặt, 1 em xin phép sốt nhẹ và 1 em đi trễ.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => navigate('/teacher/attendance')}
              className="px-4 py-2.5 bg-white text-blue-700 hover:bg-blue-50 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span>Điểm danh ngay</span>
            </button>
            <button
              onClick={() => navigate('/teacher/tools')}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl font-semibold text-xs backdrop-blur-md border border-white/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <Volume2 className="w-4 h-4" />
              <span>Gọi số ngẫu nhiên</span>
            </button>
          </div>
        </div>

        {/* Decorative background circle */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/5 blur-2xl pointer-events-none" />
      </div>

      {/* Quick KPIs Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng học sinh"
          value={students.length}
          subtitle="Thuộc 3 lớp phụ trách"
          icon={Users}
          color="blue"
          onClick={() => navigate('/teacher/students')}
        />
        <StatCard
          title="Có mặt hôm nay"
          value={`${presentCount}/${students.length}`}
          subtitle={`${excusedCount} phép, ${lateCount} trễ`}
          icon={CheckCircle}
          color="emerald"
          trend={{ value: 'Tỷ lệ 92%', isPositive: true }}
          onClick={() => navigate('/teacher/attendance')}
        />
        <StatCard
          title="Bài chưa chấm"
          value={pendingGradingCount}
          subtitle="Cần hoàn thành chấm điểm"
          icon={FileText}
          color="amber"
          onClick={() => navigate('/teacher/assignments')}
        />
        <StatCard
          title="Cảnh báo cần xử lý"
          value={alerts.filter(a => a.status === 'NEW').length}
          subtitle="Chuyên cần & điểm số"
          icon={AlertTriangle}
          color="rose"
          onClick={() => navigate('/teacher/alerts')}
        />
      </div>

      {/* Quick Action Ribbon */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Thao tác nhanh thường dùng:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <button
            onClick={() => navigate('/teacher/attendance')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-blue-50/80 hover:text-blue-700 border border-slate-200/60 transition-all cursor-pointer group text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700">Điểm danh</p>
              <p className="text-[10px] text-slate-500">Tiết học hôm nay</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/teacher/assignments')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-purple-50/80 hover:text-purple-700 border border-slate-200/60 transition-all cursor-pointer group text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-purple-700">Giao bài tập</p>
              <p className="text-[10px] text-slate-500">Đề cương & hạn nộp</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/teacher/grades')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/80 hover:text-emerald-700 border border-slate-200/60 transition-all cursor-pointer group text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">Nhập điểm</p>
              <p className="text-[10px] text-slate-500">TX, Giữa kỳ, Cuối kỳ</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/teacher/tools')}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-amber-50/80 hover:text-amber-700 border border-slate-200/60 transition-all cursor-pointer group text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-amber-700">Công cụ lớp</p>
              <p className="text-[10px] text-slate-500">Vòng quay & Timer</p>
            </div>
          </button>

          <button
            onClick={() => setIsAnnounceModalOpen(true)}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 hover:bg-rose-50/80 hover:text-rose-700 border border-slate-200/60 transition-all cursor-pointer group text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-rose-700">Gửi thông báo</p>
              <p className="text-[10px] text-slate-500">Toàn bộ phụ huynh</p>
            </div>
          </button>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Classes & Today Schedule */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Classes Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Lớp học phụ trách</h3>
                <p className="text-xs text-slate-500">Bấm vào lớp để vào không gian làm việc chi tiết</p>
              </div>
              <button
                onClick={() => navigate('/teacher/classes')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Xem tất cả ({classes.length})</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {classes.map(cls => (
                <div
                  key={cls.id}
                  onClick={() => navigate(`/teacher/classes/${cls.id}`)}
                  className="rounded-2xl border border-slate-200 hover:border-blue-500 p-4 transition-all duration-200 hover:shadow-md cursor-pointer group bg-gradient-to-b from-white to-slate-50/40 relative overflow-hidden"
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ backgroundColor: cls.color || '#2563EB' }}
                  />
                  <div className="flex items-center justify-between mb-2 mt-1">
                    <span className="font-extrabold text-lg text-slate-900 group-hover:text-blue-600 transition-colors">
                      {cls.name}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                      {cls.roomNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">{cls.description}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">
                      👥 {cls.studentCount || 12} học sinh
                    </span>
                    <span className="text-blue-600 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Vào lớp <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Schedule Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Lịch giảng dạy & Thời khóa biểu</h3>
              </div>
              <button
                onClick={() => navigate('/teacher/schedule')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                Xem chi tiết tuần
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {schedules.slice(0, 4).map(item => (
                <div key={item.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex flex-col items-center justify-center font-bold">
                      <span className="text-[10px] uppercase font-semibold text-blue-500">Tiết</span>
                      <span className="text-xs leading-none">{item.period}</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{item.subjectName}</p>
                      <p className="text-[11px] text-slate-500">
                        Lớp {item.className} • Phòng {item.room} • {item.startTime} - {item.endTime}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/teacher/classes/${item.classId}?tab=attendance`)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                  >
                    Vào tiết
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Alerts & Recent Activity */}
        <div className="lg:col-span-4 space-y-6">
          {/* Alerts Box */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900">Cảnh báo học tập</h3>
              </div>
              <button
                onClick={() => navigate('/teacher/alerts')}
                className="text-[11px] font-semibold text-blue-600 hover:underline"
              >
                Tất cả
              </button>
            </div>

            <div className="space-y-3">
              {alerts.slice(0, 3).map(alt => (
                <div
                  key={alt.id}
                  className={`p-3 rounded-xl border text-xs ${
                    alt.severity === 'high'
                      ? 'bg-rose-50/60 border-rose-200/80 text-rose-900'
                      : 'bg-amber-50/60 border-amber-200/80 text-amber-900'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span>{alt.title}</span>
                    <span className="text-[10px] uppercase">{alt.className}</span>
                  </div>
                  <p className="text-[11px] opacity-90 leading-relaxed">{alt.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Log / Recent System Activity */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <h3 className="text-sm font-bold text-slate-900">Hoạt động gần đây (Audit)</h3>
              </div>
            </div>

            <div className="space-y-3">
              {auditLogs.map(log => (
                <div key={log.id} className="text-xs border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{log.action}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{log.details}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Announcement Modal */}
      <Modal
        isOpen={isAnnounceModalOpen}
        onClose={() => setIsAnnounceModalOpen(false)}
        title="Gửi thông báo toàn trường & lớp"
      >
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề thông báo</label>
            <input
              type="text"
              required
              value={announceTitle}
              onChange={e => setAnnounceTitle(e.target.value)}
              placeholder="VD: Nhắc nhở nộp bài tập hình học trước 22h tối nay"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung chi tiết</label>
            <textarea
              required
              rows={4}
              value={announceContent}
              onChange={e => setAnnounceContent(e.target.value)}
              placeholder="Nhập nội dung lời dặn, yêu cầu bài làm hoặc hướng dẫn phụ huynh..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAnnounceModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-medium hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-xs"
            >
              Phát thông báo ngay
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
