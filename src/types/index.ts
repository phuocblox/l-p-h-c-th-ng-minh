export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface School {
  id: string;
  name: string;
  code: string;
  address: string;
  phone: string;
  email: string;
  principalName: string;
  logoUrl?: string;
}

export interface AcademicYear {
  id: string;
  schoolId: string;
  name: string; // e.g. "2026-2027"
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface GradeLevel {
  id: string;
  schoolId: string;
  name: string; // "Khối 6", "Khối 7", "Khối 8", "Khối 9"
  level: number;
}

export interface Subject {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  icon?: string;
  color?: string;
}

export interface Classroom {
  id: string;
  schoolId: string;
  academicYearId: string;
  gradeLevelId: string;
  name: string; // e.g. "9A1"
  code: string; // code to join
  roomNumber: string;
  homeroomTeacherId: string;
  homeroomTeacherName?: string;
  description?: string;
  color?: string;
  studentCount?: number;
  isArchived?: boolean;
  createdAt: string;
}

export interface Student {
  id: string;
  schoolId: string;
  studentCode: string; // Mã học sinh HS001
  fullName: string;
  dateOfBirth: string;
  gender: 'Nam' | 'Nữ';
  currentClassId: string;
  className?: string;
  orderNumber: number; // STT trong lớp
  teamGroup?: string; // Tổ 1, Tổ 2...
  avatarUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  parentId?: string;
  parentName?: string;
  parentPhone?: string;
  status: 'Đang học' | 'Nghỉ học' | 'Chuyển lớp' | 'Bảo lưu';
  conduct?: 'Tốt' | 'Khá' | 'Trung bình' | 'Yếu';
  gpa?: number;
  rewardPoints?: number;
}

export interface Parent {
  id: string;
  schoolId: string;
  fullName: string;
  phone: string;
  email: string;
  address?: string;
  occupation?: string;
  childrenIds: string[];
}

export type AttendanceStatus = 'present' | 'excused' | 'unexcused' | 'late' | 'early_leave';

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  studentName?: string;
  studentCode?: string;
  status: AttendanceStatus;
  note?: string;
  updatedAt: string;
}

export interface AttendanceSession {
  id: string;
  classId: string;
  className?: string;
  date: string; // YYYY-MM-DD
  period: number; // Tiết 1-5
  sessionType: 'morning' | 'afternoon';
  takenById: string;
  takenByName: string;
  totalStudents: number;
  presentCount: number;
  excusedCount: number;
  unexcusedCount: number;
  lateCount: number;
  records: AttendanceRecord[];
  createdAt: string;
}

export interface ScheduleItem {
  id: string;
  classId: string;
  className?: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  dayOfWeek: number; // 2: Thứ Hai, 3: Thứ Ba, ..., 7: Thứ Bảy
  period: number; // 1 to 5
  room: string;
  startTime: string;
  endTime: string;
}

export interface Assignment {
  id: string;
  classId: string;
  className?: string;
  subjectId: string;
  subjectName: string;
  title: string;
  description: string;
  teacherId: string;
  teacherName: string;
  assignedDate: string;
  dueDate: string;
  maxScore: number;
  attachmentUrls?: string[];
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED';
  submittedCount?: number;
  totalStudents?: number;
  gradedCount?: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  submittedAt: string;
  content: string;
  attachmentUrls?: string[];
  score?: number;
  feedback?: string;
  gradedAt?: string;
  gradedById?: string;
  status: 'Chưa làm' | 'Đã nộp' | 'Nộp muộn' | 'Đã chấm' | 'Yêu cầu làm lại';
}

export interface Question {
  id: string;
  schoolId: string;
  gradeLevelId: string;
  subjectId: string;
  subjectName?: string;
  type: 'single_choice' | 'multiple_choice' | 'true_false' | 'fill_in' | 'essay';
  content: string;
  options?: { id: string; text: string; isCorrect: boolean }[];
  correctAnswer?: string;
  explanation?: string;
  difficulty: 'Nhận biết' | 'Thông hiểu' | 'Vận dụng' | 'Vận dụng cao';
  tags: string[];
}

export interface Quiz {
  id: string;
  classId: string;
  className?: string;
  subjectId: string;
  subjectName: string;
  title: string;
  description: string;
  durationMinutes: number;
  openTime: string;
  closeTime: string;
  questionCount: number;
  questions: Question[];
  shuffleQuestions: boolean;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED';
  createdById: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  startedAt: string;
  completedAt?: string;
  score: number;
  maxScore: number;
  answers: Record<string, string | string[]>;
}

export interface ResourceItem {
  id: string;
  title: string;
  gradeLevelId: string;
  subjectId: string;
  subjectName: string;
  chapter: string;
  lesson: string;
  fileType: 'pdf' | 'doc' | 'ppt' | 'image' | 'video' | 'link';
  fileUrl: string;
  fileSize?: string;
  isFavorite: boolean;
  uploadedBy: string;
  uploadedAt: string;
}

export interface GradeItem {
  id: string;
  classId: string;
  subjectId: string;
  subjectName: string;
  name: string; // e.g. "Điểm miệng 1", "15 phút", "Giữa kỳ I", "Cuối kỳ I"
  category: 'TX' | 'GK' | 'CK' | 'ASSIGNMENT';
  weight: number; // 1, 2, 3
  semester: 1 | 2;
  maxScore: number;
}

export interface StudentGrade {
  id: string;
  gradeItemId: string;
  studentId: string;
  studentName?: string;
  score: number | null;
  note?: string;
  updatedAt: string;
}

export interface BehaviorRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  classId: string;
  className: string;
  type: 'positive' | 'negative';
  points: number; // e.g. +5 or -2
  category: string; // "Hăng hái phát biểu", "Giúp đỡ bạn", "Nói chuyện riêng", "Đi muộn"
  note: string;
  recordedBy: string;
  recordedDate: string;
}

export interface TeamGroup {
  id: string;
  classId: string;
  name: string; // "Tổ 1", "Tổ 2", "Tổ 3", "Tổ 4"
  leaderStudentId?: string;
  leaderName?: string;
  points: number;
  studentCount: number;
}

export interface SystemAlert {
  id: string;
  classId?: string;
  className?: string;
  studentId?: string;
  studentName?: string;
  type: 'attendance' | 'grades' | 'assignment' | 'behavior';
  severity: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  status: 'NEW' | 'VIEWED' | 'PROCESSING' | 'RESOLVED';
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'URGENT' | 'HIGH' | 'NORMAL';
  targetType: 'ALL' | 'CLASS' | 'PARENTS' | 'STUDENTS';
  targetClassId?: string;
  targetClassName?: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
  viewCount: number;
  totalRecipients: number;
  attachmentUrls?: string[];
}

export interface AuditLogItem {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string; // "Cập nhật điểm", "Điểm danh", "Tạo bài tập", "Xóa lớp học"
  entityType: string;
  entityId: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}
