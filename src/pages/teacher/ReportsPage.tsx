import React, { useState } from 'react';
import { db } from '../../services/db';
import { useToast } from '../../contexts/ToastContext';
import { Printer, Download, BarChart2, TrendingUp, Users, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatCard } from '../../components/common/StatCard';

export const ReportsPage: React.FC = () => {
  const { success } = useToast();
  const classes = db.getClasses();
  const [selectedClassId, setSelectedClassId] = useState('class-9a1');

  const students = db.getStudents(selectedClassId);
  const currentClass = classes.find(c => c.id === selectedClassId) || classes[0];

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    success(`Đã xuất báo cáo tổng hợp lớp ${currentClass?.name}!`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Trung tâm Báo cáo & Thống kê"
        subtitle="Báo cáo kết quả học tập, phân bố điểm số và tình hình chuyên cần của các lớp"
        breadcrumbs={[{ label: 'Báo cáo' }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>In báo cáo</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Xuất PDF / Excel</span>
            </button>
          </div>
        }
      />

      {/* Class filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Xem báo cáo lớp:</span>
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border rounded-xl font-bold text-slate-800"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                Lớp {c.name} ({c.roomNumber})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Sĩ số lớp" value={`${students.length} HS`} icon={Users} color="blue" />
        <StatCard title="Điểm TB Lớp" value="8.5 / 10" icon={TrendingUp} color="emerald" />
        <StatCard title="Tỷ lệ Chuyên cần" value="98.5%" icon={CheckCircle2} color="purple" />
        <StatCard title="Xếp loại Giỏi" value="83.3%" icon={BarChart2} color="amber" />
      </div>

      {/* Distribution visual */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Phân bố Học lực học kỳ I - Lớp {currentClass?.name}</h3>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-emerald-700">Xuất sắc & Giỏi (8.0 - 10.0)</span>
              <span>10 học sinh (83%)</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '83%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-blue-700">Khá (6.5 - 7.9)</span>
              <span>2 học sinh (17%)</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: '17%' }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-amber-700">Trung bình (5.0 - 6.4)</span>
              <span>0 học sinh (0%)</span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '0%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
