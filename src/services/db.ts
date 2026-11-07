import {
  Classroom,
  Student,
  AttendanceSession,
  AttendanceRecord,
  Assignment,
  Submission,
  GradeItem,
  StudentGrade,
  BehaviorRecord,
  TeamGroup,
  SystemAlert,
  Announcement,
  AuditLogItem,
  ScheduleItem,
  Quiz,
  Question,
  ResourceItem,
  UserProfile,
  School,
  AcademicYear,
  GradeLevel,
  Subject,
} from '../types';
import {
  initialClasses,
  initialStudents,
  initialAttendanceSessions,
  initialAssignments,
  initialSubmissions,
  initialGradeItems,
  initialStudentGrades,
  initialBehaviorRecords,
  initialTeamGroups,
  initialAlerts,
  initialAnnouncements,
  initialAuditLogs,
  initialSchedules,
  initialQuizzes,
  initialQuestions,
  initialResources,
  initialUsers,
  initialSchool,
  initialAcademicYears,
  initialGradeLevels,
  initialSubjects,
} from '../data/seedData';
import { db as firestoreDb } from '../lib/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';

// Local storage keys
const STORAGE_PREFIX = 'smartclass_v1_';

function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    if (!item) return defaultValue;
    return JSON.parse(item);
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

// Background Firestore synchronization
function syncToFirestore(collectionName: string, id: string, data: Record<string, unknown>) {
  try {
    setDoc(doc(firestoreDb, collectionName, id), data, { merge: true }).catch(err => {
      console.warn(`Firestore sync warning for ${collectionName}/${id}:`, err);
    });
  } catch (err) {
    console.warn(`Firestore sync error for ${collectionName}/${id}:`, err);
  }
}

function deleteFromFirestore(collectionName: string, id: string) {
  try {
    deleteDoc(doc(firestoreDb, collectionName, id)).catch(err => {
      console.warn(`Firestore delete warning for ${collectionName}/${id}:`, err);
    });
  } catch (err) {
    console.warn(`Firestore delete error for ${collectionName}/${id}:`, err);
  }
}

class SmartClassDatabase {
  private school: School;
  private academicYears: AcademicYear[];
  private gradeLevels: GradeLevel[];
  private subjects: Subject[];
  private users: UserProfile[];
  private classes: Classroom[];
  private students: Student[];
  private attendanceSessions: AttendanceSession[];
  private assignments: Assignment[];
  private submissions: Submission[];
  private gradeItems: GradeItem[];
  private studentGrades: StudentGrade[];
  private behaviorRecords: BehaviorRecord[];
  private teamGroups: TeamGroup[];
  private alerts: SystemAlert[];
  private announcements: Announcement[];
  private auditLogs: AuditLogItem[];
  private schedules: ScheduleItem[];
  private quizzes: Quiz[];
  private questions: Question[];
  private resources: ResourceItem[];

  constructor() {
    this.school = getStorageItem<School>('school', initialSchool);
    this.academicYears = getStorageItem<AcademicYear[]>('academicYears', initialAcademicYears);
    this.gradeLevels = getStorageItem<GradeLevel[]>('gradeLevels', initialGradeLevels);
    this.subjects = getStorageItem<Subject[]>('subjects', initialSubjects);
    this.users = getStorageItem<UserProfile[]>('users', initialUsers);
    this.classes = getStorageItem<Classroom[]>('classes', initialClasses);
    this.students = getStorageItem<Student[]>('students', initialStudents);
    this.attendanceSessions = getStorageItem<AttendanceSession[]>('attendanceSessions', initialAttendanceSessions);
    this.assignments = getStorageItem<Assignment[]>('assignments', initialAssignments);
    this.submissions = getStorageItem<Submission[]>('submissions', initialSubmissions);
    this.gradeItems = getStorageItem<GradeItem[]>('gradeItems', initialGradeItems);
    this.studentGrades = getStorageItem<StudentGrade[]>('studentGrades', initialStudentGrades);
    this.behaviorRecords = getStorageItem<BehaviorRecord[]>('behaviorRecords', initialBehaviorRecords);
    this.teamGroups = getStorageItem<TeamGroup[]>('teamGroups', initialTeamGroups);
    this.alerts = getStorageItem<SystemAlert[]>('alerts', initialAlerts);
    this.announcements = getStorageItem<Announcement[]>('announcements', initialAnnouncements);
    this.auditLogs = getStorageItem<AuditLogItem[]>('auditLogs', initialAuditLogs);
    this.schedules = getStorageItem<ScheduleItem[]>('schedules', initialSchedules);
    this.quizzes = getStorageItem<Quiz[]>('quizzes', initialQuizzes);
    this.questions = getStorageItem<Question[]>('questions', initialQuestions);
    this.resources = getStorageItem<ResourceItem[]>('resources', initialResources);
  }

  // --- Reset to initial seed ---
  resetToSeed(): void {
    localStorage.clear();
    this.school = initialSchool;
    this.academicYears = initialAcademicYears;
    this.gradeLevels = initialGradeLevels;
    this.subjects = initialSubjects;
    this.users = initialUsers;
    this.classes = initialClasses;
    this.students = initialStudents;
    this.attendanceSessions = initialAttendanceSessions;
    this.assignments = initialAssignments;
    this.submissions = initialSubmissions;
    this.gradeItems = initialGradeItems;
    this.studentGrades = initialStudentGrades;
    this.behaviorRecords = initialBehaviorRecords;
    this.teamGroups = initialTeamGroups;
    this.alerts = initialAlerts;
    this.announcements = initialAnnouncements;
    this.auditLogs = initialAuditLogs;
    this.schedules = initialSchedules;
    this.quizzes = initialQuizzes;
    this.questions = initialQuestions;
    this.resources = initialResources;

    setStorageItem('classes', this.classes);
    setStorageItem('students', this.students);
    setStorageItem('attendanceSessions', this.attendanceSessions);
  }

  // --- Audit Log ---
  logAction(userId: string, userName: string, userRole: any, action: string, entityType: string, entityId: string, details: string): void {
    const newLog: AuditLogItem = {
      id: 'log-' + Date.now(),
      userId,
      userName,
      userRole,
      action,
      entityType,
      entityId,
      details,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(newLog);
    setStorageItem('auditLogs', this.auditLogs);
  }

  getAuditLogs(): AuditLogItem[] {
    return [...this.auditLogs];
  }

  // --- Classes CRUD ---
  getClasses(filterArchived: boolean = false): Classroom[] {
    return this.classes.filter(c => (filterArchived ? true : !c.isArchived));
  }

  getClassById(id: string): Classroom | undefined {
    return this.classes.find(c => c.id === id);
  }

  createClass(classData: Omit<Classroom, 'id' | 'createdAt' | 'studentCount'>): Classroom {
    const newClass: Classroom = {
      ...classData,
      id: 'class-' + Date.now(),
      studentCount: 0,
      createdAt: new Date().toISOString(),
    };
    this.classes.unshift(newClass);
    setStorageItem('classes', this.classes);
    syncToFirestore('classes', newClass.id, newClass as unknown as Record<string, unknown>);
    return newClass;
  }

  updateClass(id: string, updates: Partial<Classroom>): Classroom | undefined {
    const index = this.classes.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    this.classes[index] = { ...this.classes[index], ...updates };
    setStorageItem('classes', this.classes);
    syncToFirestore('classes', id, this.classes[index] as unknown as Record<string, unknown>);
    return this.classes[index];
  }

  archiveClass(id: string): boolean {
    const cls = this.getClassById(id);
    if (!cls) return false;
    cls.isArchived = true;
    setStorageItem('classes', this.classes);
    syncToFirestore('classes', id, cls as unknown as Record<string, unknown>);
    return true;
  }

  deleteClass(id: string): boolean {
    const index = this.classes.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.classes.splice(index, 1);
    setStorageItem('classes', this.classes);
    deleteFromFirestore('classes', id);
    return true;
  }

  // --- Students CRUD ---
  getStudents(classId?: string): Student[] {
    if (classId) {
      return this.students.filter(s => s.currentClassId === classId);
    }
    return [...this.students];
  }

  getStudentById(id: string): Student | undefined {
    return this.students.find(s => s.id === id);
  }

  createStudent(studentData: Omit<Student, 'id'>): Student {
    const newStudent: Student = {
      ...studentData,
      id: 'std-' + Date.now(),
    };
    this.students.push(newStudent);
    // update class student count
    const targetClass = this.getClassById(studentData.currentClassId);
    if (targetClass) {
      targetClass.studentCount = (targetClass.studentCount || 0) + 1;
      setStorageItem('classes', this.classes);
      syncToFirestore('classes', targetClass.id, targetClass as unknown as Record<string, unknown>);
    }
    setStorageItem('students', this.students);
    syncToFirestore('students', newStudent.id, newStudent as unknown as Record<string, unknown>);
    return newStudent;
  }

  updateStudent(id: string, updates: Partial<Student>): Student | undefined {
    const index = this.students.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    this.students[index] = { ...this.students[index], ...updates };
    setStorageItem('students', this.students);
    syncToFirestore('students', id, this.students[index] as unknown as Record<string, unknown>);
    return this.students[index];
  }

  deleteStudent(id: string): boolean {
    const index = this.students.findIndex(s => s.id === id);
    if (index === -1) return false;
    const student = this.students[index];
    const targetClass = this.getClassById(student.currentClassId);
    if (targetClass && (targetClass.studentCount || 0) > 0) {
      targetClass.studentCount = (targetClass.studentCount || 0) - 1;
      setStorageItem('classes', this.classes);
      syncToFirestore('classes', targetClass.id, targetClass as unknown as Record<string, unknown>);
    }
    this.students.splice(index, 1);
    setStorageItem('students', this.students);
    deleteFromFirestore('students', id);
    return true;
  }

  bulkAddStudents(students: Omit<Student, 'id'>[]): Student[] {
    const added: Student[] = [];
    students.forEach((s, idx) => {
      const newStd: Student = {
        ...s,
        id: 'std-' + (Date.now() + idx),
      };
      this.students.push(newStd);
      added.push(newStd);
      syncToFirestore('students', newStd.id, newStd as unknown as Record<string, unknown>);
    });
    // refresh class student counts
    this.classes.forEach(c => {
      c.studentCount = this.students.filter(s => s.currentClassId === c.id).length;
      syncToFirestore('classes', c.id, c as unknown as Record<string, unknown>);
    });
    setStorageItem('classes', this.classes);
    setStorageItem('students', this.students);
    return added;
  }

  // --- Attendance ---
  getAttendanceSessions(classId?: string): AttendanceSession[] {
    if (classId) {
      return this.attendanceSessions.filter(a => a.classId === classId);
    }
    return [...this.attendanceSessions];
  }

  getAttendanceSession(classId: string, date: string, period: number): AttendanceSession | undefined {
    return this.attendanceSessions.find(
      s => s.classId === classId && s.date === date && s.period === period
    );
  }

  saveAttendanceSession(sessionData: Omit<AttendanceSession, 'id' | 'createdAt'> & { id?: string }): AttendanceSession {
    const existingIndex = this.attendanceSessions.findIndex(
      s => (sessionData.id && s.id === sessionData.id) ||
           (s.classId === sessionData.classId && s.date === sessionData.date && s.period === sessionData.period)
    );

    const fullSession: AttendanceSession = {
      ...sessionData,
      id: sessionData.id || ('att-' + Date.now()),
      createdAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      this.attendanceSessions[existingIndex] = fullSession;
    } else {
      this.attendanceSessions.unshift(fullSession);
    }

    setStorageItem('attendanceSessions', this.attendanceSessions);
    syncToFirestore('attendance_sessions', fullSession.id, fullSession as unknown as Record<string, unknown>);
    return fullSession;
  }

  // --- Assignments ---
  getAssignments(classId?: string): Assignment[] {
    if (classId) {
      return this.assignments.filter(a => a.classId === classId);
    }
    return [...this.assignments];
  }

  getAssignmentById(id: string): Assignment | undefined {
    return this.assignments.find(a => a.id === id);
  }

  createAssignment(data: Omit<Assignment, 'id'>): Assignment {
    const newAsg: Assignment = {
      ...data,
      id: 'asg-' + Date.now(),
    };
    this.assignments.unshift(newAsg);
    setStorageItem('assignments', this.assignments);
    syncToFirestore('assignments', newAsg.id, newAsg as unknown as Record<string, unknown>);
    return newAsg;
  }

  updateAssignment(id: string, updates: Partial<Assignment>): Assignment | undefined {
    const index = this.assignments.findIndex(a => a.id === id);
    if (index === -1) return undefined;
    this.assignments[index] = { ...this.assignments[index], ...updates };
    setStorageItem('assignments', this.assignments);
    syncToFirestore('assignments', id, this.assignments[index] as unknown as Record<string, unknown>);
    return this.assignments[index];
  }

  deleteAssignment(id: string): boolean {
    const index = this.assignments.findIndex(a => a.id === id);
    if (index === -1) return false;
    this.assignments.splice(index, 1);
    setStorageItem('assignments', this.assignments);
    deleteFromFirestore('assignments', id);
    return true;
  }

  // --- Submissions ---
  getSubmissions(assignmentId: string): Submission[] {
    return this.submissions.filter(s => s.assignmentId === assignmentId);
  }

  getStudentSubmissions(studentId: string): Submission[] {
    return this.submissions.filter(s => s.studentId === studentId);
  }

  gradeSubmission(submissionId: string, score: number, feedback: string, teacherId: string): Submission | undefined {
    const sub = this.submissions.find(s => s.id === submissionId);
    if (!sub) return undefined;
    sub.score = score;
    sub.feedback = feedback;
    sub.gradedAt = new Date().toISOString();
    sub.gradedById = teacherId;
    sub.status = 'Đã chấm';

    // update assignment graded count
    const asg = this.getAssignmentById(sub.assignmentId);
    if (asg) {
      const subs = this.getSubmissions(asg.id);
      asg.gradedCount = subs.filter(s => s.status === 'Đã chấm').length;
      setStorageItem('assignments', this.assignments);
      syncToFirestore('assignments', asg.id, asg as unknown as Record<string, unknown>);
    }

    setStorageItem('submissions', this.submissions);
    syncToFirestore('submissions', sub.id, sub as unknown as Record<string, unknown>);
    return sub;
  }

  submitAssignment(submissionData: Omit<Submission, 'id' | 'submittedAt' | 'status'> & { status?: Submission['status'] }): Submission {
    const existingIndex = this.submissions.findIndex(
      s => s.assignmentId === submissionData.assignmentId && s.studentId === submissionData.studentId
    );
    const fullSub: Submission = {
      ...submissionData,
      id: existingIndex >= 0 ? this.submissions[existingIndex].id : ('sub-' + Date.now()),
      submittedAt: new Date().toISOString(),
      status: 'Đã nộp',
    };
    if (existingIndex >= 0) {
      this.submissions[existingIndex] = fullSub;
    } else {
      this.submissions.push(fullSub);
    }

    // update assignment submitted count
    const asg = this.getAssignmentById(submissionData.assignmentId);
    if (asg) {
      asg.submittedCount = this.getSubmissions(asg.id).length;
      setStorageItem('assignments', this.assignments);
      syncToFirestore('assignments', asg.id, asg as unknown as Record<string, unknown>);
    }

    setStorageItem('submissions', this.submissions);
    syncToFirestore('submissions', fullSub.id, fullSub as unknown as Record<string, unknown>);
    return fullSub;
  }

  // --- Grade Items & Grades ---
  getGradeItems(classId: string): GradeItem[] {
    return this.gradeItems.filter(g => g.classId === classId);
  }

  createGradeItem(item: Omit<GradeItem, 'id'>): GradeItem {
    const newItem: GradeItem = {
      ...item,
      id: 'gi-' + Date.now(),
    };
    this.gradeItems.push(newItem);
    setStorageItem('gradeItems', this.gradeItems);
    return newItem;
  }

  getStudentGrades(classId: string): StudentGrade[] {
    const classGradeItemIds = this.getGradeItems(classId).map(i => i.id);
    return this.studentGrades.filter(g => classGradeItemIds.includes(g.gradeItemId));
  }

  saveBatchGrades(grades: { gradeItemId: string; studentId: string; score: number | null }[]): void {
    grades.forEach(g => {
      const index = this.studentGrades.findIndex(
        sg => sg.gradeItemId === g.gradeItemId && sg.studentId === g.studentId
      );
      if (index >= 0) {
        this.studentGrades[index].score = g.score;
        this.studentGrades[index].updatedAt = new Date().toISOString();
      } else {
        this.studentGrades.push({
          id: 'g-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          gradeItemId: g.gradeItemId,
          studentId: g.studentId,
          score: g.score,
          updatedAt: new Date().toISOString(),
        });
      }
    });
    setStorageItem('studentGrades', this.studentGrades);
  }

  // --- Behavior & Team Groups ---
  getBehaviorRecords(classId?: string, studentId?: string): BehaviorRecord[] {
    return this.behaviorRecords.filter(b => {
      if (classId && b.classId !== classId) return false;
      if (studentId && b.studentId !== studentId) return false;
      return true;
    });
  }

  addBehaviorRecord(record: Omit<BehaviorRecord, 'id' | 'recordedDate'>): BehaviorRecord {
    const newRecord: BehaviorRecord = {
      ...record,
      id: 'beh-' + Date.now(),
      recordedDate: new Date().toISOString().split('T')[0],
    };
    this.behaviorRecords.unshift(newRecord);

    // update student rewardPoints
    const student = this.getStudentById(record.studentId);
    if (student) {
      student.rewardPoints = (student.rewardPoints || 0) + record.points;
      setStorageItem('students', this.students);
    }

    setStorageItem('behaviorRecords', this.behaviorRecords);
    return newRecord;
  }

  getTeamGroups(classId: string): TeamGroup[] {
    return this.teamGroups.filter(t => t.classId === classId);
  }

  updateTeamPoints(teamId: string, deltaPoints: number): void {
    const team = this.teamGroups.find(t => t.id === teamId);
    if (team) {
      team.points += deltaPoints;
      setStorageItem('teamGroups', this.teamGroups);
    }
  }

  // --- Alerts ---
  getAlerts(classId?: string): SystemAlert[] {
    if (classId) {
      return this.alerts.filter(a => !a.classId || a.classId === classId);
    }
    return [...this.alerts];
  }

  updateAlertStatus(id: string, status: SystemAlert['status']): void {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.status = status;
      setStorageItem('alerts', this.alerts);
    }
  }

  // --- Announcements ---
  getAnnouncements(targetClassId?: string): Announcement[] {
    return this.announcements.filter(a => {
      if (a.targetType === 'ALL') return true;
      if (targetClassId && a.targetClassId === targetClassId) return true;
      return true;
    });
  }

  createAnnouncement(data: Omit<Announcement, 'id' | 'createdAt' | 'viewCount'>): Announcement {
    const newAnc: Announcement = {
      ...data,
      id: 'anc-' + Date.now(),
      createdAt: new Date().toISOString(),
      viewCount: 1,
    };
    this.announcements.unshift(newAnc);
    setStorageItem('announcements', this.announcements);
    return newAnc;
  }

  // --- Schedule ---
  getSchedules(classId?: string): ScheduleItem[] {
    if (classId) {
      return this.schedules.filter(s => s.classId === classId);
    }
    return [...this.schedules];
  }

  // --- Quizzes & Questions ---
  getQuizzes(classId?: string): Quiz[] {
    if (classId) {
      return this.quizzes.filter(q => q.classId === classId);
    }
    return [...this.quizzes];
  }

  getQuizById(id: string): Quiz | undefined {
    return this.quizzes.find(q => q.id === id);
  }

  getQuestions(): Question[] {
    return [...this.questions];
  }

  addQuestion(q: Omit<Question, 'id'>): Question {
    const newQ: Question = {
      ...q,
      id: 'q-' + Date.now(),
    };
    this.questions.push(newQ);
    setStorageItem('questions', this.questions);
    return newQ;
  }

  // --- Resources ---
  getResources(): ResourceItem[] {
    return [...this.resources];
  }

  addResource(r: Omit<ResourceItem, 'id' | 'uploadedAt'>): ResourceItem {
    const newR: ResourceItem = {
      ...r,
      id: 'res-' + Date.now(),
      uploadedAt: new Date().toISOString().split('T')[0],
    };
    this.resources.unshift(newR);
    setStorageItem('resources', this.resources);
    return newR;
  }

  toggleResourceFavorite(id: string): void {
    const r = this.resources.find(res => res.id === id);
    if (r) {
      r.isFavorite = !r.isFavorite;
      setStorageItem('resources', this.resources);
    }
  }

  // --- Meta Entities (School, Academic Years, Subjects) ---
  getSchool(): School {
    return this.school;
  }

  getAcademicYears(): AcademicYear[] {
    return this.academicYears;
  }

  getGradeLevels(): GradeLevel[] {
    return this.gradeLevels;
  }

  getSubjects(): Subject[] {
    return this.subjects;
  }

  getUsers(): UserProfile[] {
    return this.users;
  }
}

export const db = new SmartClassDatabase();
