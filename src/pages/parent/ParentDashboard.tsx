import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { db } from '../../services/db';
import {
  HeartHandshake,
  CheckCircle2,
  AlertTriangle,
  Award,
  Send,
  MessageCircle,
  Clock,
  Phone,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';

export const ParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { success } = useToast();

  const student = db.getStudents().find(s => s.id === 'std-01') || db.getStudents()[0];
  const announcements = db.getAnnouncements();

  // Chat message state
  const [messages, setMessages] = useState([
    { sender: 'teacher', text: 'Chào anh Hùng, hôm nay em Long phát biểu rất tích cực và được cộng 5 điểm thi đua nhé!', time: '09:30' },
    { sender: 'parent', text: 'Dạ cảm ơn cô Hà nhiều, gia đình sẽ tiếp tục động viên cháu ôn tập thêm phần hình học ạ.', time: '10:15' },
  ]);
  const [msgInput, setMsgInput] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim()) return;

    setMessages(prev => [
      ...prev,
      { sender: 'parent', text: msgInput.trim(), time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) },
    ]);
    setMsgInput('');
    success('Đã gửi tin nhắn đến cô giáo chủ nhiệm!');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Parent Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-500/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider">
              Cổng Phụ Huynh • Niên Khóa 2026 - 2027
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-2">
              Kính chào Phụ huynh em {student.fullName}! 👨‍👩‍👧
            </h1>
            <p className="text-xs sm:text-sm text-purple-100 mt-1">
              Theo dõi tình hình học tập, điểm danh và kết nối trực tiếp cùng Cô Nguyễn Thu Hà (GVCN 9A1).
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center">
            <span className="text-[11px] text-purple-100 uppercase font-bold">Hạnh kiểm học kỳ I</span>
            <p className="text-2xl font-black text-emerald-300 mt-0.5">TỐT</p>
          </div>
        </div>
      </div>

      {/* Quick KPI stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Điểm TB của con</span>
          <h3 className="text-2xl font-bold text-purple-600 mt-1">{student.gpa} / 10</h3>
          <p className="text-[11px] text-slate-500 mt-1">Xếp loại giỏi môn Toán</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Chuyên cần hôm nay</span>
          <h3 className="text-2xl font-bold text-emerald-600 mt-1">Có mặt</h3>
          <p className="text-[11px] text-slate-500 mt-1">Vào lớp đúng giờ (07:15)</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Điểm rèn luyện thi đua</span>
          <h3 className="text-2xl font-bold text-amber-500 mt-1">+{student.rewardPoints} pts</h3>
          <p className="text-[11px] text-slate-500 mt-1">Hăng hái xây dựng bài</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 font-medium">Bài tập cần làm</span>
          <h3 className="text-2xl font-bold text-blue-600 mt-1">1 bài</h3>
          <p className="text-[11px] text-slate-500 mt-1">Hạn nộp tối mai 22h</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Chat with teacher (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2.5">
                <img
                  src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80"
                  alt="Cô Hà"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Cô Nguyễn Thu Hà</h3>
                  <p className="text-[11px] text-emerald-600 font-medium">● Đang trực tuyến • GVCN Lớp 9A1</p>
                </div>
              </div>
              <a
                href="tel:0912345678"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                title="Gọi điện"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>

            {/* Messages body */}
            <div className="space-y-3 max-h-72 overflow-y-auto p-2">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${m.sender === 'parent' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-xs p-3 rounded-2xl text-xs ${
                      m.sender === 'parent'
                        ? 'bg-purple-600 text-white rounded-br-none'
                        : 'bg-slate-100 text-slate-800 rounded-bl-none'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5">{m.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chat input */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-3 border-t border-slate-100 mt-3">
            <input
              type="text"
              value={msgInput}
              onChange={e => setMsgInput(e.target.value)}
              placeholder="Nhắn tin riêng gửi cô giáo..."
              className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Gửi</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Right: School Announcements (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Thông báo gửi phụ huynh</h3>
          <div className="space-y-3">
            {announcements.map(anc => (
              <div key={anc.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <span className="font-bold text-slate-800">{anc.title}</span>
                <p className="text-slate-600 leading-relaxed text-[11px]">{anc.content}</p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">{new Date(anc.createdAt).toLocaleDateString('vi-VN')}</span>
                  <button
                    onClick={() => success('Đã xác nhận "Tôi đã đọc" thông báo!')}
                    className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-purple-50 text-purple-700 font-semibold rounded-lg text-[10px] transition-colors"
                  >
                    ✓ Tôi đã đọc
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
