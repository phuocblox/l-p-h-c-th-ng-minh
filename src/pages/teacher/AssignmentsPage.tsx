import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { db } from '../../services/db';
import { Assignment, Submission } from '../../types';
import {
  FileText,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Check,
  Send,
  Download,
  Users,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { StatusChip } from '../../components/common/StatusChip';

export const AssignmentsPage: React.FC = () => {
  const { user } = useAuth();
  const { success } = useToast();

  const [assignments, setAssignments] = useState<Assignment[]>(db.getAssignments());
  const classes = db.getClasses();

  const [selectedClassId, setSelectedClassId] = useState('ALL');
  const [search, setSearch] = useState('');

  // Grading Drawer/Modal
  const [gradingAssignment, setGradingAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(10);
  const [gradeFeedback, setGradeFeedback] = useState('');

  // Create Assignment Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formClassId, setFormClassId] = useState('class-9a1');
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formDue, setFormDue] = useState('2026-10-18T22:00');

  const filtered = assignments.filter(a => {
    const matchClass = selectedClassId === 'ALL' || a.classId === selectedClassId;
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase());
    return matchClass && matchSearch;
  });

  const handleOpenGrading = (asg: Assignment) => {
    setGradingAssignment(asg);
    const subs = db.getSubmissions(asg.id);
    setSubmissions(subs);
    if (subs.length > 0) {
      setSelectedSubmission(subs[0]);
      setGradeScore(subs[0].score || 9);
      setGradeFeedback(subs[0].feedback || 'Làm bài tốt!');
    } else {
      setSelectedSubmission(null);
    }
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission || !user) return;

    db.gradeSubmission(selectedSubmission.id, gradeScore, gradeFeedback, user.id);
    success(`Đã chấm điểm ${gradeScore} cho học sinh ${selectedSubmission.studentName}!`);

    // refresh submissions
    if (gradingAssignment) {
      const updatedSubs = db.getSubmissions(gradingAssignment.id);
      setSubmissions(updatedSubs);
      setAssignments(db.getAssignments());
    }
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClass = classes.find(c => c.id === formClassId);
    if (!targetClass || !formTitle.trim()) return;

    const created = db.createAssignment({
      classId: targetClass.id,
      className: targetClass.name,
      subjectId: 'sub-math',
      subjectName: 'Toán học',
      title: formTitle.trim(),
      description: formDesc.trim() || 'Làm hoàn chỉnh các bài tập theo đề cương.',
      teacherId: user?.id || 'user-teacher-01',
      teacherName: user?.fullName || 'Cô Nguyễn Thu Hà',
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: formDue,
      maxScore: 10,
      status: 'ACTIVE',
      submittedCount: 0,
      totalStudents: targetClass.studentCount || 12,
      gradedCount: 0,
    });

    success(`Đã tạo và giao bài tập "${created.title}" thành công!`);
    setIsCreateOpen(false);
    setFormTitle('');
    setFormDesc('');
    setAssignments(db.getAssignments());
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Quản lý Bài tập & Chấm điểm"
        subtitle="Giao bài tập trực tuyến, theo dõi tiến độ nộp bài và chấm điểm kèm nhận xét chi tiết"
        breadcrumbs={[{ label: 'Bài tập' }]}
        actions={
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Giao bài tập mới</span>
          </button>
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
            placeholder="Tìm theo tiêu đề bài tập..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Lớp:</span>
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Tất cả các lớp</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                Lớp {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(asg => (
          <div
            key={asg.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
                  Lớp {asg.className} • {asg.subjectName}
                </span>
                <StatusChip
                  label={asg.status === 'ACTIVE' ? 'Đang giao' : 'Đã đóng'}
                  variant={asg.status === 'ACTIVE' ? 'success' : 'neutral'}
                  size="sm"
                />
              </div>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">{asg.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2">{asg.description}</p>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Hạn nộp:</span>
                <span className="font-semibold text-slate-800">
                  {new Date(asg.dueDate).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tiến độ nộp bài:</span>
                <span className="font-bold text-blue-600">
                  {asg.submittedCount || 0} / {asg.totalStudents || 12} học sinh
                </span>
              </div>

              <button
                onClick={() => handleOpenGrading(asg)}
                className="w-full py-2.5 bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Xem bài nộp & Chấm bài</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* GRADING MODAL / DRAWER */}
      {gradingAssignment && (
        <Modal
          isOpen={!!gradingAssignment}
          onClose={() => setGradingAssignment(null)}
          title={`Chấm bài: ${gradingAssignment.title}`}
          maxWidth="2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Submissions List (5 cols) */}
            <div className="md:col-span-5 border-r border-slate-100 pr-3 space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Danh sách bài đã nộp ({submissions.length})
              </h4>
              {submissions.length === 0 ? (
                <p className="text-xs text-slate-400 py-4">Chưa có học sinh nào nộp bài.</p>
              ) : (
                submissions.map(sub => (
                  <div
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubmission(sub);
                      setGradeScore(sub.score || 9);
                      setGradeFeedback(sub.feedback || '');
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedSubmission?.id === sub.id
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{sub.studentName}</span>
                      {sub.score !== undefined ? (
                        <span className="text-xs font-black text-emerald-600">{sub.score} đ</span>
                      ) : (
                        <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
                          Chưa chấm
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Nộp lúc: {new Date(sub.submittedAt).toLocaleTimeString('vi-VN')}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Grading Form (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              {selectedSubmission ? (
                <form onSubmit={handleSaveGrade} className="space-y-4">
                  <div className="p-3 bg-slate-50 rounded-xl border text-xs space-y-1">
                    <p className="font-bold text-slate-800">
                      Bài làm của: {selectedSubmission.studentName} ({selectedSubmission.studentCode})
                    </p>
                    <p className="text-slate-600 italic">"{selectedSubmission.content}"</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Điểm số (Thang điểm 10)
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      max="10"
                      required
                      value={gradeScore}
                      onChange={e => setGradeScore(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl font-bold text-blue-700 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Lời nhận xét & Góp ý
                    </label>
                    <textarea
                      rows={3}
                      value={gradeFeedback}
                      onChange={e => setGradeFeedback(e.target.value)}
                      placeholder="Nhận xét ưu điểm và lỗi sai cần khắc phục..."
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    Lưu điểm & Trả bài cho học sinh
                  </button>
                </form>
              ) : (
                <p className="text-xs text-slate-400 py-6 text-center">
                  Chọn một bài nộp ở cột bên trái để chấm điểm.
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* CREATE ASSIGNMENT MODAL */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Giao bài tập mới">
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Chọn lớp học</label>
            <select
              value={formClassId}
              onChange={e => setFormClassId(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  Lớp {c.name} ({c.roomNumber})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tiêu đề bài tập <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              placeholder="VD: Phiếu bài tập chuyên đề Vi-ét số 2"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Hạn nộp</label>
            <input
              type="datetime-local"
              value={formDue}
              onChange={e => setFormDue(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả / Hướng dẫn</label>
            <textarea
              rows={3}
              value={formDesc}
              onChange={e => setFormDesc(e.target.value)}
              placeholder="Yêu cầu cụ thể, cách trình bày hoặc link tài liệu đính kèm..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
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
              Giao bài ngay
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
