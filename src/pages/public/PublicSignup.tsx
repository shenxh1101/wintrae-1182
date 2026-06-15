import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import type { FormField } from '@/types';
import {
  BookOpen,
  MapPin,
  Calendar,
  Clock,
  Users,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Ticket,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { formatDate, formatTime, weekdayName } from '@/utils/date';
import clsx from 'clsx';

export function PublicSignup() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const event = useAppStore((s) => s.getEvent(eventId!));
  const blacklist = useAppStore((s) => s.blacklist);
  const addRegistration = useAppStore((s) => s.addRegistration);

  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState<'form' | 'success' | 'waitlist'>('form');
  const [finalCode, setFinalCode] = useState('');

  const fields: FormField[] = useMemo(() => event?.formFields || [], [event]);

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-paper-100 via-paper-50 to-paper-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lift border border-paper-200 p-8 text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-5">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="font-serif text-2xl font-semibold text-espresso-800 mb-2">活动不存在</h2>
          <p className="text-espresso-500 mb-6">该活动可能已被删除或链接无效</p>
          <button onClick={() => navigate('/events')} className="btn-primary">
            返回活动列表
          </button>
        </div>
      </div>
    );
  }

  const capacityFull = event.currentConfirmed >= event.maxCapacity;
  const waitlistFull = event.currentWaitlist >= event.waitlistCapacity;
  const isClosed = event.status === 'cancelled' || event.status === 'completed' || event.status === 'draft';

  const validate = () => {
    const errs: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.required && !values[f.name]?.trim()) {
        errs[f.name] = `请填写${f.label}`;
      }
      if (f.type === 'tel' && values[f.name] && !/^1[3-9]\d{9}$/.test(values[f.name].replace(/\D/g, ''))) {
        errs[f.name] = '手机号格式不正确';
      }
      if (f.type === 'email' && values[f.name] && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values[f.name])) {
        errs[f.name] = '邮箱格式不正确';
      }
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    const phone = (values.phone || values.tel || '').replace(/\D/g, '');
    if (!phone) {
      setErrors((e) => ({ ...e, phone: '手机号必填' }));
      return;
    }
    const blacked = blacklist.find((b) => {
      if (b.phone && b.phone.replace(/\D/g, '') === phone) return true;
      const p = useAppStore.getState().getParticipant(b.participantId);
      return p?.phone?.replace(/\D/g, '') === phone;
    });
    if (blacked) {
      alert(`抱歉，该号码已被限制报名：${blacked.reason || '管理员操作'}`);
      return;
    }
    if (capacityFull && waitlistFull) {
      alert('非常抱歉，报名名额和候补名额均已满');
      return;
    }
    const reg = addRegistration(event.id, {
      name: values.name || phone,
      phone,
      email: values.email || '',
      customFields: values,
    });
    if (reg) {
      setFinalCode(reg.signInCode);
      setStep(reg.status === 'waitlist' ? 'waitlist' : 'success');
    }
  };

  const renderField = (f: FormField) => {
    const base = 'w-full input-base';
    const val = values[f.name] || '';
    const err = errors[f.name];
    const red = err ? '!border-red-300 focus:!ring-red-400' : '';

    if (f.type === 'textarea') {
      return (
        <textarea
          value={val}
          onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
          rows={3}
          placeholder={f.placeholder}
          className={`${base} ${red} resize-none`}
        />
      );
    }
    if (f.type === 'select') {
      return (
        <select value={val} onChange={(e) => setValues({ ...values, [f.name]: e.target.value })} className={`${base} ${red}`}>
          <option value="">请选择{f.label}</option>
          {f.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      );
    }
    if (f.type === 'radio') {
      return (
        <div className="flex flex-wrap gap-2">
          {f.options?.map((o) => (
            <label key={o} className="flex items-center gap-2 px-3.5 py-2 rounded-lg border border-paper-200 hover:border-ink-400 cursor-pointer transition-colors">
              <input
                type="radio"
                checked={val === o}
                onChange={() => setValues({ ...values, [f.name]: o })}
                className="text-ink-700"
              />
              <span className="text-sm text-espresso-700">{o}</span>
            </label>
          ))}
        </div>
      );
    }
    if (f.type === 'checkbox') {
      return (
        <div className="flex flex-wrap gap-2">
          {(f.options || ['是']).map((o) => {
            const checked = val.split(',').filter(Boolean).includes(o);
            return (
              <label
                key={o}
                className={clsx(
                  'flex items-center gap-2 px-3.5 py-2 rounded-lg border cursor-pointer transition-colors',
                  checked ? 'border-ink-500 bg-ink-50' : 'border-paper-200 hover:border-ink-400'
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => {
                    const list = val.split(',').filter(Boolean);
                    if (e.target.checked) list.push(o);
                    else {
                      const idx = list.indexOf(o);
                      if (idx >= 0) list.splice(idx, 1);
                    }
                    setValues({ ...values, [f.name]: list.join(',') });
                  }}
                  className="text-ink-700"
                />
                <span className="text-sm text-espresso-700">{o}</span>
              </label>
            );
          })}
        </div>
      );
    }
    return (
      <input
        type={f.type}
        value={val}
        onChange={(e) => setValues({ ...values, [f.name]: e.target.value })}
        placeholder={f.placeholder}
        className={`${base} ${red}`}
      />
    );
  };

  const seatsLeft = event.maxCapacity - event.currentConfirmed;
  const waitLeft = event.waitlistCapacity - event.currentWaitlist;

  return (
    <div className="min-h-screen bg-gradient-to-br from-paper-100 via-paper-50 to-paper-100">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-espresso-500 hover:text-ink-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>

        {isClosed ? (
          <div className="bg-white rounded-2xl shadow-lift border border-paper-200 p-10 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-5">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-espresso-800 mb-2">报名已关闭</h2>
            <p className="text-espresso-500">该活动当前无法接受报名</p>
          </div>
        ) : step !== 'form' ? (
          <div className="bg-white rounded-2xl shadow-lift border border-paper-200 p-10 text-center overflow-hidden relative bg-grain">
            <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-gradient-to-br from-ink-500/10 to-transparent blur-3xl" />
            <div className="relative">
              <div
                className={clsx(
                  'w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6 animate-pulseSoft',
                  step === 'success' ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'
                )}
              >
                {step === 'success' ? (
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                ) : (
                  <RefreshCw className="w-10 h-10 text-amber-500" />
                )}
              </div>
              <h2 className="font-serif text-3xl font-semibold text-espresso-800 mb-2">
                {step === 'success' ? '🎉 报名成功！' : '⏳ 已加入候补队列'}
              </h2>
              <p className="text-espresso-500 mb-8">
                {step === 'success'
                  ? '我们已为您预留座位，届时请准时到场'
                  : `目前前面还有 ${event.currentWaitlist - 1} 位书友，有空位我们会第一时间通知您`}
              </p>

              <div className="max-w-sm mx-auto bg-gradient-to-br from-ink-50 to-amber-50/50 rounded-2xl p-6 border border-ink-100 mb-8">
                <div className="flex items-center justify-center gap-2 text-espresso-500 text-sm mb-3">
                  <Ticket className="w-4 h-4" />
                  您的专属签到码（请妥善保存）
                </div>
                <div className="font-mono text-4xl font-bold tracking-[0.3em] text-ink-800 mb-4">{finalCode}</div>
                <div className="text-xs text-espresso-400">活动当天出示此 6 位数字即可快速核销入场</div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button onClick={() => window.location.reload()} className="btn-secondary">
                  继续报名
                </button>
                <button onClick={() => navigate('/events')} className="btn-primary">
                  查看更多活动
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-lift border border-paper-200 overflow-hidden mb-6 bg-grain relative">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-ink-500 via-amber-400 to-ink-500" />
              <div className="p-8">
                <div className="flex items-center gap-2 text-ink-600 text-xs font-medium uppercase tracking-widest mb-3">
                  <Sparkles className="w-4 h-4" />
                  读书会报名
                </div>
                <h1 className="font-serif text-3xl font-bold text-espresso-800 mb-3 leading-tight">{event.title}</h1>
                {event.bookTitle && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-800 text-sm mb-5">
                    <BookOpen className="w-4 h-4" />
                    共读书目《{event.bookTitle}》{event.bookAuthor ? ` · ${event.bookAuthor}` : ''}
                  </div>
                )}
                {event.description && <p className="text-espresso-600 leading-relaxed mb-6">{event.description}</p>}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-paper-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-ink-50 flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-ink-600" />
                    </div>
                    <div>
                      <p className="text-[11px] text-espresso-400 uppercase tracking-wider">日期</p>
                      <p className="text-sm font-semibold text-espresso-800">
                        {formatDate(event.startTime)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-ink-50 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-ink-600" />
                    </div>
                    <div>
                      <p className="text-[11px] text-espresso-400 uppercase tracking-wider">时间</p>
                      <p className="text-sm font-semibold text-espresso-800">
                        {weekdayName(event.startTime)} {formatTime(event.startTime)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-ink-50 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-ink-600" />
                    </div>
                    <div>
                      <p className="text-[11px] text-espresso-400 uppercase tracking-wider">地点</p>
                      <p className="text-sm font-semibold text-espresso-800 truncate">{event.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-ink-50 flex items-center justify-center">
                      <Users className="w-4 h-4 text-ink-600" />
                    </div>
                    <div>
                      <p className="text-[11px] text-espresso-400 uppercase tracking-wider">名额</p>
                      <p className="text-sm font-semibold text-espresso-800">
                        {capacityFull ? (waitlistFull ? '已满' : `候补 ${waitLeft}`) : `余 ${seatsLeft} 席`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lift border border-paper-200 overflow-hidden">
              <div className="px-8 py-5 border-b border-paper-100 bg-paper-50/50">
                <h2 className="font-serif text-xl font-semibold text-espresso-800">填写报名信息</h2>
                <p className="text-sm text-espresso-400 mt-1">带 <span className="text-red-500">*</span> 为必填项</p>
              </div>

              <div className="p-8 space-y-5">
                {fields.map((f, idx) => (
                  <div key={f.id} className={clsx(idx < fields.length - 1 && 'pb-5 border-b border-paper-100')}>
                    <label className="block text-sm font-medium text-espresso-700 mb-2">
                      {f.required && <span className="text-red-500 mr-0.5">*</span>}
                      {f.label}
                    </label>
                    {renderField(f)}
                    {errors[f.name] && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors[f.name]}</p>}
                  </div>
                ))}
              </div>

              <div className="px-8 py-5 bg-paper-50 border-t border-paper-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-espresso-500 flex items-center gap-2">
                  {capacityFull ? (
                    <>
                      <RefreshCw className="w-4 h-4 text-amber-500" />
                      <span>名额已满，将自动进入候补（余 {waitLeft} 位）</span>
                    </>
                  ) : seatsLeft <= Math.ceil(event.maxCapacity * 0.2) ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span>名额紧张，仅剩最后 {seatsLeft} 个席位</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>当前可直接报名，无需候补</span>
                    </>
                  )}
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={capacityFull && waitlistFull}
                  className={clsx(
                    'btn-primary min-w-[140px]',
                    capacityFull && waitlistFull && '!bg-espresso-300 cursor-not-allowed'
                  )}
                >
                  {capacityFull ? '提交候补申请' : '立即报名'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
