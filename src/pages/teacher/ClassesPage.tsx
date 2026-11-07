import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { db } from '../../services/db';
import { Classroom } from '../../types';
import {
  Plus,
  Search,
  LayoutGrid,
  List,
  GraduationCap,
  Users,
  Copy,
  QrCode,
  Archive,
  Trash2,
  ExternalLink,
  MoreVertical,
  Check,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';

export const ClassesPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [classes, setClasses] = useState<Classroom[]>([]);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [selectedClassForQr, setSelectedClassForQr] = useState<Classroom | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Delete & Archive
  const [deleteTarget, setDeleteTarget] = useState<Classroom | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formRoom, setFormRoom] = useState('');
  const [formGrade, setFormGrade] = useState('gl-9');
  const [formColor, setFormColor] = useState('#2563EB');
  const [formDesc, setFormDesc] = useState('');

  const gradeLevels = db.getGradeLevels();

  const refreshClasses = () => {
    setClasses(db.getClasses());
  };

  useEffect(() => {
    refreshClasses();
    if (searchParams.get('create') === 'true') {
      setIsCreateOpen(true);
    }
  }, [searchParams]);

  // Filtered classes
  const filteredClasses = classes.filter(c => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.roomNumber && c.roomNumber.toLowerCase().includes(search.toLowerCase())) ||
      (c.code && c.code.toLowerCase().includes(search.toLowerCase()));

    const matchGrade = gradeFilter === 'ALL' || c.gradeLevelId === gradeFilter;
    return matchSearch && matchGrade;
  });

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      error('Vui lòng nhập tên lớp học!');
      return;
    }

    const newCode = 'CVA-' + formName.toUpperCase().replace(/\s+/g, '') + '-' + Math.floor(100 + Math.random() * 900);

    const created = db.createClass({
      schoolId: 'school-01',
      academicYearId: 'ay-2026-2027',
      gradeLevelId: formGrade,
      name: formName.trim(),
      code: newCode,
      roomNumber: formRoom.trim() || 'P.Chưa xếp',
      homeroomTeacherId: user?.id || 'user-teacher-01',
      homeroomTeacherName: user?.fullName || 'Cô Nguyễn Thu Hà',
      description: formDesc.trim() || `Lớp học môn Toán khối ${formGrade === 'gl-9' ? 9 : 8}`,
      color: formColor,
      isArchived: false,
    });

    db.logAction(user?.id || 'sys', user?.fullName || 'Teacher', user?.role, 'Tạo lớp học', 'Classroom', created.id, `Tạo mới lớp ${created.name}`);

    success(`Đã tạo lớp ${created.name} thành công!`);
    setIsCreateOpen(false);
    setFormName('');
    setFormRoom('');
    setFormDesc('');
    refreshClasses();
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    success(`Đã sao chép mã tham gia: ${code}`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleDeleteClass = () => {
    if (!deleteTarget) return;
    db.deleteClass(deleteTarget.id);
    db.logAction(user?.id || 'sys', user?.fullName || 'Teacher', user?.role, 'Xóa lớp', 'Classroom', deleteTarget.id, `Xóa lớp ${deleteTarget.name}`);
    success(`Đã xóa lớp ${deleteTarget.name}`);
    setDeleteTarget(null);
    refreshClasses();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Quản lý Lớp học"
        subtitle="Không gian quản lý các lớp phụ trách giảng dạy và chủ nhiệm trong năm học 2026 - 2027"
        breadcrumbs={[{ label: 'Lớp học' }]}
        actions={
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo lớp học mới</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm kiếm lớp học theo tên, phòng..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Grade filter */}
          <select
            value={gradeFilter}
            onChange={e => setGradeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Tất cả các khối</option>
            {gradeLevels.map(gl => (
              <option key={gl.id} value={gl.id}>
                {gl.name}
              </option>
            ))}
          </select>

          {/* View switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-slate-600 transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-2xs text-blue-600 font-bold' : ''
              }`}
              title="Dạng lưới thẻ"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-slate-600 transition-colors ${
                viewMode === 'list' ? 'bg-white shadow-2xs text-blue-600 font-bold' : ''
              }`}
              title="Dạng danh sách"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Classes Grid or List */}
      {filteredClasses.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Chưa tìm thấy lớp học nào"
          description="Không có lớp nào phù hợp với bộ lọc tìm kiếm của bạn. Hãy tạo lớp mới hoặc đổi từ khóa."
          action={{
            label: 'Tạo lớp học mới',
            onClick: () => setIsCreateOpen(true),
          }}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClasses.map(cls => (
            <div
              key={cls.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden group"
            >
              {/* Card Header Color Ribbon */}
              <div
                className="h-28 p-5 flex flex-col justify-between text-white relative"
                style={{ backgroundColor: cls.color || '#2563EB' }}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-black/20 backdrop-blur-md text-[11px] font-semibold tracking-wide">
                    {cls.roomNumber}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedClassForQr(cls);
                        setIsQrOpen(true);
                      }}
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors"
                      title="Mã QR tham gia lớp"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(cls)}
                      className="p-1.5 rounded-lg bg-white/20 hover:bg-rose-600 text-white transition-colors"
                      title="Xóa lớp"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-black tracking-tight">{cls.name}</h3>
                  <p className="text-xs text-white/80 line-clamp-1">{cls.description}</p>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Giáo viên chủ nhiệm:</span>
                    <span className="font-semibold text-slate-800">{cls.homeroomTeacherName}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Sĩ số lớp:</span>
                    <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                      {cls.studentCount || 12} học sinh
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Mã tham gia:</span>
                    <button
                      onClick={() => handleCopyCode(cls.code)}
                      className="flex items-center gap-1.5 font-mono font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors"
                      title="Nhấn để sao chép"
                    >
                      <span>{cls.code}</span>
                      {copiedCode === cls.code ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Footer action button */}
                <div className="pt-3 border-t border-slate-100">
                  <button
                    onClick={() => navigate(`/teacher/classes/${cls.id}`)}
                    className="w-full py-2.5 px-3 bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer group-hover:bg-blue-600 group-hover:text-white"
                  >
                    <span>Vào không gian lớp học</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-4">Tên lớp</th>
                  <th className="p-4">Phòng học</th>
                  <th className="p-4">Sĩ số</th>
                  <th className="p-4">Giáo viên</th>
                  <th className="p-4">Mã vào lớp</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredClasses.map(cls => (
                  <tr key={cls.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-3 h-8 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cls.color || '#2563EB' }}
                        />
                        <div>
                          <p className="font-bold text-sm text-slate-900">{cls.name}</p>
                          <p className="text-[11px] text-slate-500">{cls.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-700">{cls.roomNumber}</td>
                    <td className="p-4 font-bold text-slate-800">{cls.studentCount || 12} HS</td>
                    <td className="p-4 text-slate-600">{cls.homeroomTeacherName}</td>
                    <td className="p-4 font-mono font-bold text-blue-600">{cls.code}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => navigate(`/teacher/classes/${cls.id}`)}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg font-semibold text-xs transition-colors"
                      >
                        Vào lớp
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Class Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Tạo lớp học mới">
        <form onSubmit={handleCreateClass} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tên lớp học <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formName}
              onChange={e => setFormName(e.target.value)}
              placeholder="VD: 9A3, 8A1, Chuyên Toán 9"
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Khối học</label>
              <select
                value={formGrade}
                onChange={e => setFormGrade(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              >
                {gradeLevels.map(gl => (
                  <option key={gl.id} value={gl.id}>
                    {gl.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phòng học</label>
              <input
                type="text"
                value={formRoom}
                onChange={e => setFormRoom(e.target.value)}
                placeholder="VD: P.305 Nhà A"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Màu sắc nhận diện lớp</label>
            <div className="flex items-center gap-2.5">
              {['#2563EB', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'].map(color => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setFormColor(color)}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                    formColor === color ? 'ring-3 ring-offset-2 ring-slate-800 scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả lớp học</label>
            <textarea
              rows={2}
              value={formDesc}
              onChange={e => setFormDesc(e.target.value)}
              placeholder="Ghi chú về mục tiêu học tập hoặc quy định lớp..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-xs"
            >
              Lưu & Tạo lớp
            </button>
          </div>
        </form>
      </Modal>

      {/* QR Code Modal */}
      {selectedClassForQr && (
        <Modal
          isOpen={isQrOpen}
          onClose={() => setIsQrOpen(false)}
          title={`Mã tham gia lớp ${selectedClassForQr.name}`}
          maxWidth="sm"
        >
          <div className="flex flex-col items-center text-center p-3">
            <div className="p-4 bg-white border-2 border-slate-900 rounded-2xl shadow-md mb-4">
              {/* Clean SVG QR Code Representation */}
              <svg className="w-44 h-44" viewBox="0 0 100 100">
                <rect x="0" y="0" width="100" height="100" fill="#ffffff" />
                <rect x="10" y="10" width="25" height="25" fill="#0f172a" />
                <rect x="15" y="15" width="15" height="15" fill="#ffffff" />
                <rect x="18" y="18" width="9" height="9" fill="#0f172a" />
                <rect x="65" y="10" width="25" height="25" fill="#0f172a" />
                <rect x="70" y="15" width="15" height="15" fill="#ffffff" />
                <rect x="73" y="18" width="9" height="9" fill="#0f172a" />
                <rect x="10" y="65" width="25" height="25" fill="#0f172a" />
                <rect x="15" y="70" width="15" height="15" fill="#ffffff" />
                <rect x="18" y="73" width="9" height="9" fill="#0f172a" />
                {/* Random QR pixels */}
                <rect x="40" y="15" width="8" height="8" fill="#0f172a" />
                <rect x="52" y="25" width="8" height="8" fill="#0f172a" />
                <rect x="45" y="45" width="10" height="10" fill="#2563eb" />
                <rect x="65" y="45" width="8" height="8" fill="#0f172a" />
                <rect x="40" y="65" width="8" height="8" fill="#0f172a" />
                <rect x="55" y="75" width="12" height="8" fill="#0f172a" />
                <rect x="75" y="65" width="10" height="10" fill="#0f172a" />
              </svg>
            </div>
            <p className="text-xs text-slate-500 mb-1">Mã lớp để học sinh/phụ huynh nhập:</p>
            <span className="font-mono text-xl font-black text-blue-700 bg-blue-50 px-4 py-1 rounded-xl border border-blue-200">
              {selectedClassForQr.code}
            </span>
            <p className="text-[11px] text-slate-400 mt-3">
              Chiếu lên bảng hoặc máy chiếu để học sinh quét mã trực tiếp trên điện thoại.
            </p>
          </div>
        </Modal>
      )}

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteClass}
        title="Xóa lớp học"
        message={`Bạn có chắc muốn xóa lớp ${deleteTarget?.name}? Thao tác này sẽ xóa các liên kết điểm và thời khóa biểu của lớp.`}
        confirmText="Xác nhận xóa"
      />
    </div>
  );
};
