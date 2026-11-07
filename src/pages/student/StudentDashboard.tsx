import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { db } from '../../services/db';
import {
  Calendar,
  FileText,
  BarChart2,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Send,
  Upload,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';
import { StatusChip } from '../../components/common/StatusChip';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { success } = useToast();

  const student = db.getStudents().find(s => s.id === 'std-01') || db.getStudents()[0];
  const assignments = db.getAssignments('class-9a1');
  const schedules = db.getSchedules('class-9a1');
  const announcements = db.getAnnouncements();

  // Submit Assignment Modal
  const [submitModalAsg, setSubmitModalAsg] = useState<any | null>(null);
  const [submissionText, setSubmissionText] = useState('');

  const handleSubmitHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submitModalAsg) return;

    db.submitAssignment({
      assignmentId: submitModalAsg.id,
      studentId: student.id,
      studentName: student.fullName,
      studentCode: student.studentCode,
      content: submissionText,
    });

    success(`Đã nộp bài "${submitModalAsg.title}" thành công cho cô giáo!`);
    setSubmitModalAsg(null);
    setSubmissionText('');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-teal-500/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider">
              Cổng Học Sinh • Lớp 9A1
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-2">
              Chào {student?.fullName || 'Lê Hoàng Long'}! 🚀
            </h1>
            <p className="text-xs sm:text-sm text-teal-100 mt-1">
              Hôm nay em có 2 tiết học. Đừng quên nộp bài tập Vi-ét trước 22h tối nhé!
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center">
            <span className="text-[11px] text-teal-100 uppercase font-bold">Điểm thi đua cá nhân</span>
            <p className="text-2xl font-black text-amber-300 mt-0.5">+{student?.rewardPoints || 45} pts</p>
          </div>
        </div>
      </div>

      {/* Quick KPI stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Điểm TB Hiện tại</span>
          <h3 className="text-2xl font-bold text-blue-600 mt-1">{student?.gpa || 8.8}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Học lực Giỏi</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Chuyên cần</span>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">100%</h3>
          <p className="text-[11px] text-slate-500 mt-1">Đầy đủ các buổi học</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Bài tập cần làm</span>
          <h3 className="text-2xl font-bold text-amber-600 mt-1">{assignments.length} bài</h3>
          <p className="text-[11px] text-slate-500 mt-1">Hạn nộp tuần này</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Tổ thi đua</span>
          <h3 className="text-2xl font-bold text-purple-600 mt-1">{student?.teamGroup || 'Tổ 1'}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Xếp hạng #1 cả lớp</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Assignments to do (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">Bài tập về nhà đang giao</h3>
            <div className="space-y-3">
              {assignments.map(asg => (
                <div key={asg.id} className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {asg.subjectName}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{asg.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{asg.description}</p>
                    </div>
                    <button
                      onClick={() => setSubmitModalAsg(asg)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Nộp bài ngay
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-3 mt-3 border-t border-slate-100 text-slate-500">
                    <span>GV giao: {asg.teacherName}</span>
                    <span className="font-semibold text-rose-600">
                      Hạn: {new Date(asg.dueDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right announcements (4 cols) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Thông báo từ nhà trường & cô giáo</h3>
          <div className="space-y-3">
            {announcements.map(anc => (
              <div key={anc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                <p className="font-bold text-slate-800">{anc.title}</p>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{anc.content}</p>
                <span className="text-[10px] text-blue-600 font-semibold mt-1 block">
                  Người gửi: {anc.authorName}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submit Homework Modal */}
      {submitModalAsg && (
        <Modal
          isOpen={!!submitModalAsg}
          onClose={() => setSubmitModalAsg(null)}
          title={`Nộp bài: ${submitModalAsg.title}`}
        >
          <form onSubmit={handleSubmitHomework} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lời nhắn / Lời giải của em
              </label>
              <textarea
                rows={4}
                required
                value={submissionText}
                onChange={e => setSubmissionText(e.target.value)}
                placeholder="Thưa cô em xin nộp bài giải các câu 1, 2, 3, 4, 5 trong phiếu..."
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl text-center bg-slate-50">
              <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <p className="text-xs font-medium text-slate-600">Kéo thả ảnh bài làm hoặc tài liệu đính kèm</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSubmitModalAsg(null)}
                className="px-4 py-2 border rounded-xl text-xs font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
              >
                Nộp bài cho cô
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
