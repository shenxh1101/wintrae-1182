import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { ArrowLeft, Save, Eye, Plus, X, GripVertical, Settings2, ToggleLeft, ToggleRight } from 'lucide-react';
import type { FormField } from '@/types';
import { clsx } from 'clsx';
import { formatDate } from '@/utils/date';

const defaultFields: FormField[] = [
  { id: 'f_name', name: 'name', label: '姓名', type: 'text', required: true, sortOrder: 0, placeholder: '请输入您的姓名' },
  { id: 'f_phone', name: 'phone', label: '手机号码', type: 'tel', required: true, sortOrder: 1, placeholder: '用于接收活动通知' },
  { id: 'f_email', name: 'email', label: '邮箱（选填）', type: 'email', required: false, sortOrder: 2, placeholder: '活动资料发送' },
];

const fieldTypes = [
  { value: 'text', label: '单行文本' },
  { value: 'textarea', label: '多行文本' },
  { value: 'tel', label: '电话' },
  { value: 'email', label: '邮箱' },
  { value: 'select', label: '下拉选择' },
  { value: 'radio', label: '单选框' },
  { value: 'checkbox', label: '复选框' },
];

export function EventForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const existingEvent = id ? useAppStore((s) => s.getEvent(id)) : undefined;
  const createEvent = useAppStore((s) => s.createEvent);
  const updateEvent = useAppStore((s) => s.updateEvent);

  const [step, setStep] = useState<'basic' | 'capacity' | 'form' | 'rules'>('basic');

  const [title, setTitle] = useState(existingEvent?.title || '');
  const [description, setDescription] = useState(existingEvent?.description || '');
  const [bookTitle, setBookTitle] = useState(existingEvent?.bookTitle || '');
  const [bookAuthor, setBookAuthor] = useState(existingEvent?.bookAuthor || '');
  const [startDate, setStartDate] = useState(existingEvent ? formatDate(existingEvent.startTime) : '');
  const [startTime, setStartTime] = useState(existingEvent ? existingEvent.startTime.slice(11, 16) : '14:00');
  const [endTime, setEndTime] = useState(existingEvent ? existingEvent.endTime.slice(11, 16) : '16:30');
  const [location, setLocation] = useState(existingEvent?.location || '');
  const [notes, setNotes] = useState(existingEvent?.notes || '');

  const [maxCapacity, setMaxCapacity] = useState(existingEvent?.maxCapacity ?? 30);
  const [waitlistCapacity, setWaitlistCapacity] = useState(existingEvent?.waitlistCapacity ?? 10);

  const [formFields, setFormFields] = useState<FormField[]>(existingEvent?.formFields || defaultFields);

  const [cancelDeadline, setCancelDeadline] = useState(existingEvent?.cancelDeadlineHours ?? 24);
  const [cancelFee, setCancelFee] = useState(existingEvent?.cancellationFeePercent ?? 0);
  const [autoPromote, setAutoPromote] = useState(existingEvent?.autoPromoteWaitlist ?? true);

  const steps = [
    { key: 'basic', label: '基本信息' },
    { key: 'capacity', label: '名额设置' },
    { key: 'form', label: '报名表' },
    { key: 'rules', label: '规则配置' },
  ] as const;

  const currentIdx = steps.findIndex((s) => s.key === step);

  const handleSave = (publish = false) => {
    const startISO = new Date(`${startDate}T${startTime}:00`).toISOString();
    const endISO = new Date(`${startDate}T${endTime}:00`).toISOString();
    const data = {
      title,
      description,
      bookTitle,
      bookAuthor,
      startTime: startISO,
      endTime: endISO,
      location,
      notes,
      maxCapacity,
      waitlistCapacity,
      cancelDeadlineHours: cancelDeadline,
      cancellationFeePercent: cancelFee,
      autoPromoteWaitlist: autoPromote,
      formFields,
      status: publish ? 'registration_open' : 'draft',
    } as const;
    if (existingEvent) {
      updateEvent(existingEvent.id, data);
      navigate(`/events/${existingEvent.id}/overview`);
    } else {
      const newId = createEvent(data);
      navigate(`/events/${newId}/overview`);
    }
  };

  const addField = (type: FormField['type']) => {
    const idx = formFields.length;
    setFormFields([
      ...formFields,
      {
        id: 'f_' + Math.random().toString(36).slice(2, 8),
        name: 'custom_' + idx,
        label: '新字段 ' + (idx + 1),
        type,
        required: false,
        sortOrder: idx,
        options: type === 'select' || type === 'radio' ? ['选项1', '选项2'] : undefined,
      },
    ]);
  };

  const updateField = (fid: string, patch: Partial<FormField>) => {
    setFormFields((fs) => fs.map((f) => (f.id === fid ? { ...f, ...patch } : f)));
  };

  const removeField = (fid: string) => {
    setFormFields((fs) => fs.filter((f) => f.id !== fid));
  };

  return (
    <div className="animate-slide-up max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="btn-ghost"
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>
        <div className="flex items-center gap-2">
          <button className="btn-secondary" onClick={() => handleSave(false)}>
            <Save className="w-4 h-4" />
            保存为草稿
          </button>
          <button className="btn-primary" onClick={() => handleSave(true)}>
            <Eye className="w-4 h-4" />
            {existingEvent ? '保存并发布' : '创建并发布'}
          </button>
        </div>
      </div>

      <div className="paper-card overflow-hidden">
        <div className="px-8 py-5 border-b border-paper-300 bg-gradient-to-r from-paper-50 to-paper-100">
          <div className="flex items-center gap-4">
            {steps.map((s, i) => (
              <button
                key={s.key}
                onClick={() => setStep(s.key)}
                className="flex items-center gap-2"
              >
                <div
                  className={clsx(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                    step === s.key
                      ? 'bg-ink-700 text-white shadow-md'
                      : i < currentIdx
                      ? 'bg-emerald-500 text-white'
                      : 'bg-paper-200 text-espresso-400'
                  )}
                >
                  {i < currentIdx ? '✓' : i + 1}
                </div>
                <span className={clsx('text-sm font-medium hidden sm:inline', step === s.key ? 'text-ink-700' : 'text-espresso-400')}>
                  {s.label}
                </span>
                {i < steps.length - 1 && <div className="w-8 h-px bg-paper-400 mx-2" />}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8">
          {step === 'basic' && (
            <div className="space-y-6 max-w-2xl animate-fade-in">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-espresso-800 mb-1">基本信息</h2>
                <p className="text-sm text-espresso-500">填写活动的基础信息，参与者将在报名页看到这些内容</p>
              </div>
              <div>
                <label className="label-base">活动主题 *</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-base"
                  placeholder="例：《百年孤独》魔幻现实主义深度共读"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label-base">共读书籍</label>
                  <input
                    value={bookTitle}
                    onChange={(e) => setBookTitle(e.target.value)}
                    className="input-base"
                    placeholder="书名"
                  />
                </div>
                <div>
                  <label className="label-base">作者</label>
                  <input
                    value={bookAuthor}
                    onChange={(e) => setBookAuthor(e.target.value)}
                    className="input-base"
                    placeholder="作者名"
                  />
                </div>
              </div>
              <div>
                <label className="label-base">活动描述</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-base min-h-[120px]"
                  placeholder="介绍本期读书会的讨论重点、适合人群、阅读建议等…"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="label-base">活动日期 *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="label-base">开始时间</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="input-base"
                  />
                </div>
                <div>
                  <label className="label-base">结束时间</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="input-base"
                  />
                </div>
              </div>
              <div>
                <label className="label-base">活动地点 *</label>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="input-base"
                  placeholder="例：墨香书屋·二楼阅读空间"
                />
              </div>
              <div>
                <label className="label-base">活动备注（内部可见）</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input-base min-h-[80px]"
                  placeholder="主持人安排、物料准备、特殊注意事项等…"
                />
              </div>
              <div className="flex justify-end pt-4">
                <button className="btn-primary" onClick={() => setStep('capacity')}>
                  下一步：名额设置
                </button>
              </div>
            </div>
          )}

          {step === 'capacity' && (
            <div className="space-y-6 max-w-2xl animate-fade-in">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-espresso-800 mb-1">名额设置</h2>
                <p className="text-sm text-espresso-500">设置正式名额与候补名额上限</p>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className="p-5 rounded-xl border-2 border-dashed border-paper-400 bg-paper-50/50">
                  <label className="label-base !mb-3">正式名额上限</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setMaxCapacity(Math.max(1, maxCapacity - 5))}
                      className="w-10 h-10 rounded-lg bg-white border border-paper-300 text-espresso-500 hover:bg-ink-50 hover:text-ink-700 text-xl font-medium"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={maxCapacity}
                      onChange={(e) => setMaxCapacity(Math.max(1, parseInt(e.target.value) || 0))}
                      className="flex-1 text-center py-2.5 rounded-lg bg-white border border-paper-300 font-serif text-2xl font-semibold text-ink-700 outline-none focus:border-ink-500"
                    />
                    <button
                      onClick={() => setMaxCapacity(maxCapacity + 5)}
                      className="w-10 h-10 rounded-lg bg-white border border-paper-300 text-espresso-500 hover:bg-ink-50 hover:text-ink-700 text-xl font-medium"
                    >
                      +
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-espresso-400">满员后报名将进入候补队列</p>
                </div>
                <div className="p-5 rounded-xl border-2 border-dashed border-paper-400 bg-paper-50/50">
                  <label className="label-base !mb-3">候补名额上限</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setWaitlistCapacity(Math.max(0, waitlistCapacity - 3))}
                      className="w-10 h-10 rounded-lg bg-white border border-paper-300 text-espresso-500 hover:bg-ink-50 hover:text-ink-700 text-xl font-medium"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={waitlistCapacity}
                      onChange={(e) => setWaitlistCapacity(Math.max(0, parseInt(e.target.value) || 0))}
                      className="flex-1 text-center py-2.5 rounded-lg bg-white border border-paper-300 font-serif text-2xl font-semibold text-amber-600 outline-none focus:border-amber-400"
                    />
                    <button
                      onClick={() => setWaitlistCapacity(waitlistCapacity + 3)}
                      className="w-10 h-10 rounded-lg bg-white border border-paper-300 text-espresso-500 hover:bg-ink-50 hover:text-ink-700 text-xl font-medium"
                    >
                      +
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-espresso-400">设为 0 则不接受候补报名</p>
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <button className="btn-secondary" onClick={() => setStep('basic')}>上一步</button>
                <button className="btn-primary" onClick={() => setStep('form')}>下一步：报名表</button>
              </div>
            </div>
          )}

          {step === 'form' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-espresso-800 mb-1">报名表设计</h2>
                  <p className="text-sm text-espresso-500">自定义报名时需要收集的信息，拖拽调整顺序</p>
                </div>
                <div className="flex items-center gap-2">
                  {fieldTypes.map((ft) => (
                    <button
                      key={ft.value}
                      onClick={() => addField(ft.value as FormField['type'])}
                      className="px-3 py-1.5 text-xs rounded-lg bg-white border border-paper-300 text-espresso-600 hover:bg-ink-50 hover:border-ink-300 transition-colors"
                    >
                      + {ft.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  {formFields
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((f) => (
                      <div
                        key={f.id}
                        className="paper-card p-4 flex items-start gap-3 group hover:shadow-card transition-shadow"
                      >
                        <div className="pt-2.5 text-espresso-300 cursor-grab active:cursor-grabbing hover:text-ink-500">
                          <GripVertical className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0 space-y-3">
                          <div className="flex items-center gap-2">
                            <input
                              value={f.label}
                              onChange={(e) => updateField(f.id, { label: e.target.value })}
                              className="flex-1 px-3 py-1.5 rounded-lg bg-paper-50 border border-paper-200 text-sm font-medium text-espresso-700 outline-none focus:border-ink-400"
                              placeholder="字段标签"
                            />
                            <select
                              value={f.type}
                              onChange={(e) => updateField(f.id, { type: e.target.value as FormField['type'] })}
                              className="px-2 py-1.5 rounded-lg bg-paper-50 border border-paper-200 text-xs text-espresso-600 outline-none"
                            >
                              {fieldTypes.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                              ))}
                            </select>
                            <button
                              onClick={() => removeField(f.id)}
                              className="p-1.5 rounded-lg text-espresso-300 hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          {(f.type === 'text' || f.type === 'textarea' || f.type === 'tel' || f.type === 'email') && (
                            <input
                              value={f.placeholder || ''}
                              onChange={(e) => updateField(f.id, { placeholder: e.target.value })}
                              className="w-full px-3 py-1.5 rounded-lg bg-white border border-paper-200 text-xs text-espresso-500 outline-none focus:border-ink-300"
                              placeholder="占位提示文字（可选）"
                            />
                          )}
                          {(f.type === 'select' || f.type === 'radio') && (
                            <input
                              value={(f.options || []).join(', ')}
                              onChange={(e) => updateField(f.id, { options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                              className="w-full px-3 py-1.5 rounded-lg bg-white border border-paper-200 text-xs text-espresso-500 outline-none focus:border-ink-300"
                              placeholder="用逗号分隔多个选项"
                            />
                          )}
                          <label className="flex items-center gap-2 text-xs text-espresso-500 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={f.required}
                              onChange={(e) => updateField(f.id, { required: e.target.checked })}
                              className="rounded border-paper-400 text-ink-700 focus:ring-ink-500"
                            />
                            必填字段
                          </label>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="p-6 rounded-xl bg-gradient-to-br from-paper-100 to-paper-50 border-2 border-dashed border-paper-300 sticky top-6 h-fit">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-paper-300">
                    <Settings2 className="w-4 h-4 text-espresso-400" />
                    <span className="text-sm font-medium text-espresso-600">报名表单预览</span>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-serif text-lg font-semibold text-espresso-800">{title || '活动主题预览'}</h3>
                    <p className="text-xs text-espresso-400">{formatDate(new Date(startDate || Date.now()).toISOString())} · {location || '活动地点'}</p>
                    {formFields
                      .sort((a, b) => a.sortOrder - b.sortOrder)
                      .map((f) => (
                        <div key={f.id}>
                          <label className="block text-sm font-medium text-espresso-700 mb-1">
                            {f.label}
                            {f.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          {f.type === 'textarea' ? (
                            <textarea
                              disabled
                              rows={3}
                              placeholder={f.placeholder}
                              className="w-full px-3 py-2 rounded-lg bg-white border border-paper-300 text-sm text-espresso-400 resize-none"
                            />
                          ) : f.type === 'select' ? (
                            <select disabled className="w-full px-3 py-2 rounded-lg bg-white border border-paper-300 text-sm text-espresso-400">
                              <option>请选择…</option>
                              {(f.options || []).map((o) => <option key={o}>{o}</option>)}
                            </select>
                          ) : f.type === 'checkbox' ? (
                            <div className="flex flex-wrap gap-4">
                              <label className="flex items-center gap-1.5 text-sm text-espresso-500">
                                <input type="checkbox" className="rounded" /> 选项示例
                              </label>
                            </div>
                          ) : f.type === 'radio' ? (
                            <div className="flex flex-wrap gap-4">
                              {(f.options || ['选项1', '选项2']).map((o) => (
                                <label key={o} className="flex items-center gap-1.5 text-sm text-espresso-500">
                                  <input type="radio" name={f.id} /> {o}
                                </label>
                              ))}
                            </div>
                          ) : (
                            <input
                              disabled
                              type={f.type}
                              placeholder={f.placeholder}
                              className="w-full px-3 py-2 rounded-lg bg-white border border-paper-300 text-sm text-espresso-400"
                            />
                          )}
                        </div>
                      ))}
                    <button disabled className="btn-primary w-full opacity-70 cursor-not-allowed">
                      <Plus className="w-4 h-4" /> 提交报名
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <button className="btn-secondary" onClick={() => setStep('capacity')}>上一步</button>
                <button className="btn-primary" onClick={() => setStep('rules')}>下一步：规则配置</button>
              </div>
            </div>
          )}

          {step === 'rules' && (
            <div className="space-y-6 max-w-2xl animate-fade-in">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-espresso-800 mb-1">取消与候补规则</h2>
                <p className="text-sm text-espresso-500">设置报名取消时限及候补自动补位逻辑</p>
              </div>
              <div className="space-y-4">
                <div className="paper-card p-5">
                  <label className="label-base">免费取消时限（活动前 N 小时）</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={168}
                      step={6}
                      value={cancelDeadline}
                      onChange={(e) => setCancelDeadline(parseInt(e.target.value))}
                      className="flex-1 accent-ink-700"
                    />
                    <div className="w-20 px-3 py-2 rounded-lg bg-paper-100 text-center font-serif text-lg font-semibold text-ink-700">
                      {cancelDeadline}<span className="text-xs font-normal ml-1">小时</span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-espresso-400">
                    超过此时间取消将扣除违约金；设置 0 表示活动开始前皆可免费取消
                  </p>
                </div>
                <div className="paper-card p-5">
                  <label className="label-base">超时取消违约金比例</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={cancelFee}
                      onChange={(e) => setCancelFee(parseInt(e.target.value))}
                      className="flex-1 accent-amber-500"
                    />
                    <div className="w-20 px-3 py-2 rounded-lg bg-amber-50 text-center font-serif text-lg font-semibold text-amber-700">
                      {cancelFee}<span className="text-xs font-normal ml-1">%</span>
                    </div>
                  </div>
                </div>
                <div className="paper-card p-5 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-espresso-700">候补自动补位</p>
                    <p className="text-sm text-espresso-400 mt-1">当有人取消时，自动按顺序通知候补人员</p>
                  </div>
                  <button
                    onClick={() => setAutoPromote(!autoPromote)}
                    className="text-amber-500 hover:text-amber-600 transition-colors"
                  >
                    {autoPromote ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <button className="btn-secondary" onClick={() => setStep('form')}>上一步</button>
                <button className="btn-primary" onClick={() => handleSave(true)}>
                  {existingEvent ? '保存配置并返回' : '完成创建'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
