import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { db } from '../../services/db';
import { GradeItem, Student, StudentGrade } from '../../types';
import {
  BarChart2,
  Save,
  Download,
  Filter,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';

export const GradesPage: React.FC = () => {
  const { user } = useAuth();
  const { success } = useToast();

  const classes = db.getClasses();
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id || 'class-9a1');

  const [students, setStudents] = useState<Student[]>([]);
  const [gradeItems, setGradeItems] = useState<GradeItem[]>([]);
  const [gradeMatrix, setGradeMatrix] = useState<Record<string, Record<string, number | null>>>({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const stds = db.getStudents(selectedClassId);
    setStudents(stds);

    const items = db.getGradeItems(selectedClassId);
    setGradeItems(items);

    const existingGrades = db.getStudentGrades(selectedClassId);
    const matrix: Record<string, Record<string, number | null>> = {};

    stds.forEach(s => {
      matrix[s.id] = {};
      items.forEach(item => {
        const found = existingGrades.find(g => g.studentId === s.id && g.gradeItemId === item.id);
        matrix[s.id][item.id] = found ? found.score : null;
      });
    });

    setGradeMatrix(matrix);
    setIsDirty(false);
  }, [selectedClassId]);

  const handleCellChange = (studentId: string, itemId: string, val: string) => {
    const num = val === '' ? null : Number(val);
    if (num !== null && (num < 0 || num > 10)) return;

    setGradeMatrix(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [itemId]: num,
      },
    }));
    setIsDirty(true);
  };

  const handleSaveGrades = () => {
    const batch: { gradeItemId: string; studentId: string; score: number | null }[] = [];

    Object.entries(gradeMatrix).forEach(([studentId, items]) => {
      Object.entries(items).forEach(([gradeItemId, score]) => {
        batch.push({ studentId, gradeItemId, score });
      });
    });

    db.saveBatchGrades(batch);
    db.logAction(
      user?.id || 'sys',
      user?.fullName || 'Teacher',
      user?.role,
      'Cập nhật sổ điểm',
      'Gradebook',
      selectedClassId,
      `Đã cập nhật bảng điểm môn Toán cho ${students.length} học sinh`
    );

    setIsDirty(false);
    success('Đã lưu thành công toàn bộ sổ điểm!');
  };

  const handleExportCSV = () => {
    let csv = 'STT,Họ và tên,' + gradeItems.map(i => i.name).join(',') + ',Điểm TB\n';
    students.forEach(s => {
      let totalW = 0;
      let totalS = 0;
      const scores = gradeItems.map(item => {
        const sc = gradeMatrix[s.id]?.[item.id] ?? '';
        if (sc !== '') {
          totalS += Number(sc) * item.weight;
          totalW += item.weight;
        }
        return sc;
      });
      const gpa = totalW > 0 ? (Math.round((totalS / totalW) * 10) / 10).toFixed(1) : '';
      csv += `${s.orderNumber},"${s.fullName}",${scores.join(',')},${gpa}\n`;
    });

    const encoded = encodeURI('data:text/csv;charset=utf-8,' + csv);
    const a = document.createElement('a');
    a.href = encoded;
    a.download = `Bang_diem_lop_${selectedClassId}_SmartClass.csv`;
    a.click();
    success('Đã xuất file bảng điểm thành công!');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Sổ điểm Điện tử"
        subtitle="Bảng điểm chuẩn theo thang điểm 10, tự động tính điểm trung bình môn học theo hệ số"
        breadcrumbs={[{ label: 'Sổ điểm' }]}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Xuất Excel / CSV</span>
            </button>
            <button
              onClick={handleSaveGrades}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Lưu bảng điểm</span>
            </button>
          </div>
        }
      />

      {/* Class filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-700">Lớp học:</span>
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-blue-500"
          >
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                Lớp {c.name} ({c.studentCount || 12} HS)
              </option>
            ))}
          </select>
        </div>

        {isDirty && (
          <span className="text-xs text-amber-600 font-bold flex items-center gap-1">
            <AlertCircle className="w-4 h-4" /> Có thay đổi điểm chưa lưu
          </span>
        )}
      </div>

      {/* Spreadsheet Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3 w-12 text-center">STT</th>
                <th className="p-3 min-w-[160px]">Họ và tên học sinh</th>
                {gradeItems.map(item => (
                  <th key={item.id} className="p-3 text-center min-w-[100px]">
                    <div>{item.name}</div>
                    <span className="text-[10px] text-slate-400 font-normal">Hệ số {item.weight}</span>
                  </th>
                ))}
                <th className="p-3 text-center min-w-[90px] bg-blue-50/50 text-blue-800">ĐTB Môn</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map(s => {
                let totalScore = 0;
                let totalWeight = 0;

                gradeItems.forEach(item => {
                  const val = gradeMatrix[s.id]?.[item.id];
                  if (val !== null && val !== undefined) {
                    totalScore += val * item.weight;
                    totalWeight += item.weight;
                  }
                });

                const average = totalWeight > 0 ? (totalScore / totalWeight).toFixed(1) : '-';

                return (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 text-center font-bold text-slate-400">{s.orderNumber}</td>
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{s.fullName}</p>
                      <p className="text-[10px] text-slate-400">{s.studentCode}</p>
                    </td>

                    {gradeItems.map(item => {
                      const val = gradeMatrix[s.id]?.[item.id] ?? '';
                      return (
                        <td key={item.id} className="p-2 text-center">
                          <input
                            type="number"
                            step="0.25"
                            min="0"
                            max="10"
                            value={val}
                            onChange={e => handleCellChange(s.id, item.id, e.target.value)}
                            className="w-16 px-2 py-1.5 text-center text-xs font-bold text-slate-800 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </td>
                      );
                    })}

                    <td className="p-3 text-center bg-blue-50/30">
                      <span className="font-black text-sm text-blue-700">{average}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
