import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import {
  BookOpen,
  Star,
  MessageSquare,
  Send,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Lightbulb,
} from 'lucide-react';
import { formatDate, weekdayName } from '@/utils/date';
import clsx from 'clsx';

const tagPool = [
  '内容充实', '氛围很好', '嘉宾专业', '场地舒适',
  '结交朋友', '收获满满', '时间合理', '推荐给朋友',
  '节奏稍快', '讨论深入', '准备不足', '物料齐全',
];

export function PublicFeedback() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const event = useAppStore((s) => s.getEvent(eventId!));
  const regs = useAppStore((s) => s.getEventRegistrations(eventId!));
  const addFeedback = useAppStore((s) => s.addFeedback);

  const [step, setStep] = useState<'verify' | 'form' | 'success'>('verify');
  const [phone, setPhone] = useState('');
  const [verifyErr, setVerifyErr] = useState('');

  const [rating, setRating] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [content, setContent] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);

  const matched = useMemo(
    () => regs.find((r) => r.customFields.phone?.replace(/\D/g, '') === phone.replace(/\D/g, '')),
    [regs, phone]
  );

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-paper-100 via-paper-50 to-paper-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lift border border-paper-200 p-8 text-center">
          <XCircle className="w-16 h-16 mx-auto text-red-400 mb-5" />
          <h2 className="font-serif text-2xl font-semibold text-espresso-800 mb-2">活动不存在</h2>
          <p className="text-espresso-500 mb-6">该活动可能已被删除或链接无效</p>
          <button onClick={() => navigate('/events')} className="btn-primary">返回</button>
        </div>
      </div>
    );
  }

  const handleVerify = () => {
    const clean = phone.replace(/\D/g, '');
    if (!/^1[3-9]\d{9}$/.test(clean)) {
      setVerifyErr('请输入正确的手机号');
      return;
    }
    const m = regs.find((r) => r.customFields.phone?.replace(/\D/g, '') === clean);
    if (!m) {
      setVerifyErr('未找到您的报名记录，仅参与书友可提交反馈');
      return;
    }
    if (m.status !== 'checked_in') {
      setVerifyErr('您尚未完成现场签到，无法提交本次反馈');
      return;
    }
    setStep('form');
  };

  const toggleTag = (t: string) => {
    setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t]);
  };

  const handleSubmit = () => {
    if (rating === 0) {
      alert('请选择本次活动的综合评分');
      return;
    }
    const clean = phone.replace(/\D/g, '');
    const m = regs.find((r) => r.customFields.phone?.replace(/\D/g, '') === clean);
    if (!m) return;
    addFeedback({
      eventId: event.id,
      participantId: m.participantId,
      registrationId: m.id,
      rating,
      content: content.trim(),
      suggestions: suggestions.trim(),
      tags,
      wouldRecommend: wouldRecommend ?? undefined,
    });
    setStep('success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-paper-100 via-paper-50 to-paper-100">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-espresso-500 hover:text-ink-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> 返回
        </button>

        <div className="bg-white rounded-2xl shadow-lift border border-paper-200 overflow-hidden mb-6 bg-grain relative">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-ink-500 to-amber-400" />
          <div className="p-8">
            <div className="flex items-center gap-2 text-ink-600 text-xs font-medium uppercase tracking-widest mb-3">
              <Sparkles className="w-4 h-4" /> 活动反馈征集
            </div>
            <h1 className="font-serif text-3xl font-bold text-espresso-800 mb-3 leading-tight">{event.title}</h1>
            {event.bookTitle && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-800 text-sm mb-3">
                <BookOpen className="w-4 h-4" />
                《{event.bookTitle}》{event.bookAuthor ? ` · ${event.bookAuthor}` : ''}
              </div>
            )}
            <div className="text-sm text-espresso-500 flex items-center gap-4 flex-wrap">
              <span>{formatDate(event.startTime)} {weekdayName(event.startTime)}</span>
              <span>· {event.location}</span>
            </div>
          </div>
        </div>

        {step === 'verify' && (
          <div className="bg-white rounded-2xl shadow-lift border border-paper-200 overflow-hidden">
            <div className="p-8">
              <h2 className="font-serif text-xl font-semibold text-espresso-800 mb-2">请先验证身份</h2>
              <p className="text-espresso-500 text-sm mb-6">请输入您报名时预留的手机号，以核实您的参与身份</p>
              <label className="block text-sm font-medium text-espresso-700 mb-2">报名手机号</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setVerifyErr(''); }}
                placeholder="请输入 11 位手机号码"
                className="input-base w-full"
                maxLength={11}
              />
              {verifyErr && (
                <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-600 flex items-start gap-2">
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {verifyErr}
                </div>
              )}
            </div>
            <div className="px-8 py-4 bg-paper-50 border-t border-paper-100">
              <button onClick={handleVerify} className="btn-primary w-full sm:w-auto sm:min-w-[140px]">
                验证身份并填写反馈
              </button>
            </div>
          </div>
        )}

        {step === 'form' && (
          <div className="bg-white rounded-2xl shadow-lift border border-paper-200 overflow-hidden">
            <div className="p-8 space-y-7">
              <div>
                <label className="block text-sm font-medium text-espresso-700 mb-3 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" /> 综合评分 <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((n) => {
                    const active = (hoverStar || rating) >= n;
                    return (
                      <button
                        key={n}
                        onMouseEnter={() => setHoverStar(n)}
                        onMouseLeave={() => setHoverStar(0)}
                        onClick={() => setRating(n)}
                        className="p-1 rounded transition-transform hover:scale-110"
                      >
                        <Star
                          className={clsx(
                            'w-9 h-9 transition-colors',
                            active ? 'text-amber-400 fill-amber-400' : 'text-espresso-200 fill-transparent'
                          )}
                        />
                      </button>
                    );
                  })}
                  <div className="ml-4 text-sm">
                    {rating > 0 && (
                      <span className="font-semibold text-amber-600">
                        {rating === 5 ? '非常满意 😊' : rating === 4 ? '比较满意 🙂' : rating === 3 ? '一般 😐' : rating === 2 ? '不太满意 😕' : '很失望 😞'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-paper-100">
                <label className="block text-sm font-medium text-espresso-700 mb-3">您对本次活动的印象</label>
                <div className="flex flex-wrap gap-2">
                  {tagPool.map((t) => (
                    <button
                      key={t}
                      onClick={() => toggleTag(t)}
                      className={clsx(
                        'px-3 py-1.5 rounded-full text-sm border transition-all',
                        tags.includes(t)
                          ? 'bg-ink-600 border-ink-600 text-white shadow-sm'
                          : 'bg-paper-50 border-paper-200 text-espresso-600 hover:border-ink-300 hover:text-ink-700'
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-5 border-t border-paper-100">
                <label className="block text-sm font-medium text-espresso-700 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> 参与感受与收获
                </label>
                <p className="text-xs text-espresso-400 mb-3">分享您最有共鸣的观点、印象最深的环节，或者任何想记录的内容</p>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  placeholder="今天的讨论中，我印象最深的是……"
                  className="input-base w-full resize-none"
                />
              </div>

              <div className="pt-5 border-t border-paper-100">
                <label className="block text-sm font-medium text-espresso-700 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" /> 改进建议
                </label>
                <p className="text-xs text-espresso-400 mb-3">您的建议将帮助我们把下一期读书会做得更好</p>
                <textarea
                  value={suggestions}
                  onChange={(e) => setSuggestions(e.target.value)}
                  rows={3}
                  placeholder="可以从内容选择、时间安排、场地、形式等方面聊聊…"
                  className="input-base w-full resize-none"
                />
              </div>

              <div className="pt-5 border-t border-paper-100">
                <label className="block text-sm font-medium text-espresso-700 mb-3 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-red-400" /> 您会把这场读书会推荐给朋友吗？
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setWouldRecommend(true)}
                    className={clsx(
                      'flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border transition-all',
                      wouldRecommend === true
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm'
                        : 'bg-paper-50 border-paper-200 text-espresso-500 hover:border-emerald-200 hover:text-emerald-600'
                    )}
                  >
                    <ThumbsUp className="w-5 h-5" /> 会推荐
                  </button>
                  <button
                    onClick={() => setWouldRecommend(false)}
                    className={clsx(
                      'flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl border transition-all',
                      wouldRecommend === false
                        ? 'bg-red-50 border-red-300 text-red-700 shadow-sm'
                        : 'bg-paper-50 border-paper-200 text-espresso-500 hover:border-red-200 hover:text-red-600'
                    )}
                  >
                    <ThumbsDown className="w-5 h-5" /> 暂不推荐
                  </button>
                </div>
              </div>
            </div>

            <div className="px-8 py-4 bg-paper-50 border-t border-paper-100 flex justify-end gap-3">
              <button onClick={() => setStep('verify')} className="btn-secondary">返回</button>
              <button onClick={handleSubmit} className="btn-primary min-w-[140px] flex items-center gap-1.5">
                <Send className="w-4 h-4" /> 提交反馈
              </button>
            </div>
          </div>
        )}

        {step === 'success' && (
          <div className="bg-white rounded-2xl shadow-lift border border-paper-200 overflow-hidden p-10 text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-6 animate-pulseSoft">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
            </div>
            <h2 className="font-serif text-3xl font-semibold text-espresso-800 mb-3">感谢您的反馈！</h2>
            <p className="text-espresso-500 mb-8 leading-relaxed max-w-md mx-auto">
              您的每一条建议都是我们前行的动力。<br />
              期待在未来的读书会中，再次与您相遇。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button onClick={() => navigate('/events')} className="btn-secondary">返回活动列表</button>
              <button onClick={() => window.location.reload()} className="btn-primary">再次提交</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
