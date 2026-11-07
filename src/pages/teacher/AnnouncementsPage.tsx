import React, { useState } from 'react';
import { db } from '../../services/db';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Announcement } from '../../types';
import { Bell, Plus, Users, Send } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Modal } from '../../components/common/Modal';

export const AnnouncementsPage: React.FC = () => {
  const { user } = useAuth();
  const { success } = useToast();
  const classes = db.getClasses();

  const [announcements, setAnnouncements] = useState<Announcement[]>(db.getAnnouncements());
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formPriority, setFormPriority] = useState<'URGENT' | 'HIGH' | 'NORMAL'>('NORMAL');
  const [formTarget, setFormTarget] = useState<'ALL' | 'CLASS'>('ALL');
  const [formClassId, setFormClassId] = useState('class-9a1');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    const targetCls = classes.find(c => c.id === formClassId);

    const created = db.createAnnouncement({
      title: formTitle.trim(),
      content: formContent.trim(),
      priority: formPriority,
      targetType: formTarget,
      targetClassId: formTarget === 'CLASS' ? formClassId : undefined,
      targetClassName: formTarget === 'CLASS' ? targetCls?.name : undefined,
      authorName: user?.fullName || 'Cô Nguyễn Thu Hà',
      authorRole: 'Giáo viên',
      totalRecipients: formTarget === 'CLASS' ? targetCls?.studentCount || 12 : 50,
    });

    success(`Đã đăng thông báo "${created.title}" thành công!`);
    setIsCreateOpen(false);
    setFormTitle('');
    setFormContent('');
    setAnnouncements(db.getAnnouncements());
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Bảng tin & Thông báo"
        subtitle="Kênh phát thanh điện tử gửi tin tức, thông điệp đến học sinh và phụ huynh"
        breadcrumbs={[{ label: 'Thông báo' }]}
        actions={
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo thông báo mới</span>
          </button>
        }
      />

      <div className="space-y-4">
        {announcements.map(anc => (
          <div key={anc.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                  anc.priority === 'URGENT'
                    ? 'bg-rose-100 text-rose-700'
                    : anc.priority === 'HIGH'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {anc.priority === 'URGENT' ? 'Khẩn cấp' : anc.priority === 'HIGH' ? 'Quan trọng' : 'Thông thường'}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1.5">{anc.title}</h3>
              </div>
              <span className="text-xs text-slate-400">
                {new Date(anc.createdAt).toLocaleDateString('vi-VN')}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{anc.content}</p>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
              <span>Người đăng: {anc.authorName} ({anc.authorRole})</span>
              <span className="font-semibold text-blue-600">
                👥 Gửi tới: {anc.targetType === 'ALL' ? 'Toàn trường' : `Lớp ${anc.targetClassName}`}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Tạo thông báo mới">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề thông báo</label>
            <input
              type="text"
              required
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
              placeholder="VD: Lịch thi giữa kỳ I hoặc Họp phụ huynh"
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mức độ ưu tiên</label>
              <select
                value={formPriority}
                onChange={e => setFormPriority(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-white border rounded-xl"
              >
                <option value="NORMAL">Bình thường</option>
                <option value="HIGH">Quan trọng</option>
                <option value="URGENT">Khẩn cấp</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Đối tượng nhận</label>
              <select
                value={formTarget}
                onChange={e => setFormTarget(e.target.value as any)}
                className="w-full px-3 py-2 text-sm bg-white border rounded-xl"
              >
                <option value="ALL">Toàn trường</option>
                <option value="CLASS">Từng lớp cụ thể</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung thông báo</label>
            <textarea
              rows={4}
              required
              value={formContent}
              onChange={e => setFormContent(e.target.value)}
              placeholder="Nội dung chi tiết..."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 border rounded-xl text-xs font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
            >
              Phát thông báo
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
