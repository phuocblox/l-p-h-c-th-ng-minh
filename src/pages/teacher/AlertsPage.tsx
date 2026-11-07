import React, { useState } from 'react';
import { db } from '../../services/db';
import { useToast } from '../../contexts/ToastContext';
import { SystemAlert } from '../../types';
import { AlertTriangle, CheckCircle2, Clock, Eye, ShieldAlert } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusChip } from '../../components/common/StatusChip';

export const AlertsPage: React.FC = () => {
  const { success } = useToast();
  const [alerts, setAlerts] = useState<SystemAlert[]>(db.getAlerts());

  const handleUpdateStatus = (id: string, newStatus: SystemAlert['status']) => {
    db.updateAlertStatus(id, newStatus);
    setAlerts([...db.getAlerts()]);
    success('Đã cập nhật trạng thái cảnh báo!');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Trung tâm Cảnh báo Học tập & Chuyên cần"
        subtitle="Phát hiện sớm nguy cơ giảm sút điểm số, vắng muộn liên tục hoặc thiếu bài tập"
        breadcrumbs={[{ label: 'Cảnh báo' }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {alerts.map(alt => (
          <div
            key={alt.id}
            className={`p-5 rounded-2xl border shadow-2xs space-y-3 bg-white ${
              alt.severity === 'high' ? 'border-rose-200' : 'border-amber-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                alt.severity === 'high' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {alt.severity === 'high' ? 'CẦN XỬ LÝ GẤP' : 'CẦN CHÚ Ý'}
              </span>
              <StatusChip
                label={
                  alt.status === 'NEW'
                    ? 'Mới'
                    : alt.status === 'VIEWED'
                    ? 'Đã xem'
                    : alt.status === 'PROCESSING'
                    ? 'Đang xử lý'
                    : 'Đã giải quyết'
                }
                variant={alt.status === 'RESOLVED' ? 'success' : 'warning'}
                size="sm"
              />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">{alt.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{alt.message}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">{new Date(alt.createdAt).toLocaleTimeString('vi-VN')}</span>
              <div className="flex items-center gap-1.5">
                {alt.status !== 'RESOLVED' && (
                  <button
                    onClick={() => handleUpdateStatus(alt.id, 'RESOLVED')}
                    className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold text-[11px]"
                  >
                    ✓ Đã giải quyết
                  </button>
                )}
                {alt.status === 'NEW' && (
                  <button
                    onClick={() => handleUpdateStatus(alt.id, 'PROCESSING')}
                    className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold text-[11px]"
                  >
                    Đang xử lý
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
