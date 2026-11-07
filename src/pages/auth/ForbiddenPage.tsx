import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const ForbiddenPage: React.FC = () => {
  const navigate = useNavigate();
  const { role, switchRole } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-200 text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">403 - Quyền truy cập bị từ chối</h1>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Tài khoản của bạn với vai trò <span className="font-semibold text-slate-700">[{role}]</span> không có quyền truy cập vào phân hệ này.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={() => {
              if (role === 'ADMIN') navigate('/admin/dashboard');
              else if (role === 'STUDENT') navigate('/student/dashboard');
              else if (role === 'PARENT') navigate('/parent/dashboard');
              else navigate('/teacher/dashboard');
            }}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về trang chủ của bạn</span>
          </button>

          <button
            onClick={() => {
              switchRole('ADMIN');
              navigate('/admin/dashboard');
            }}
            className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors"
          >
            Chuyển sang vai trò Admin để kiểm tra
          </button>
        </div>
      </div>
    </div>
  );
};
