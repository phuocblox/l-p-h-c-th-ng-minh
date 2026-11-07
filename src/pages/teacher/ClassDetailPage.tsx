import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { db } from '../../services/db';
import {
  Classroom,
  Student,
  AttendanceSession,
  AttendanceStatus,
  Assignment,
  GradeItem,
  StudentGrade,
  TeamGroup,
  ScheduleItem,
} from '../../types';
import {
  Users,
  CheckSquare,
  FileText,
  BarChart2,
  Award,
  Calendar,
  Layers,
  TrendingUp,
  Plus,
  Save,
  CheckCircle2,
  Clock,
  AlertTriangle,
  QrCode,
  Copy,
  ChevronLeft,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Tabs } from '../../components/common/Tabs';
import { Modal } from '../../components/common/Modal';
import { StatusChip } from '../../components/common/StatusChip';
import { SearchBox } from '../../components/common/SearchBox';

export const ClassDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { success, warning, error } = useToast();
  const navigate = useNavigate();

  const activeTab = searchParams.get('tab') || 'overview';

  const [cls, setCls] = useState<Classroom | undefined>(undefined);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [gradeItems, setGradeItems] = useState<GradeItem[]>([]);
  const [studentGrades, setStudentGrades] = useState<StudentGrade[]>([]);
  const [teamGroups, setTeamGroups] = useState<TeamGroup[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  // Attendance State
  const [attDate, setAttDate] = useState('2026-10-10');
  const [attPeriod, setAttPeriod] = useState(1);
  const [attRecords, setAttRecords] = useState<Record<string, { status: AttendanceStatus; note: string }>>({});
  const [isAttDirty, setIsAttDirty] = useState(false);

  // Add student modal
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [newStdName, setNewStdName] = useState('');
  const [newStdCode, setNewStdCode] = useState('');
  const [newStdGender, setNewStdGender] = useState<'Nam' | 'Nữ'>('Nam');
  const [newStdTeam, setNewStdTeam] = useState('Tổ 1');
  const [newStdPhone, setNewStdPhone] = useState('');
  const [newStdParentName, setNewStdParentName] = useState('');

  // Create Assignment modal
  const [isCreateAsgOpen, setIsCreateAsgOpen] = useState(false);
  const [asgTitle, setAsgTitle] = useState('');
  const [asgDesc, setAsgDesc] = useState('');
  const [asgDueDate, setAsgDueDate] = useState('2026-10-15T22:00');

  // Search in student roster
  const [studentSearch, setStudentSearch] = useState('');

  useEffect(() => {
    if (!id) return;
    const foundClass = db.getClassById(id);
    if (!foundClass) {
      error('Không tìm thấy lớp học!');
      navigate('/teacher/classes');
      return;
    }
    setCls(foundClass);

    const stdList = db.getStudents(id);
    setStudents(stdList);

    setAssignments(db.getAssignments(id));
    setGradeItems(db.getGradeItems(id));
    setStudentGrades(db.getStudentGrades(id));
    setTeamGroups(db.getTeamGroups(id));
    setSchedules(db.getSchedules(id));

    // Initialize attendance session
    const existingSession = db.getAttendanceSession(id, attDate, attPeriod);
    const initialRecords: Record<string, { status: AttendanceStatus; note: string }> = {};

    if (existingSession) {
      existingSession.records.forEach(r => {
        initialRecords[r.studentId] = { status: r.status, note: r.note || '' };
      });
    } else {
      stdList.forEach(s => {
        initialRecords[s.id] = { status: 'present', note: '' };
      });
    }
    setAttRecords(initialRecords);
    setIsAttDirty(false);
  }, [id, attDate, attPeriod]);

  const handleTabChange = (newTab: string) => {
    setSearchParams({ tab: newTab });
  };

  // Mark all present
  const handleMarkAllPresent = () => {
    const updated: Record<string, { status: AttendanceStatus; note: string }> = {};
    students.forEach(s => {
      updated[s.id] = { status: 'present', note: '' };
    });
    setAttRecords(updated);
    setIsAttDirty(true);
    success('Đã đánh dấu tất cả có mặt!');
  };

  // Change individual attendance
  const handleAttendanceChange = (studentId: string, status: AttendanceStatus) => {
    setAttRecords(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
    setIsAttDirty(true);
  };

  // Save Attendance Session
  const handleSaveAttendance = () => {
    if (!cls) return;

    let present = 0;
    let excused = 0;
    let unexcused = 0;
    let late = 0;

    const recordsList = students.map(s => {
      const rec = attRecords[s.id] || { status: 'present', note: '' };
      if (rec.status === 'present') present++;
      else if (rec.status === 'excused') excused++;
      else if (rec.status === 'unexcused') unexcused++;
      else if (rec.status === 'late') late++;

      return {
        id: 'rec-' + s.id + '-' + attDate,
        sessionId: 'att-session-' + cls.id + '-' + attDate + '-' + attPeriod,
        studentId: s.id,
        studentName: s.fullName,
        studentCode: s.studentCode,
        status: rec.status,
        note: rec.note,
        updatedAt: new Date().toISOString(),
      };
    });

    const session: AttendanceSession = {
      id: 'att-session-' + cls.id + '-' + attDate + '-' + attPeriod,
      classId: cls.id,
      className: cls.name,
      date: attDate,
      period: attPeriod,
      sessionType: attPeriod <= 5 ? 'morning' : 'afternoon',
      takenById: user?.id || 'user-teacher-01',
      takenByName: user?.fullName || 'Cô Nguyễn Thu Hà',
      totalStudents: students.length,
      presentCount: present,
      excusedCount: excused,
      unexcusedCount: unexcused,
      lateCount: late,
      records: recordsList,
      createdAt: new Date().toISOString(),
    };

    db.saveAttendanceSession(session);
    db.logAction(
      user?.id || 'sys',
      user?.fullName || 'Teacher',
      user?.role,
      'Lưu điểm danh',
      'AttendanceSession',
      session.id,
      `Điểm danh lớp ${cls.name} ngày ${attDate} tiết ${attPeriod}: ${present} có mặt, ${excused} phép, ${late} trễ`
    );

    setIsAttDirty(false);
    success(`Đã lưu điểm danh lớp ${cls.name} thành công! (${present} có mặt)`);
  };

  // Add student
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cls || !newStdName.trim()) return;

    const code = newStdCode.trim() || `HS-${cls.name}-${(students.length + 1).toString().padStart(2, '0')}`;

    const created = db.createStudent({
      schoolId: cls.schoolId,
      studentCode: code,
      fullName: newStdName.trim(),
      dateOfBirth: '2012-05-15',
      gender: newStdGender,
      currentClassId: cls.id,
      className: cls.name,
      orderNumber: students.length + 1,
      teamGroup: newStdTeam,
      phone: newStdPhone.trim(),
      parentName: newStdParentName.trim() || 'Phụ huynh em ' + newStdName.trim(),
      status: 'Đang học',
      conduct: 'Tốt',
      gpa: 8.0,
      rewardPoints: 10,
    });

    success(`Đã thêm học sinh ${created.fullName} vào lớp ${cls.name}`);
    setIsAddStudentOpen(false);
    setNewStdName('');
    setNewStdCode('');
    setNewStdPhone('');
    setNewStdParentName('');
    setStudents(db.getStudents(cls.id));
  };

  // Create Assignment
  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cls || !asgTitle.trim()) return;

    const created = db.createAssignment({
      classId: cls.id,
      className: cls.name,
      subjectId: 'sub-math',
      subjectName: 'Toán học',
      title: asgTitle.trim(),
      description: asgDesc.trim() || 'Hoàn thành bài tập theo yêu cầu của giáo viên.',
      teacherId: user?.id || 'user-teacher-01',
      teacherName: user?.fullName || 'Cô Nguyễn Thu Hà',
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: asgDueDate,
      maxScore: 10,
      status: 'ACTIVE',
      submittedCount: 0,
      totalStudents: students.length,
      gradedCount: 0,
    });

    success(`Đã giao bài tập mới: "${created.title}"`);
    setIsCreateAsgOpen(false);
    setAsgTitle('');
    setAsgDesc('');
    setAssignments(db.getAssignments(cls.id));
  };

  // Reward team point
  const handleTeamPointChange = (teamId: string, delta: number) => {
    db.updateTeamPoints(teamId, delta);
    setTeamGroups([...db.getTeamGroups(cls?.id || '')]);
    success(`Đã ${delta > 0 ? 'cộng' : 'trừ'} ${Math.abs(delta)} điểm thi đua!`);
  };

  if (!cls) return null;

  const tabsConfig = [
    { id: 'overview', label: 'Tổng quan', icon: <Layers className="w-4 h-4" /> },
    { id: 'students', label: 'Học sinh', badge: students.length, icon: <Users className="w-4 h-4" /> },
    { id: 'attendance', label: 'Điểm danh', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'assignments', label: 'Bài tập', badge: assignments.length, icon: <FileText className="w-4 h-4" /> },
    { id: 'grades', label: 'Sổ điểm', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'competition', label: 'Thi đua', icon: <Award className="w-4 h-4" /> },
    { id: 'schedule', label: 'Thời khóa biểu', icon: <Calendar className="w-4 h-4" /> },
  ];

  // Attendance counter calculations
  const totalAtt = students.length;
  let cntPresent = 0;
  let cntExcused = 0;
  let cntUnexcused = 0;
  let cntLate = 0;
  Object.values(attRecords).forEach(r => {
    if (r.status === 'present') cntPresent++;
    else if (r.status === 'excused') cntExcused++;
    else if (r.status === 'unexcused') cntUnexcused++;
    else if (r.status === 'late') cntLate++;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb & PageHeader */}
      <PageHeader
        title={`Không gian Lớp ${cls.name}`}
        subtitle={`${cls.description || 'Lớp học số'} • Phòng ${cls.roomNumber} • GVCN: ${cls.homeroomTeacherName}`}
        breadcrumbs={[
          { label: 'Lớp học', path: '/teacher/classes' },
          { label: `Lớp ${cls.name}` },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/teacher/classes')}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Trở về danh sách lớp</span>
            </button>
            <button
              onClick={() => navigate(`/teacher/tools?classId=${cls.id}`)}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Mở Tool Hub (Vòng quay)</span>
            </button>
          </div>
        }
      />

      {/* Tabs navigation */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs px-4">
        <Tabs tabs={tabsConfig} activeTab={activeTab} onChange={handleTabChange} />
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Sĩ số lớp</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{students.length} học sinh</h3>
              <p className="text-[11px] text-slate-500 mt-1">100% hồ sơ đã liên kết</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Chuyên cần hôm nay</span>
              <h3 className="text-2xl font-bold text-emerald-600 mt-1">
                {Math.round((cntPresent / (students.length || 1)) * 100)}%
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">{cntPresent} em có mặt</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Bài tập đang giao</span>
              <h3 className="text-2xl font-bold text-blue-600 mt-1">{assignments.length} bài</h3>
              <p className="text-[11px] text-slate-500 mt-1">Chờ chấm và phản hồi</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500 font-medium">Điểm trung bình môn</span>
              <h3 className="text-2xl font-bold text-purple-600 mt-1">8.5 / 10</h3>
              <p className="text-[11px] text-slate-500 mt-1">Xếp loại giỏi khối 9</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">Danh sách học sinh nhanh</h3>
                <button
                  onClick={() => handleTabChange('students')}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Xem đầy đủ ({students.length})
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {students.slice(0, 6).map(s => (
                  <div
                    key={s.id}
                    onClick={() => navigate(`/teacher/students/${s.id}`)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-blue-400 hover:bg-blue-50/40 transition-all cursor-pointer"
                  >
                    <img
                      src={s.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'}
                      alt={s.fullName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate">{s.fullName}</p>
                      <p className="text-[11px] text-slate-500">
                        {s.studentCode} • {s.teamGroup}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {s.gpa} đ
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Thông tin tham gia lớp</h3>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <p className="text-xs text-slate-500 mb-1">Mã tham gia lớp học:</p>
                <span className="font-mono text-xl font-black text-blue-700 bg-white px-3 py-1 rounded-lg border border-slate-200 inline-block shadow-2xs">
                  {cls.code}
                </span>
                <p className="text-[10px] text-slate-400 mt-2">Học sinh & phụ huynh nhập mã này để kết nối</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Phòng học:</span>
                  <span className="font-semibold text-slate-800">{cls.roomNumber}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Năm học:</span>
                  <span className="font-semibold text-slate-800">2026 - 2027</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Số tổ thi đua:</span>
                  <span className="font-semibold text-slate-800">{teamGroups.length} tổ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENTS ROSTER */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-80">
              <SearchBox
                value={studentSearch}
                onChange={setStudentSearch}
                placeholder="Tìm học sinh theo tên, mã HS, tổ..."
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsAddStudentOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm học sinh</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5 w-12 text-center">STT</th>
                  <th className="p-3.5">Học sinh</th>
                  <th className="p-3.5">Mã HS</th>
                  <th className="p-3.5">Giới tính</th>
                  <th className="p-3.5">Tổ</th>
                  <th className="p-3.5">Điểm TB</th>
                  <th className="p-3.5">Hạnh kiểm</th>
                  <th className="p-3.5">Điểm thi đua</th>
                  <th className="p-3.5 text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students
                  .filter(s =>
                    s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
                    s.studentCode.toLowerCase().includes(studentSearch.toLowerCase()) ||
                    (s.teamGroup && s.teamGroup.toLowerCase().includes(studentSearch.toLowerCase()))
                  )
                  .map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 text-center font-bold text-slate-400">{s.orderNumber}</td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={s.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'}
                            alt={s.fullName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer"
                               onClick={() => navigate(`/teacher/students/${s.id}`)}>
                              {s.fullName}
                            </p>
                            <p className="text-[10px] text-slate-500">Phụ huynh: {s.parentName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-mono font-medium text-slate-700">{s.studentCode}</td>
                      <td className="p-3.5 text-slate-600">{s.gender}</td>
                      <td className="p-3.5 font-semibold text-slate-700">{s.teamGroup || 'Chưa xếp'}</td>
                      <td className="p-3.5">
                        <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                          {s.gpa}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <StatusChip label={s.conduct || 'Tốt'} variant="success" size="sm" />
                      </td>
                      <td className="p-3.5 font-bold text-amber-600">+{s.rewardPoints || 0} pts</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => navigate(`/teacher/students/${s.id}`)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 rounded-lg text-xs font-semibold transition-colors"
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
      )}

      {/* TAB 3: ATTENDANCE (DIRECT IN-CLASS TAKING) */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          {/* Controls & Quick Actions */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Ngày điểm danh
                </label>
                <input
                  type="date"
                  value={attDate}
                  onChange={e => setAttDate(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Tiết học
                </label>
                <select
                  value={attPeriod}
                  onChange={e => setAttPeriod(Number(e.target.value))}
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
                  onClick={handleMarkAllPresent}
                  className="px-3.5 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Đánh dấu tất cả có mặt</span>
                </button>
              </div>
            </div>

            {/* Counters Badge */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                Có mặt: {cntPresent}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                Phép: {cntExcused}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-cyan-50 text-cyan-700 border border-cyan-200">
                Trễ: {cntLate}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
                Không phép: {cntUnexcused}
              </span>
            </div>
          </div>

          {/* Student attendance list */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="divide-y divide-slate-100">
              {students.map(s => {
                const cur = attRecords[s.id] || { status: 'present', note: '' };
                return (
                  <div
                    key={s.id}
                    className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
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

                    {/* Status selection buttons */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleAttendanceChange(s.id, 'present')}
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
                        onClick={() => handleAttendanceChange(s.id, 'excused')}
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
                        onClick={() => handleAttendanceChange(s.id, 'late')}
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
                        onClick={() => handleAttendanceChange(s.id, 'unexcused')}
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
                {isAttDirty ? '⚠️ Có thay đổi chưa lưu' : '✓ Dữ liệu đã đồng bộ'}
              </span>
              <button
                onClick={handleSaveAttendance}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Lưu sổ điểm danh</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Bài tập & Phiếu học tập của lớp</h3>
            <button
              onClick={() => setIsCreateAsgOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Giao bài tập mới</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map(asg => (
              <div key={asg.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-md">
                      {asg.subjectName}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{asg.title}</h4>
                  </div>
                  <StatusChip
                    label={asg.status === 'ACTIVE' ? 'Đang giao' : 'Đã đóng'}
                    variant={asg.status === 'ACTIVE' ? 'success' : 'neutral'}
                    size="sm"
                  />
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{asg.description}</p>
                <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100 text-slate-600">
                  <span>Hạn nộp: {new Date(asg.dueDate).toLocaleDateString('vi-VN')}</span>
                  <span className="font-bold text-blue-600">
                    Đã nộp: {asg.submittedCount || 0}/{students.length}
                  </span>
                </div>
                <button
                  onClick={() => navigate('/teacher/assignments')}
                  className="w-full py-2 bg-slate-50 hover:bg-blue-50 text-blue-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Xem bài nộp & Chấm điểm
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: GRADEBOOK (SỔ ĐIỂM) */}
      {activeTab === 'grades' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Bảng điểm môn Toán - Học kỳ I</h3>
              <p className="text-xs text-slate-500">Các cột điểm thành phần thường xuyên và giữa kỳ</p>
            </div>
            <button
              onClick={() => navigate('/teacher/grades')}
              className="px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-xs"
            >
              Mở giao diện nhập điểm chuyên sâu
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3 w-12 text-center">STT</th>
                  <th className="p-3">Họ và tên</th>
                  <th className="p-3">Miệng (x1)</th>
                  <th className="p-3">15P Số 1 (x1)</th>
                  <th className="p-3">15P Số 2 (x1)</th>
                  <th className="p-3">Giữa Kỳ I (x2)</th>
                  <th className="p-3">Điểm TB môn</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map(s => {
                  const grades = studentGrades.filter(g => g.studentId === s.id);
                  const gM = grades.find(g => g.gradeItemId === 'gi-01')?.score ?? 8.5;
                  const g15_1 = grades.find(g => g.gradeItemId === 'gi-02')?.score ?? 8.0;
                  const g15_2 = grades.find(g => g.gradeItemId === 'gi-03')?.score ?? 9.0;
                  const gGK = grades.find(g => g.gradeItemId === 'gi-04')?.score ?? 8.5;
                  const tb = Math.round(((gM + g15_1 + g15_2 + gGK * 2) / 5) * 10) / 10;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-3 text-center font-bold text-slate-400">{s.orderNumber}</td>
                      <td className="p-3 font-bold text-slate-900">{s.fullName}</td>
                      <td className="p-3 font-semibold text-slate-700">{gM}</td>
                      <td className="p-3 font-semibold text-slate-700">{g15_1}</td>
                      <td className="p-3 font-semibold text-slate-700">{g15_2}</td>
                      <td className="p-3 font-semibold text-blue-700">{gGK}</td>
                      <td className="p-3 font-black text-emerald-600">{tb}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: COMPETITION (THI ĐUA TỔ) */}
      {activeTab === 'competition' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800">Bảng xếp hạng thi đua các tổ</h3>
            <p className="text-xs text-slate-500">Khuyến khích học tập tích cực và tinh thần đồng đội</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {teamGroups.map((team, idx) => (
              <div
                key={team.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg">
                    Hạng #{idx + 1}
                  </span>
                  <Award className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">{team.name}</h4>
                  <p className="text-xs text-slate-500">Tổ trưởng: {team.leaderName}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl text-center">
                  <span className="text-3xl font-black text-slate-900">{team.points}</span>
                  <span className="text-xs text-slate-400 font-semibold ml-1">điểm</span>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => handleTeamPointChange(team.id, 5)}
                    className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    +5 Điểm
                  </button>
                  <button
                    onClick={() => handleTeamPointChange(team.id, -2)}
                    className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    -2 Điểm
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: SCHEDULE */}
      {activeTab === 'schedule' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Thời khóa biểu tuần lớp {cls.name}</h3>
          <div className="divide-y divide-slate-100">
            {schedules.map(item => (
              <div key={item.id} className="py-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900">{item.subjectName}</span>
                  <p className="text-[11px] text-slate-500">
                    Thứ {item.dayOfWeek} • Tiết {item.period} ({item.startTime} - {item.endTime}) • GV: {item.teacherName}
                  </p>
                </div>
                <span className="text-xs font-semibold bg-slate-100 px-2.5 py-1 rounded-lg text-slate-700">
                  {item.room}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      <Modal isOpen={isAddStudentOpen} onClose={() => setIsAddStudentOpen(false)} title={`Thêm học sinh vào lớp ${cls.name}`}>
        <form onSubmit={handleAddStudent} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Họ và tên học sinh <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newStdName}
              onChange={e => setNewStdName(e.target.value)}
              placeholder="VD: Nguyễn Văn Anh"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Giới tính</label>
              <select
                value={newStdGender}
                onChange={e => setNewStdGender(e.target.value as 'Nam' | 'Nữ')}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Thuộc tổ</label>
              <select
                value={newStdTeam}
                onChange={e => setNewStdTeam(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              >
                <option value="Tổ 1">Tổ 1</option>
                <option value="Tổ 2">Tổ 2</option>
                <option value="Tổ 3">Tổ 3</option>
                <option value="Tổ 4">Tổ 4</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Họ tên phụ huynh</label>
            <input
              type="text"
              value={newStdParentName}
              onChange={e => setNewStdParentName(e.target.value)}
              placeholder="VD: Nguyễn Văn B (Bố em)"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddStudentOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-xs"
            >
              Thêm học sinh
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Assignment Modal */}
      <Modal isOpen={isCreateAsgOpen} onClose={() => setIsCreateAsgOpen(false)} title={`Giao bài tập mới cho lớp ${cls.name}`}>
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tiêu đề bài tập <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={asgTitle}
              onChange={e => setAsgTitle(e.target.value)}
              placeholder="VD: Bài tập luyện tập Phương trình bậc hai số 3"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Hạn nộp</label>
            <input
              type="datetime-local"
              value={asgDueDate}
              onChange={e => setAsgDueDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung / Yêu cầu</label>
            <textarea
              rows={3}
              value={asgDesc}
              onChange={e => setAsgDesc(e.target.value)}
              placeholder="Ghi chú bài tập, số bài cần làm trong SGK hoặc phiếu bài tập..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateAsgOpen(false)}
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
