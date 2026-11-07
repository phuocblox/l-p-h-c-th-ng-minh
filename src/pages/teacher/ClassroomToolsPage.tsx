import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db } from '../../services/db';
import { Student } from '../../types';
import { useToast } from '../../contexts/ToastContext';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Users,
  Timer,
  RotateCw,
  Shuffle,
  Volume2,
  Maximize2,
  Check,
  Award,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';

export const ClassroomToolsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { success } = useToast();

  const classes = db.getClasses();
  const [selectedClassId, setSelectedClassId] = useState(
    searchParams.get('classId') || classes[0]?.id || 'class-9a1'
  );

  const [students, setStudents] = useState<Student[]>([]);
  const [activeTool, setActiveTool] = useState<'wheel' | 'random' | 'groups' | 'timer'>('wheel');

  useEffect(() => {
    setStudents(db.getStudents(selectedClassId));
  }, [selectedClassId]);

  // --- LUCKY WHEEL STATE ---
  const [spinning, setSpinning] = useState(false);
  const [wheelWinner, setWheelWinner] = useState<string | null>(null);
  const [wheelRotation, setWheelRotation] = useState(0);

  const handleSpinWheel = () => {
    if (spinning || students.length === 0) return;
    setSpinning(true);
    setWheelWinner(null);

    const winnerIndex = Math.floor(Math.random() * students.length);
    const degreesPerSlice = 360 / students.length;
    // Calculate rotation: at least 5 full rotations + slice offset
    const randomExtra = 360 * 5 + (360 - winnerIndex * degreesPerSlice - degreesPerSlice / 2);
    const newRotation = wheelRotation + randomExtra;

    setWheelRotation(newRotation);

    setTimeout(() => {
      setSpinning(false);
      const winner = students[winnerIndex];
      setWheelWinner(winner.fullName);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      success(`🎉 Chúc mừng học sinh: ${winner.fullName}!`);
    }, 4000);
  };

  // --- RANDOM STUDENT PICKER STATE ---
  const [pickedStudent, setPickedStudent] = useState<Student | null>(null);
  const [avoidRepeat, setAvoidRepeat] = useState(true);
  const [calledHistory, setCalledHistory] = useState<Student[]>([]);

  const handlePickRandomStudent = () => {
    const available = avoidRepeat
      ? students.filter(s => !calledHistory.some(h => h.id === s.id))
      : students;

    const pool = available.length > 0 ? available : students;
    if (pool.length === 0) return;

    const chosen = pool[Math.floor(Math.random() * pool.length)];
    setPickedStudent(chosen);
    setCalledHistory(prev => [chosen, ...prev]);

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
    });
  };

  // --- GROUP MAKER STATE ---
  const [numGroups, setNumGroups] = useState(3);
  const [generatedGroups, setGeneratedGroups] = useState<{ id: number; name: string; members: Student[] }[]>([]);

  const handleGenerateGroups = () => {
    const shuffled = [...students].sort(() => 0.5 - Math.random());
    const groups: { id: number; name: string; members: Student[] }[] = Array.from(
      { length: numGroups },
      (_, i) => ({
        id: i + 1,
        name: `Nhóm ${i + 1}`,
        members: [],
      })
    );

    shuffled.forEach((student, index) => {
      groups[index % numGroups].members.push(student);
    });

    setGeneratedGroups(groups);
    success(`Đã chia ngẫu nhiên ${students.length} học sinh thành ${numGroups} nhóm!`);
  };

  // --- COUNTDOWN TIMER STATE ---
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(300);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = setInterval(() => {
        setTimerSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current);
            setIsTimerRunning(false);
            confetti();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning]);

  const handleStartTimer = (mins: number) => {
    setTimerMinutes(mins);
    setTimerSecondsLeft(mins * 60);
    setIsTimerRunning(true);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Công cụ Lớp học (Tool Hub)"
        subtitle="Bộ tiện ích hỗ trợ giảng dạy trực tiếp: Vòng quay may mắn, Gọi học sinh ngẫu nhiên, Chia nhóm và Đồng hồ đếm ngược"
        breadcrumbs={[{ label: 'Công cụ lớp học' }]}
        actions={
          <div className="flex items-center gap-2">
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>
                  Dùng danh sách: Lớp {c.name} ({c.studentCount || 12} HS)
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* Tool Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveTool('wheel')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
            activeTool === 'wheel'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            activeTool === 'wheel' ? 'bg-white/20' : 'bg-blue-50 text-blue-600'
          }`}>
            <RotateCw className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold">Vòng quay may mắn</p>
            <p className={`text-[10px] ${activeTool === 'wheel' ? 'text-blue-100' : 'text-slate-500'}`}>
              Quay trúng tên học sinh
            </p>
          </div>
        </button>

        <button
          onClick={() => setActiveTool('random')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
            activeTool === 'random'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            activeTool === 'random' ? 'bg-white/20' : 'bg-emerald-50 text-emerald-600'
          }`}>
            <Shuffle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold">Gọi số ngẫu nhiên</p>
            <p className={`text-[10px] ${activeTool === 'random' ? 'text-blue-100' : 'text-slate-500'}`}>
              Tránh lặp & Lịch sử gọi
            </p>
          </div>
        </button>

        <button
          onClick={() => setActiveTool('groups')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
            activeTool === 'groups'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            activeTool === 'groups' ? 'bg-white/20' : 'bg-purple-50 text-purple-600'
          }`}>
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold">Chia nhóm thảo luận</p>
            <p className={`text-[10px] ${activeTool === 'groups' ? 'text-blue-100' : 'text-slate-500'}`}>
              Chia 2, 3, 4 tổ ngẫu nhiên
            </p>
          </div>
        </button>

        <button
          onClick={() => setActiveTool('timer')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
            activeTool === 'timer'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            activeTool === 'timer' ? 'bg-white/20' : 'bg-amber-50 text-amber-600'
          }`}>
            <Timer className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold">Đồng hồ đếm ngược</p>
            <p className={`text-[10px] ${activeTool === 'timer' ? 'text-blue-100' : 'text-slate-500'}`}>
              Làm bài & Hoạt động nhóm
            </p>
          </div>
        </button>
      </div>

      {/* TOOL 1: LUCKY WHEEL */}
      {activeTool === 'wheel' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs flex flex-col items-center">
          <div className="relative mb-6">
            {/* Pointer Indicator */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-rose-600 drop-shadow-md" />

            {/* Simulated Dynamic CSS Wheel */}
            <div
              className="w-72 h-72 sm:w-80 sm:h-80 rounded-full border-8 border-slate-800 shadow-2xl relative overflow-hidden flex items-center justify-center transition-transform duration-[4000ms] ease-out"
              style={{
                transform: `rotate(${wheelRotation}deg)`,
                background: `conic-gradient(
                  #2563EB 0deg 30deg, #7C3AED 30deg 60deg, #10B981 60deg 90deg, #F59E0B 90deg 120deg,
                  #EF4444 120deg 150deg, #06B6D4 150deg 180deg, #EC4899 180deg 210deg, #8B5CF6 210deg 240deg,
                  #14B8A6 240deg 270deg, #F97316 270deg 300deg, #3B82F6 300deg 330deg, #6366F1 330deg 360deg
                )`,
              }}
            >
              {/* Center Hub */}
              <div className="w-16 h-16 rounded-full bg-white border-4 border-slate-800 shadow-inner flex items-center justify-center z-10">
                <Sparkles className="w-6 h-6 text-amber-500 animate-spin" />
              </div>
            </div>
          </div>

          {wheelWinner && (
            <div className="text-center p-4 bg-emerald-50 rounded-2xl border border-emerald-200 mb-6 animate-in zoom-in-95">
              <span className="text-xs uppercase font-bold text-emerald-600 tracking-wider">
                Người chiến thắng lượt quay:
              </span>
              <h2 className="text-2xl font-black text-emerald-900 mt-1">🎉 {wheelWinner} 🎉</h2>
            </div>
          )}

          <button
            type="button"
            disabled={spinning}
            onClick={handleSpinWheel}
            className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-blue-500/25 transition-all transform active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {spinning ? 'ĐANG QUAY...' : 'QUAY NGAY 🎲'}
          </button>
        </div>
      )}

      {/* TOOL 2: RANDOM STUDENT PICKER */}
      {activeTool === 'random' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs flex flex-col items-center justify-center text-center">
            {pickedStudent ? (
              <div className="space-y-4 mb-6 animate-in zoom-in-95">
                <img
                  src={pickedStudent.avatarUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80'}
                  alt={pickedStudent.fullName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-500 shadow-xl mx-auto"
                />
                <div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">
                    Mã HS: {pickedStudent.studentCode} • {pickedStudent.teamGroup}
                  </span>
                  <h2 className="text-3xl font-black text-slate-900 mt-2">{pickedStudent.fullName}</h2>
                </div>
              </div>
            ) : (
              <div className="py-12 text-slate-400">
                <Shuffle className="w-16 h-16 mx-auto mb-3 opacity-40" />
                <p className="text-sm font-semibold">Nhấn nút bên dưới để chọn ngẫu nhiên một bạn lên bảng</p>
              </div>
            )}

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={avoidRepeat}
                  onChange={e => setAvoidRepeat(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>Tránh gọi lặp lại bạn đã gọi</span>
              </label>

              <button
                onClick={handlePickRandomStudent}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                Chọn bạn tiếp theo 🎲
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Lịch sử lượt gọi ({calledHistory.length})</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {calledHistory.map((h, i) => (
                <div key={i} className="p-2.5 bg-slate-50 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">{h.fullName}</span>
                  <span className="text-slate-400 text-[10px]">{h.teamGroup}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TOOL 3: GROUP MAKER */}
      {activeTool === 'groups' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700">Số lượng nhóm muốn chia:</span>
              {[2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onClick={() => setNumGroups(n)}
                  className={`w-9 h-9 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                    numGroups === n ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerateGroups}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              Tạo nhóm ngẫu nhiên
            </button>
          </div>

          {generatedGroups.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {generatedGroups.map(grp => (
                <div key={grp.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="font-bold text-xs text-purple-700">{grp.name}</span>
                    <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-md text-slate-600">
                      {grp.members.length} thành viên
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-xs">
                    {grp.members.map(m => (
                      <li key={m.id} className="font-medium text-slate-800 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        {m.fullName}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TOOL 4: COUNTDOWN TIMER */}
      {activeTool === 'timer' && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-2xs flex flex-col items-center justify-center text-center">
          <div className="text-6xl sm:text-7xl font-mono font-black text-slate-900 tracking-tight mb-6">
            {formatTimer(timerSecondsLeft)}
          </div>

          <div className="flex items-center gap-3 mb-6">
            {[1, 3, 5, 10, 15].map(m => (
              <button
                key={m}
                onClick={() => handleStartTimer(m)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  timerMinutes === m ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {m} phút
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isTimerRunning ? 'Tạm dừng' : 'Bắt đầu'}</span>
            </button>
            <button
              onClick={() => {
                setIsTimerRunning(false);
                setTimerSecondsLeft(timerMinutes * 60);
              }}
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
              title="Đặt lại"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
