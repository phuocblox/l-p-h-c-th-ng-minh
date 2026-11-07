import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { UserRole } from '../../types';
import { GraduationCap, ArrowRight, Shield, User, HeartHandshake, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loginWithGoogle, demoAccounts, isLoading } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('TEACHER');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const ok = await loginWithGoogle();
      if (ok) {
        success('Đăng nhập Google Firebase thành công!');
        // Small delay to ensure state and router are ready
        setTimeout(() => {
          const saved = localStorage.getItem('smartclass_auth_user');
          if (saved) {
            try {
              const u = JSON.parse(saved);
              redirectUser(u.role || 'TEACHER');
              return;
            } catch {}
          }
          redirectUser('TEACHER');
        }, 150);
      }
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      if (firebaseError?.code === 'auth/popup-closed-by-user') {
        error('Cửa sổ đăng nhập Google đã được đóng trước khi hoàn tất.');
      } else {
        error(firebaseError?.message || 'Đăng nhập Google thất bại. Vui lòng thử lại!');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      error('Vui lòng nhập email đăng nhập!');
      return;
    }
    const ok = await login(email, selectedRole);
    if (ok) {
      success('Đăng nhập thành công!');
      redirectUser(selectedRole);
    }
  };

  const handleQuickLogin = async (account: typeof demoAccounts[0]) => {
    setEmail(account.email);
    setSelectedRole(account.role);
    const ok = await login(account.email, account.role);
    if (ok) {
      success(`Đăng nhập thành công với vai trò: ${account.label}`);
      redirectUser(account.role);
    }
  };

  const redirectUser = (role: UserRole) => {
    if (role === 'ADMIN') navigate('/admin/dashboard');
    else if (role === 'STUDENT') navigate('/student/dashboard');
    else if (role === 'PARENT') navigate('/parent/dashboard');
    else navigate('/teacher/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Left Branding Panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-8 sm:p-10 text-white flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 mb-6 shadow-inner">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight">SMART CLASS</h1>
            <p className="text-xs uppercase tracking-widest text-blue-200 font-semibold mt-1">
              Hệ thống Quản lý Lớp học Thông minh
            </p>
            <p className="text-sm text-blue-100/90 mt-4 leading-relaxed font-normal">
              Giải pháp số hóa toàn diện quy trình dạy và học dành cho Giáo viên, Học sinh, Phụ huynh và Nhà trường.
            </p>

            <div className="mt-8 space-y-3 text-xs text-blue-100">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <span>Điểm danh 1 chạm & Phân tích chuyên cần</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <span>Giao bài tập, chấm điểm và ngân hàng đề thi</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <span>Cổng thông tin riêng cho Phụ huynh & Học sinh</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-300 flex-shrink-0" />
                <span>Báo cáo học tập & Cảnh báo tức thì</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 text-[11px] text-blue-200">
            Năm học 2026 - 2027 • Trường THCS Chu Văn An
          </div>
        </div>

        {/* Right Form & Quick Access Panel */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-slate-50/50">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Đăng nhập tài khoản</h2>
            <p className="text-xs text-slate-500 mt-1">
              Đăng nhập qua Google Firebase hoặc chọn tài khoản trải nghiệm hệ thống:
            </p>
          </div>

          {/* Firebase Google Auth Button */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading || isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-2xl border border-slate-300 shadow-xs hover:shadow-md transition-all cursor-pointer group disabled:opacity-60"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isGoogleLoading ? 'Đang kết nối Firebase...' : 'Đăng nhập bằng tài khoản Google'}</span>
              <span className="ml-auto text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full border border-blue-200">
                Firebase
              </span>
            </button>
          </div>

          <div className="relative flex py-1 items-center mb-4">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              Hoặc đăng nhập nhanh 1-Click
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Quick Demo Logins Grid */}
          <div className="mb-6">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Tài khoản thử nghiệm tức thì:
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {demoAccounts.map(account => {
                const Icon =
                  account.role === 'ADMIN'
                    ? Shield
                    : account.role === 'PARENT'
                    ? HeartHandshake
                    : account.role === 'STUDENT'
                    ? User
                    : GraduationCap;

                const bgColors =
                  account.role === 'TEACHER'
                    ? 'border-blue-300 hover:bg-blue-50/80 text-blue-900'
                    : account.role === 'STUDENT'
                    ? 'border-emerald-300 hover:bg-emerald-50/80 text-emerald-900'
                    : account.role === 'PARENT'
                    ? 'border-purple-300 hover:bg-purple-50/80 text-purple-900'
                    : 'border-slate-300 hover:bg-slate-100 text-slate-900';

                return (
                  <button
                    key={account.role}
                    type="button"
                    onClick={() => handleQuickLogin(account)}
                    className={`flex items-start gap-2.5 p-3 rounded-2xl border bg-white shadow-2xs hover:shadow-xs transition-all text-left cursor-pointer group ${bgColors}`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4 text-slate-700" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{account.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">{account.label}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-slate-400 text-[11px] uppercase font-semibold">
              Hoặc đăng nhập bằng email
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Standard Form */}
          <form onSubmit={handleCustomLogin} className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Địa chỉ Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="teacher@smartclass.edu.vn"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">Mật khẩu</label>
                <a href="#forgot" className="text-xs text-blue-600 hover:underline">
                  Quên mật khẩu?
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Đang xác thực...' : 'Đăng nhập hệ thống'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
