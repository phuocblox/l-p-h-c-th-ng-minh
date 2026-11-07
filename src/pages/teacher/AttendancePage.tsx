import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { db } from '../../services/db';
import { AttendanceSession, AttendanceStatus, Student } from '../../types';
import {
  CheckSquare,
  Calendar,
  Save,
  CheckCircle2,
  Clock,
  AlertTriangle,
  History,
  FileCheck,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';

export const AttendancePage: React.FC = () => {
  const { user } = useAuth();
  const { success } = useToast();

  const classes = db.getClasses();
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || 'class-9a1');
  const [selectedDate, setSelectedDate] = useState('2026-10-10');
  const [selectedPeriod, setSelectedPeriod] = useState(1);

  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<Record<string, { status: AttendanceStatus; note: string }>>({});
  const [historySessions, setHistorySessions] = useState<AttendanceSession[]>([]);
  const [activeView, setActiveView] = useState<'take' | 'history'>('take');

  useEffect(() => {
    const list = db.getStudents(selectedClassId);
    setStudents(list);

    const existingSession = db.getAttendanceSession(selectedClassId, selectedDate, selectedPeriod);
    const recs: Record<string, { status: AttendanceStatus; note: string }> = {};

    if (existingSession) {
      existingSession.records.forEach(r => {
        recs[r.studentId] = { status: r.status, note: r.note || '' };
      });
    } else {
      list.forEach(s => {
        recs[s.id] = { status: 'present', note: '' };
      });
    }
    setRecords(recs);
    setHistorySessions(db.getAttendanceSessions(selectedClassId));
  }, [selectedClassId, selectedDate, selectedPeriod]);

  const handleMarkAllPresent = () => {
    const updated: Record<string, { status: AttendanceStatus; note: string }> = {};
    students.forEach(s => {
      updated[s.id] = { status: 'present', note: '' };
    });
    setRecords(updated);
    success('Đã đánh dấu tất cả có mặt!');
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleSave = () => {
    const targetClass = classes.find(c => c.id === selectedClassId);
    if (!targetClass) return;

    let present = 0;
    let excused = 0;
    let unexcused = 0;
    let late = 0;

    const recordList = students.map(s => {
      const cur = records[s.id] || { status: 'present', note: '' };
      if (cur.status === 'present') present++;
      else if (cur.status === 'excused') excused++;
      else if (cur.status === 'unexcused') unexcused++;
      else if (cur.status === 'late') late++;

      return {
        id: 'rec-' + s.id + '-' + selectedDate,
        sessionId: 'att-session-' + selectedClassId + '-' + selectedDate + '-' + selectedPeriod,
        studentId: s.id,
        studentName: s.fullName,
        studentCode: s.studentCode,
        status: cur.status,
        note: cur.note,
        updatedAt: new Date().toISOString(),
      };
    });

    const session: AttendanceSession = {
      id: 'att-session-' + selectedClassId + '-' + selectedDate + '-' + selectedPeriod,
      classId: selectedClassId,
      className: targetClass.name,
      date: selectedDate,
      period: selectedPeriod,
      sessionType: selectedPeriod <= 5 ? 'morning' : 'afternoon',
      takenById: user?.id || 'user-teacher-01',
      takenByName: user?.fullName || 'Cô Nguyễn Thu Hà',
      totalStudents: students.length,
      presentCount: present,
      excusedCount: excused,
      unexcusedCount: unexcused,
      lateCount: late,
      records: recordList,
      createdAt: new Date().toISOString(),
    };

    db.saveAttendanceSession(session);
    db.logAction(
      user?.id || 'sys',
      user?.fullName || 'Teacher',
      user?.role,
      'Điểm danh',
      'AttendanceSession',
      session.id,
      `Điểm danh lớp ${targetClass.name} ngày ${selectedDate}: ${present} có mặt`
    );

    success(`Đã lưu điểm danh lớp ${targetClass.name} ngày ${selectedDate}!`);
    setHistorySessions(db.getAttendanceSessions(selectedClassId));
  };

  // Counters
  let pCount = 0;
  let eCount = 0;
  let lCount = 0;
  let uCount = 0;
  Object.values(records).forEach(r => {
    if (r.status === 'present') pCount++;
    else if (r.status === 'excused') eCount++;
    else if (r.status === 'late') lCount++;
    else if (r.status === 'unexcused') uCount++;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Điểm danh Lớp học"
        subtitle="Hệ thống điểm danh 1 chạm, tự động tổng hợp chuyên cần và cảnh báo vắng muộn"
        breadcrumbs={[{ label: 'Điểm danh' }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveView(activeView === 'take' ? 'history' : 'take')}
              className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <History className="w-4 h-4 text-slate-500" />
              <span>{activeView === 'take' ? 'Xem lịch sử điểm danh' : 'Quay lại biểu mẫu'}</span>
            </button>
          </div>
        }
      />

      {activeView === 'take' ? (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Chọn Lớp
                </label>
                <select
                  value={selectedClassId}
                  onChange={e => setSelectedClassId(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>
                      Lớp {c.name} ({c.roomNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Ngày
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Tiết học
                </label>
                <select
                  value={selectedPeriod}
                  onChange={e => setSelectedPeriod(Number(e.target.value))}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value={1}>Tiết 1 (07:15 - 08:00)</option>
                  <option value={2}>Tiết 2 (08:05 - 08:50)</option>
                  <option value={3}>Tiết 3 (09:05 - 09:50)</option>
                  <option value={4}>Tiết 4 (10:00 - 10:45)</option>
                  <option value={5}>Tiết 5 (10:50 - 11:35)</option>
                </select>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleMarkAllPresent}
                  className="px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Đánh dấu tất cả có mặt</span>
                </button>
              </div>
            </div>

            {/* Counters */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                Có mặt: {pCount}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                Phép: {eCount}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200">
                Trễ: {lCount}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
                Không phép: {uCount}
              </span>
            </div>
          </div>

          {/* Student List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="divide-y divide-slate-100">
              {students.map(s => {
                const cur = records[s.id] || { status: 'present', note: '' };
                return (
                  <div
                    key={s.id}
                    className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-center text-xs font-bold text-slate-400">
                        {s.orderNumber}
                      </span>
                      <img
                        src={s.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'}
                        alt={s.fullName}
                        className="w-9 h-9 rounded-full object-cover border"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{s.fullName}</p>
                        <p className="text-[11px] text-slate-500">
                          {s.studentCode} • {s.teamGroup}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(s.id, 'present')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          cur.status === 'present'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        Có mặt
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(s.id, 'excused')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          cur.status === 'excused'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        Có phép
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(s.id, 'late')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          cur.status === 'late'
                            ? 'bg-cyan-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        Đi trễ
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(s.id, 'unexcused')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          cur.status === 'unexcused'
                            ? 'bg-rose-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                      >
                        Không phép
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Sticky Save Bar */}
            <div className="sticky bottom-0 bg-white/95 backdrop-blur-md p-4 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Sĩ số lớp: {students.length} học sinh
              </span>
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Lưu sổ điểm danh</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* History View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Lịch sử các phiên điểm danh</h3>
          <div className="divide-y divide-slate-100">
            {historySessions.map(sess => (
              <div key={sess.id} className="py-3.5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    Lớp {sess.className} • Ngày {sess.date} (Tiết {sess.period})
                  </p>
                  <p className="text-[11px] text-slate-500">Người điểm danh: {sess.takenByName}</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                    Có mặt: {sess.presentCount}
                  </span>
                  <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md">
                    Phép: {sess.excusedCount}
                  </span>
                  <span className="text-cyan-700 font-semibold bg-cyan-50 px-2 py-0.5 rounded-md">
                    Trễ: {sess.lateCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
