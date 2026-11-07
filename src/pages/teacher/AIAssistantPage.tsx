import React, { useState } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { Sparkles, Copy, Check, BookOpen, Send, Lightbulb, RefreshCw } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';

export const AIAssistantPage: React.FC = () => {
  const { success } = useToast();
  const [activeMode, setActiveMode] = useState<'quiz' | 'remarks' | 'lesson'>('quiz');

  // Input states
  const [topic, setTopic] = useState('Định lý Vi-ét và dấu các nghiệm phương trình bậc hai');
  const [difficulty, setDifficulty] = useState('Thông hiểu & Vận dụng');
  const [studentName, setStudentName] = useState('Lê Hoàng Long');
  const [studentTraits, setStudentTraits] = useState('Chăm chỉ, hăng hái phát biểu, môn Hình học còn hơi ẩu khi vẽ hình');

  const [isLoading, setIsLoading] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (activeMode === 'quiz') {
        setGeneratedOutput(
`[BỘ CÂU HỎI TRẮC NGHIỆM GỢI Ý BỞI TRỢ LÝ AI]
Chủ đề: ${topic}
Mức độ: ${difficulty}

Câu 1: Cho phương trình bậc hai x² - 5x + 6 = 0 có hai nghiệm x1, x2. Giá trị của biểu thức P = x1² + x2² bằng:
A. 13   (Đáp án đúng: vì x1+x2=5, x1x2=6 => P = 5² - 2*6 = 13)
B. 25
C. 19
D. 12

Câu 2: Phương trình ax² + bx + c = 0 (a ≠ 0) có hai nghiệm trái dấu khi và chỉ khi:
A. ac < 0  (Đáp án đúng)
B. Δ > 0 và P > 0
C. Δ > 0 và S > 0
D. b² - 4ac = 0

Câu 3 (Vận dụng): Tìm m để phương trình x² - 2(m-1)x + m² - 3 = 0 có hai nghiệm phân biệt x1, x2 thỏa mãn x1 + x2 = 6:
A. m = 4  (Đáp án đúng)
B. m = 2
C. m = 3
D. m = -4

*Giáo viên có thể chỉnh sửa và duyệt nội dung trước khi đưa vào ngân hàng đề thi.`
        );
      } else if (activeMode === 'remarks') {
        setGeneratedOutput(
`[GỢI Ý LỜI NHẬN XÉT HỌC BẠ / SỔ LIÊN LẠC ĐIỆN TỬ]
Học sinh: ${studentName}

1. Lựa chọn khen ngợi & động viên (Khuyên dùng):
"Em ${studentName} có ý thức học tập rất tốt, luôn chủ động chuẩn bị bài và tích cực phát biểu xây dựng bài trong các tiết học Toán. Tư duy logic tốt, điểm số ổn định. Em cần chú ý rèn luyện tính cẩn thận và trau chuốt hơn trong khâu vẽ hình hình học để đạt kết quả xuất sắc toàn diện."

2. Lựa chọn ngắn gọn (Sổ điểm danh bạ):
"Học sinh ngoan, chăm chỉ, tiếp thu bài nhanh và đóng góp sôi nổi cho phong trào thi đua của lớp 9A1."`
        );
      } else {
        setGeneratedOutput(
`[GỢI Ý DÀN Ý GIÁO ÁN & PHIẾU HỌC TẬP 15 PHÚT]
Chủ đề: ${topic}

I. Mục tiêu bài dạy:
1. Kiến thức: Học sinh nhớ và áp dụng thành thạo hệ thức Vi-ét cho nghiệm phương trình bậc hai.
2. Kỹ năng: Nhẩm nghiệm nhanh trong các trường hợp đặc biệt a + b + c = 0 và a - b + c = 0.
3. Phẩm chất: Rèn luyện tính kiên trì, tư duy phản biện.

II. Hoạt động khởi động (5 phút):
- Trò chơi "Ai nhanh hơn": Nhẩm nhanh hai nghiệm của phương trình x² - 7x + 12 = 0.`
        );
      }
      success('Trợ lý AI đã soạn thảo nội dung thành công!');
    }, 800);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedOutput);
    setCopied(true);
    success('Đã sao chép nội dung vào bộ nhớ tạm!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Trợ lý AI Hỗ trợ Giảng dạy"
        subtitle="Soạn đề thi trắc nghiệm, gợi ý nhận xét học bạ cá nhân hóa và tóm tắt giáo án"
        breadcrumbs={[{ label: 'Trợ lý AI' }]}
      />

      {/* Mode switcher tabs */}
      <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-2xs max-w-lg">
        <button
          onClick={() => {
            setActiveMode('quiz');
            setGeneratedOutput('');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeMode === 'quiz' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          🎲 Soạn câu hỏi & Quiz
        </button>
        <button
          onClick={() => {
            setActiveMode('remarks');
            setGeneratedOutput('');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeMode === 'remarks' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ✍️ Gợi ý nhận xét học bạ
        </button>
        <button
          onClick={() => {
            setActiveMode('lesson');
            setGeneratedOutput('');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeMode === 'lesson' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📖 Khung giáo án
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Inputs (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Thiết lập yêu cầu cho AI</h3>

          {activeMode === 'quiz' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chủ đề câu hỏi</label>
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mức độ nhận thức</label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl"
                >
                  <option value="Nhận biết & Thông hiểu">Nhận biết & Thông hiểu</option>
                  <option value="Thông hiểu & Vận dụng">Thông hiểu & Vận dụng</option>
                  <option value="Vận dụng cao">Vận dụng cao (Phân hóa học sinh giỏi)</option>
                </select>
              </div>
            </>
          )}

          {activeMode === 'remarks' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên học sinh</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Đặc điểm / Ghi chú</label>
                <textarea
                  rows={3}
                  value={studentTraits}
                  onChange={e => setStudentTraits(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border rounded-xl"
                />
              </div>
            </>
          )}

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{isLoading ? 'Đang phân tích & tạo...' : 'Tạo nội dung thông minh'}</span>
          </button>
        </div>

        {/* Right Output (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b mb-3">
              <h3 className="text-sm font-bold text-slate-900">Kết quả gợi ý</h3>
              {generatedOutput && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Đã chép' : 'Sao chép'}</span>
                </button>
              )}
            </div>

            {generatedOutput ? (
              <textarea
                rows={14}
                value={generatedOutput}
                onChange={e => setGeneratedOutput(e.target.value)}
                className="w-full p-3 font-mono text-xs bg-slate-50 border rounded-xl text-slate-800 leading-relaxed focus:outline-none"
              />
            ) : (
              <div className="py-20 text-center text-slate-400 text-xs">
                <Lightbulb className="w-10 h-10 mx-auto mb-2 opacity-40 text-amber-500" />
                <p>Nội dung tạo bởi AI sẽ hiển thị ở đây. Giáo viên luôn có thể chỉnh sửa trước khi lưu.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
