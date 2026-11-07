import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { db } from '../../services/db';
import { Student } from '../../types';
import {
  Users,
  Search,
  Plus,
  Upload,
  Download,
  Filter,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  X,
  Phone,
  Mail,
  MapPin,
  Award,
  BookOpen,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { StatusChip } from '../../components/common/StatusChip';

export const StudentsPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error, warning } = useToast();
  const navigate = useNavigate();

  const [students, setStudents] = useState<Student[]>(db.getStudents());
  const classes = db.getClasses();

  const [search, setSearch] = useState('');
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');

  // 360 Profile Modal
  const [activeProfileStudent, setActiveProfileStudent] = useState<Student | null>(null);
  const [profileTab, setProfileTab] = useState<'overview' | 'grades' | 'attendance' | 'behavior'>('overview');

  // Excel Import Wizard Modal
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importStep, setImportStep] = useState<1 | 2 | 3>(1);
  const [importPreviewData, setImportPreviewData] = useState<any[]>([]);

  const filteredStudents = students.filter(s => {
    const matchClass = selectedClassId === 'ALL' || s.currentClassId === selectedClassId;
    const matchSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(search.toLowerCase()) ||
      (s.phone && s.phone.includes(search));
    return matchClass && matchSearch;
  });

  // Mock template file download
  const handleDownloadTemplate = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Mã HS,Họ và tên,Ngày sinh,Giới tính,Lớp,Tổ,SĐT Phụ huynh,Họ tên phụ huynh\n' +
      'HS-9A1-13,Nguyễn Trọng Tấn,2012-07-11,Nam,9A1,Tổ 1,0912333444,Nguyễn Trọng Hùng\n' +
      'HS-9A1-14,Lê Thu Trang,2012-09-19,Nữ,9A1,Tổ 2,0915888999,Lê Văn Tuấn\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Mau_danh_sach_hoc_sinh_SmartClass.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    success('Đã tải xuống file mẫu Excel/CSV!');
  };

  // Mock upload step
  const handleFileUploaded = () => {
    // Generate realistic parsed rows
    const mockParsed = [
      { code: 'HS-9A1-13', name: 'Nguyễn Trọng Tấn', dob: '2012-07-11', gender: 'Nam', team: 'Tổ 1', parent: 'Nguyễn Trọng Hùng', phone: '0912333444', valid: true },
      { code: 'HS-9A1-14', name: 'Lê Thu Trang', dob: '2012-09-19', gender: 'Nữ', team: 'Tổ 2', parent: 'Lê Văn Tuấn', phone: '0915888999', valid: true },
      { code: 'HS-9A1-15', name: 'Trần Văn Hoàng', dob: '2012-11-02', gender: 'Nam', team: 'Tổ 3', parent: 'Trần Văn Long', phone: '0988777666', valid: true },
    ];
    setImportPreviewData(mockParsed);
    setImportStep(2);
  };

  // Confirm Import
  const handleConfirmImport = () => {
    const toAdd = importPreviewData.map((row, idx) => ({
      schoolId: 'school-01',
      studentCode: row.code,
      fullName: row.name,
      dateOfBirth: row.dob,
      gender: row.gender as 'Nam' | 'Nữ',
      currentClassId: 'class-9a1',
      className: '9A1',
      orderNumber: students.length + idx + 1,
      teamGroup: row.team,
      parentName: row.parent,
      parentPhone: row.phone,
      status: 'Đang học' as const,
      conduct: 'Tốt' as const,
      gpa: 8.2,
      rewardPoints: 10,
    }));

    db.bulkAddStudents(toAdd);
    setStudents(db.getStudents());
    success(`Đã import thành công ${toAdd.length} học sinh vào lớp 9A1!`);
    setIsImportOpen(false);
    setImportStep(1);
    setImportPreviewData([]);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Hồ sơ Học sinh 360°"
        subtitle="Quản lý toàn diện dữ liệu nhân khẩu, học tập, chuyên cần và nhận xét của từng học sinh"
        breadcrumbs={[{ label: 'Học sinh' }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Tải file mẫu Excel</span>
            </button>
            <button
              onClick={() => setIsImportOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Import Excel</span>
            </button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên học sinh, mã HS, SĐT..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Lớp:</span>
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Tất cả các lớp ({students.length} HS)</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                Lớp {c.name} ({c.studentCount || 12} HS)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5 w-12 text-center">STT</th>
                <th className="p-3.5">Học sinh</th>
                <th className="p-3.5">Mã HS</th>
                <th className="p-3.5">Lớp</th>
                <th className="p-3.5">Tổ</th>
                <th className="p-3.5">Phụ huynh liên kết</th>
                <th className="p-3.5">Điểm TB</th>
                <th className="p-3.5">Hạnh kiểm</th>
                <th className="p-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5 text-center font-bold text-slate-400">{s.orderNumber}</td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={s.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'}
                        alt={s.fullName}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <p
                          className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                          onClick={() => {
                            setActiveProfileStudent(s);
                            setProfileTab('overview');
                          }}
                        >
                          {s.fullName}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {s.gender} • Sinh ngày: {new Date(s.dateOfBirth).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono font-medium text-slate-700">{s.studentCode}</td>
                  <td className="p-3.5 font-bold text-blue-700">{s.className || '9A1'}</td>
                  <td className="p-3.5 text-slate-600">{s.teamGroup || 'Tổ 1'}</td>
                  <td className="p-3.5">
                    <p className="font-semibold text-slate-800">{s.parentName || 'Chưa liên kết'}</p>
                    <p className="text-[10px] text-slate-500">{s.parentPhone || s.phone || '0903888999'}</p>
                  </td>
                  <td className="p-3.5 font-black text-emerald-600">{s.gpa || 8.5}</td>
                  <td className="p-3.5">
                    <StatusChip label={s.conduct || 'Tốt'} variant="success" size="sm" />
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => {
                        setActiveProfileStudent(s);
                        setProfileTab('overview');
                      }}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Hồ sơ 360°
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* STUDENT 360° PROFILE MODAL */}
      {activeProfileStudent && (
        <Modal
          isOpen={!!activeProfileStudent}
          onClose={() => setActiveProfileStudent(null)}
          title={`Hồ sơ 360°: ${activeProfileStudent.fullName} (${activeProfileStudent.studentCode})`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            {/* Header info */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <img
                src={activeProfileStudent.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'}
                alt={activeProfileStudent.fullName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-xs"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900">{activeProfileStudent.fullName}</h3>
                  <StatusChip label={activeProfileStudent.status} variant="success" size="sm" />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lớp {activeProfileStudent.className} • {activeProfileStudent.teamGroup} • STT: {activeProfileStudent.orderNumber}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-600">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {activeProfileStudent.parentPhone || '0903 888 999'} (Phụ huynh)
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {activeProfileStudent.address || 'Hà Nội'}
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Tabs */}
            <div className="flex border-b border-slate-200 space-x-4 text-xs font-semibold">
              <button
                onClick={() => setProfileTab('overview')}
                className={`pb-2 border-b-2 cursor-pointer ${
                  profileTab === 'overview' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'
                }`}
              >
                Tổng quan & Điểm số
              </button>
              <button
                onClick={() => setProfileTab('attendance')}
                className={`pb-2 border-b-2 cursor-pointer ${
                  profileTab === 'attendance' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'
                }`}
              >
                Chuyên cần
              </button>
              <button
                onClick={() => setProfileTab('behavior')}
                className={`pb-2 border-b-2 cursor-pointer ${
                  profileTab === 'behavior' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500'
                }`}
              >
                Hành vi & Thi đua
              </button>
            </div>

            {/* Profile Tab Contents */}
            {profileTab === 'overview' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                    <span className="text-slate-500 text-[11px]">GPA Học kỳ I</span>
                    <p className="text-xl font-bold text-blue-700 mt-0.5">{activeProfileStudent.gpa} / 10</p>
                  </div>
                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100">
                    <span className="text-slate-500 text-[11px]">Chuyên cần</span>
                    <p className="text-xl font-bold text-emerald-700 mt-0.5">98%</p>
                  </div>
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                    <span className="text-slate-500 text-[11px]">Điểm thi đua</span>
                    <p className="text-xl font-bold text-amber-700 mt-0.5">+{activeProfileStudent.rewardPoints || 45} pts</p>
                  </div>
                </div>

                <div className="p-3 border rounded-xl space-y-2">
                  <span className="font-bold text-slate-800">Nhận xét của Giáo viên chủ nhiệm:</span>
                  <p className="text-slate-600 leading-relaxed">
                    Em {activeProfileStudent.fullName} có thái độ học tập rất nghiêm túc, tích cực đóng góp xây dựng bài trong các giờ học Toán. Cần tiếp tục phát huy khả năng tư duy logic và giúp đỡ bạn cùng tổ.
                  </p>
                </div>
              </div>
            )}

            {profileTab === 'attendance' && (
              <div className="space-y-2 text-xs">
                <p className="text-slate-600">Lịch sử điểm danh 30 ngày gần nhất:</p>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex justify-between">
                    <span>Số buổi có mặt:</span>
                    <span className="font-bold text-emerald-600">22 buổi</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Số buổi xin phép:</span>
                    <span className="font-bold text-amber-600">1 buổi (Sốt nhẹ)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Đi muộn:</span>
                    <span className="font-bold text-cyan-600">0 lần</span>
                  </div>
                </div>
              </div>
            )}

            {profileTab === 'behavior' && (
              <div className="space-y-2 text-xs">
                <p className="text-slate-600">Ghi nhận hành vi & thành tích:</p>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <p className="font-bold text-emerald-800">+5 điểm: Hăng hái phát biểu</p>
                  <p className="text-emerald-700 text-[11px]">Xung phong giải bài tập khó trên bảng tiết 1.</p>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* EXCEL IMPORT WIZARD MODAL */}
      <Modal isOpen={isImportOpen} onClose={() => setIsImportOpen(false)} title="Import danh sách học sinh từ Excel" maxWidth="lg">
        <div className="space-y-4">
          {/* Step breadcrumbs */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b pb-2">
            <span className={importStep === 1 ? 'text-blue-600' : ''}>1. Chọn file</span>
            <span>→</span>
            <span className={importStep === 2 ? 'text-blue-600' : ''}>2. Xem trước & Xác thực</span>
            <span>→</span>
            <span className={importStep === 3 ? 'text-blue-600' : ''}>3. Hoàn tất</span>
          </div>

          {importStep === 1 && (
            <div className="py-6 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50/50 text-center">
              <FileSpreadsheet className="w-12 h-12 text-blue-600 mb-3" />
              <p className="text-sm font-bold text-slate-800">Tải lên file danh sách lớp (.xlsx hoặc .csv)</p>
              <p className="text-xs text-slate-500 mt-1 mb-4">Hỗ trợ các cột: Mã HS, Họ và tên, Ngày sinh, Giới tính, Tổ, Phụ huynh, SĐT</p>
              <button
                type="button"
                onClick={handleFileUploaded}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-xs cursor-pointer"
              >
                Chọn file mẫu để tiếp tục
              </button>
            </div>
          )}

          {importStep === 2 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Dữ liệu hợp lệ ({importPreviewData.length} dòng):</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 0 dòng lỗi
                </span>
              </div>

              <div className="max-h-60 overflow-y-auto border rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 font-bold border-b">
                    <tr>
                      <th className="p-2">Mã HS</th>
                      <th className="p-2">Họ tên</th>
                      <th className="p-2">Tổ</th>
                      <th className="p-2">Phụ huynh</th>
                      <th className="p-2">SĐT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {importPreviewData.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-2 font-mono font-medium">{r.code}</td>
                        <td className="p-2 font-bold">{r.name}</td>
                        <td className="p-2">{r.team}</td>
                        <td className="p-2">{r.parent}</td>
                        <td className="p-2">{r.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setImportStep(1)}
                  className="px-3 py-1.5 border rounded-xl text-xs font-medium hover:bg-slate-50"
                >
                  Chọn file khác
                </button>
                <button
                  onClick={handleConfirmImport}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Xác nhận lưu vào lớp 9A1
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
