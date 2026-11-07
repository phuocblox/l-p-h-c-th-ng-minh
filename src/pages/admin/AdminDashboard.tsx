import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { db } from '../../services/db';
import {
  Shield,
  School,
  Users,
  GraduationCap,
  Layers,
  BookOpen,
  Clock,
  Download,
  RotateCcw,
  CheckCircle2,
  HardDrive,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { success } = useToast();

  const school = db.getSchool();
  const classes = db.getClasses();
  const students = db.getStudents();
  const auditLogs = db.getAuditLogs();
  const [logSearch, setLogSearch] = useState('');

  const handleBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      school,
      classes,
      students,
      auditLogs,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SmartClass_Backup_${Date.now()}.json`;
    a.click();
    success('Đã tạo bản sao lưu toàn bộ cơ sở dữ liệu thành công!');
  };

  const filteredLogs = auditLogs.filter(
    l =>
      l.action.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.userName.toLowerCase().includes(logSearch.toLowerCase()) ||
      l.details.toLowerCase().includes(logSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Quản trị Hệ thống (Admin Portal)"
        subtitle="Quản lý toàn diện dữ liệu trường học, người dùng, phân quyền RBAC và nhật ký hoạt động"
        breadcrumbs={[{ label: 'Quản trị hệ thống' }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleBackup}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <HardDrive className="w-4 h-4" />
              <span>Sao lưu dữ liệu (Backup)</span>
            </button>
          </div>
        }
      />

      {/* Admin KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Trường học"
          value={school.name}
          subtitle={`Mã: ${school.code}`}
          icon={School}
          color="blue"
        />
        <StatCard
          title="Tổng số Lớp học"
          value={`${classes.length} Lớp`}
          subtitle="Khối 8 và Khối 9"
          icon={GraduationCap}
          color="purple"
        />
        <StatCard
          title="Tổng số Học sinh"
          value={`${students.length} HS`}
          subtitle="Đang theo học chính khóa"
          icon={Users}
          color="emerald"
        />
        <StatCard
          title="Nhật ký Audit Log"
          value={`${auditLogs.length} sự kiện`}
          subtitle="Ghi nhận bảo mật thời gian thực"
          icon={Clock}
          color="slate"
        />
      </div>

      {/* Main 2-column view */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Audit Log (8 cols) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">Nhật ký Hoạt động Hệ thống (Audit Trail)</h3>
              <p className="text-xs text-slate-500">
                Toàn bộ thao tác điểm danh, sửa điểm, tạo lớp và bảo mật đều được ghi nhận bất biến
              </p>
            </div>
            <input
              type="text"
              value={logSearch}
              onChange={e => setLogSearch(e.target.value)}
              placeholder="Lọc sự kiện..."
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {filteredLogs.map(log => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.action}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold">
                      {log.entityType}
                    </span>
                    <span className="text-[10px] text-blue-600 font-semibold">{log.userName}</span>
                  </div>
                  <p className="text-slate-600 mt-1">{log.details}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleString('vi-VN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System & School Config (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Thông tin Cơ sở Giáo dục</h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase">Tên trường</span>
              <p className="font-bold text-slate-800">{school.name}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase">Hiệu trưởng</span>
              <p className="font-bold text-slate-800">{school.principalName}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase">Địa chỉ</span>
              <p className="font-bold text-slate-800">{school.address}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-slate-400 text-[10px] font-bold uppercase">Hotline liên hệ</span>
              <p className="font-bold text-slate-800">{school.phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
