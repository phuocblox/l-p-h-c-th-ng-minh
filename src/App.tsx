import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { AppLayout } from './layouts/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleGuard } from './components/auth/RoleGuard';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { ForbiddenPage } from './pages/auth/ForbiddenPage';
import { NotFoundPage } from './pages/auth/NotFoundPage';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { ClassesPage } from './pages/teacher/ClassesPage';
import { ClassDetailPage } from './pages/teacher/ClassDetailPage';
import { StudentsPage } from './pages/teacher/StudentsPage';
import { AttendancePage } from './pages/teacher/AttendancePage';
import { AssignmentsPage } from './pages/teacher/AssignmentsPage';
import { GradesPage } from './pages/teacher/GradesPage';
import { ClassroomToolsPage } from './pages/teacher/ClassroomToolsPage';
import { AlertsPage } from './pages/teacher/AlertsPage';
import { AnnouncementsPage } from './pages/teacher/AnnouncementsPage';
import { AIAssistantPage } from './pages/teacher/AIAssistantPage';
import { ReportsPage } from './pages/teacher/ReportsPage';

// Other Portals
import { StudentDashboard } from './pages/student/StudentDashboard';
import { ParentDashboard } from './pages/parent/ParentDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';

// Index redirect based on active user role
const RootRedirect: React.FC = () => {
  const { user, role, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  if (role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
  if (role === 'PARENT') return <Navigate to="/parent/dashboard" replace />;
  return <Navigate to="/teacher/dashboard" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/403" element={<ForbiddenPage />} />

            {/* Protected App Shell */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              {/* TEACHER ROUTES */}
              <Route
                path="/teacher/dashboard"
                element={
                  <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                    <TeacherDashboard />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/classes"
                element={
                  <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                    <ClassesPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/classes/:id"
                element={
                  <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                    <ClassDetailPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/students"
                element={
                  <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                    <StudentsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/students/:id"
                element={
                  <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                    <StudentsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/attendance"
                element={
                  <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                    <AttendancePage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/assignments"
                element={
                  <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                    <AssignmentsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/quizzes"
                element={
                  <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                    <AssignmentsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/question-bank"
                element={
                  <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                    <AIAssistantPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/resources"
                element={
                  <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                    <AIAssistantPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/ai"
                element={
                  <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                    <AIAssistantPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/grades"
                element={
                  <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                    <GradesPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/attendance-analytics"
                element={
                  <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                    <ReportsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/behavior"
                element={
                  <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                    <ClassDetailPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/rewards"
                element={
                  <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                    <ClassDetailPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/alerts"
                element={
                  <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                    <AlertsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/tools"
                element={
                  <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                    <ClassroomToolsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/announcements"
                element={
                  <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                    <AnnouncementsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/reports"
                element={
                  <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                    <ReportsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/schedule"
                element={
                  <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                    <AttendancePage />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/profile"
                element={
                  <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                    <TeacherDashboard />
                  </RoleGuard>
                }
              />
              <Route
                path="/teacher/settings"
                element={
                  <RoleGuard allowedRoles={['TEACHER', 'ADMIN']}>
                    <TeacherDashboard />
                  </RoleGuard>
                }
              />

              {/* STUDENT ROUTES */}
              <Route
                path="/student/dashboard"
                element={
                  <RoleGuard allowedRoles={['STUDENT', 'ADMIN']}>
                    <StudentDashboard />
                  </RoleGuard>
                }
              />
              <Route
                path="/student/schedule"
                element={
                  <RoleGuard allowedRoles={['STUDENT', 'ADMIN']}>
                    <StudentDashboard />
                  </RoleGuard>
                }
              />
              <Route
                path="/student/assignments"
                element={
                  <RoleGuard allowedRoles={['STUDENT', 'ADMIN']}>
                    <StudentDashboard />
                  </RoleGuard>
                }
              />
              <Route
                path="/student/quizzes"
                element={
                  <RoleGuard allowedRoles={['STUDENT', 'ADMIN']}>
                    <StudentDashboard />
                  </RoleGuard>
                }
              />
              <Route
                path="/student/resources"
                element={
                  <RoleGuard allowedRoles={['STUDENT', 'ADMIN']}>
                    <StudentDashboard />
                  </RoleGuard>
                }
              />
              <Route
                path="/student/grades"
                element={
                  <RoleGuard allowedRoles={['STUDENT', 'ADMIN']}>
                    <StudentDashboard />
                  </RoleGuard>
                }
              />
              <Route
                path="/student/attendance"
                element={
                  <RoleGuard allowedRoles={['STUDENT', 'ADMIN']}>
                    <StudentDashboard />
                  </RoleGuard>
                }
              />
              <Route
                path="/student/achievements"
                element={
                  <RoleGuard allowedRoles={['STUDENT', 'ADMIN']}>
                    <StudentDashboard />
                  </RoleGuard>
                }
              />
              <Route
                path="/student/announcements"
                element={
                  <RoleGuard allowedRoles={['STUDENT', 'ADMIN']}>
                    <StudentDashboard />
                  </RoleGuard>
                }
              />
              <Route
                path="/student/profile"
                element={
                  <RoleGuard allowedRoles={['STUDENT', 'ADMIN']}>
                    <StudentDashboard />
                  </RoleGuard>
                }
              />

              {/* PARENT ROUTES */}
              <Route
                path="/parent/dashboard"
                element={
                  <RoleGuard allowedRoles={['PARENT', 'ADMIN']}>
                    <ParentDashboard />
                  </RoleGuard>
                }
              />
              <Route
                path="/parent/children"
                element={
                  <RoleGuard allowedRoles={['PARENT', 'ADMIN']}>
                    <ParentDashboard />
                  </RoleGuard>
                }
              />
              <Route
                path="/parent/grades"
                element={
                  <RoleGuard allowedRoles={['PARENT', 'ADMIN']}>
                    <ParentDashboard />
                  </RoleGuard>
                }
              />
              <Route
                path="/parent/attendance"
                element={
                  <RoleGuard allowedRoles={['PARENT', 'ADMIN']}>
                    <ParentDashboard />
                  </RoleGuard>
                }
              />
              <Route
                path="/parent/assignments"
                element={
                  <RoleGuard allowedRoles={['PARENT', 'ADMIN']}>
                    <ParentDashboard />
                  </RoleGuard>
                }
              />
              <Route
                path="/parent/comments"
                element={
                  <RoleGuard allowedRoles={['PARENT', 'ADMIN']}>
                    <ParentDashboard />
                  </RoleGuard>
                }
              />
              <Route
                path="/parent/schedule"
                element={
                  <RoleGuard allowedRoles={['PARENT', 'ADMIN']}>
                    <ParentDashboard />
                  </RoleGuard>
                }
              />
              <Route
                path="/parent/announcements"
                element={
                  <RoleGuard allowedRoles={['PARENT', 'ADMIN']}>
                    <ParentDashboard />
                  </RoleGuard>
                }
              />
              <Route
                path="/parent/messages"
                element={
                  <RoleGuard allowedRoles={['PARENT', 'ADMIN']}>
                    <ParentDashboard />
                  </RoleGuard>
                }
              />
              <Route
                path="/parent/profile"
                element={
                  <RoleGuard allowedRoles={['PARENT', 'ADMIN']}>
                    <ParentDashboard />
                  </RoleGuard>
                }
              />

              {/* ADMIN ROUTES */}
              <Route
                path="/admin/dashboard"
                element={
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/schools"
                element={
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/academic-years"
                element={
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/subjects"
                element={
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/classes"
                element={
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <ClassesPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/teachers"
                element={
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/students"
                element={
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <StudentsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/parents"
                element={
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/roles"
                element={
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/audit-logs"
                element={
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <ReportsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/admin/settings"
                element={
                  <RoleGuard allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </RoleGuard>
                }
              />
            </Route>

            {/* 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
