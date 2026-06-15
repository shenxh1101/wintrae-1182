import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { StatCard, EmptyState, RegistrationStatusBadge } from '@/components/ui/Badges';
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Star,
  Send,
  Save,
  Play,
  Clock,
  Plus,
  X,
  Trash2,
  Copy,
  Users,
  UserCheck,
  Calendar,
  ChevronDown,
  Sparkles,
  BarChart3,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  CheckCircle2,
  Eye,
  PenLine,
  Filter,
  Download,
} from 'lucide-react';
import clsx from 'clsx';
import { formatDateTime, formatRelative } from '@/utils/date';
import { NotificationType, RegistrationStatus } from '@/types';

export function Notifications() {
  const { id } = useParams();
  const event = useAppStore((s) => s.getEvent(id!));
  const notifications = useAppStore((s) => s.getEventNotifications(id!));
  const feedbacks = useAppStore((s) => s.getEventFeedbacks(id!));
  const regs = useAppStore((s) => s.getEventRegistrations(id!));
  const getParticipant = useAppStore((s) => s.getParticipant);
  const createNotif = useAppStore((s) => s.createNotification);
  const sendNotif = useAppStore((s) => s.sendNotification);

  const [tab, setTab] = useState<'send' | 'history' | 'feedback'>('send');
  const [showEditor, setShowEditor] = useState(true);
  const [type, setType] = useState<NotificationType>('sms');
  const [title, setTitle] = useState('活动即将开始提醒');
  const [content, setContent] = useState(
    '您好{姓名}，{活动名}将于{时间}在{地点}举办，请准时到场。如有疑问请联系书店。回复T退订。'
  );
  const [filterStatuses, setFilterStatuses] = useState<RegistrationStatus[]>(['confirmed']);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sendingProgress, setSendingProgress] = useState(0);

  const targetCount = regs.filter((r) => filterStatuses.includes(r.status)).length;

  const templates = [
    {
      name: '活动开始提醒',
      content: '您好{姓名}，{活动名}将于{时间}在{地点}举办，请准时到场。如有疑问请联系书店。',
      statuses: ['confirmed'] as RegistrationStatus[],
    },
    {
      name: '候补补位成功',
      content: '恭喜您！您已从候补队列中补位成功，活动详情：{活动名}，{时间}，{地点}。请点击确认出席。',
      statuses: ['waitlist'] as RegistrationStatus[],
    },
    {
      name: '活动取消通知',
      content: '尊敬的书友，因不可抗力原因，{活动名}已取消，报名费将在3个工作日内原路退还，敬请谅解。',
      statuses: ['confirmed', 'waitlist'] as RegistrationStatus[],
    },
    {
      name: '反馈征集',
      content: '感谢您参加{活动名}！请花3分钟填写反馈问卷，帮助我们做得更好 → [链接]',
      statuses: ['checked_in'] as RegistrationStatus[],
    },
  ];

  const toggleStatus = (s: RegistrationStatus) => {
    setFilterStatuses((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const insertVar = (v: string) => setContent((c) => c + '{' + v + '}');

  const sendDraft = async () => {
    const nid = createNotif({
      eventId: id,
      type,
      title,
      content,
      recipientFilters: { statuses: filterStatuses },
      totalRecipients: targetCount,
    });
    setSendingId(nid);
    // 模拟进度
    for (let i = 1; i <= 10; i++) {
      await new Promise((r) => setTimeout(r, 120));
      setSendingProgress(i * 10);
    }
    await sendNotif(nid);
    setTimeout(() => {
      setSendingId(null);
      setSendingProgress(0);
      setTab('history');
    }, 400);
  };

  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
    : '—';
  const ratingDist = useMemo(() => {
    const dist = [0, 0, 0, 0, 0];
    feedbacks.forEach((f) => {
      if (f.rating >= 1 && f.rating <= 5) dist[f.rating - 1]++;
    });
    return dist.reverse();
  }, [feedbacks]);
  const keywordFreq = useMemo(() => {
    const m: Record<string, number> = {};
    feedbacks.forEach((f) => f.keywords.forEach((k) => (m[k] = (m[k] || 0) + 1)));
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [feedbacks]);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={MessageSquare} label="已发送通知" value={notifications.filter(n => n.status === 'sent').length} accent="ink" sub={`累计触达 ${notifications.reduce((s, n) => s + n.sentCount, 0)} 人次`} />
        <StatCard icon={Users} label="当前受众数" value={targetCount} accent="amber" sub={`类型：${type === 'sms' ? '短信' : type === 'email' ? '邮件' : '站内信'}`} />
        <StatCard icon={Star} label="平均评分" value={avgRating} accent="espresso" sub={`${feedbacks.length} 条有效反馈`} />
        <StatCard icon={ThumbsUp} label="好评率" value={feedbacks.length ? Math.round((ratingDist.slice(0, 2).reduce((a, b) => a + b, 0) / feedbacks.length) * 100) : 0 + '%'} accent="emerald" sub="4-5 星评价占比" />
      </div>

      <div className="paper-card overflow-hidden">
        <div className="px-5 py-3 border-b border-paper-200 flex items-center gap-1">
          {[
            { key: 'send', label: '编辑发送', icon: PenLine },
            { key: 'history', label: '通知记录', icon: Clock },
            { key: 'feedback', label: '反馈回收', icon: MessageSquare },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key as any)}
                className={clsx(
                  'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                  tab === t.key
                    ? 'bg-ink-700 text-white shadow-md'
                    : 'text-espresso-500 hover:bg-paper-200'
                )}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
          {tab === 'send' && (
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setShowEditor(!showEditor)}
                className="btn-ghost !py-1.5 text-xs"
              >
                <Eye className="w-3.5 h-3.5" />
                {showEditor ? '隐藏预览' : '显示预览'}
              </button>
            </div>
          )}
        </div>

        {tab === 'send' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            <div className={clsx('space-y-5 transition-all', showEditor ? 'lg:col-span-2' : 'lg:col-span-3')}>
              <div>
                <h3 className="font-serif text-lg font-semibold text-espresso-800 mb-3">通知类型</h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { k: 'sms', label: '短信', icon: Smartphone, desc: '快速到达' },
                    { k: 'in_app', label: '站内信', icon: Bell, desc: '免费无限' },
                    { k: 'email', label: '邮件', icon: Mail, desc: '承载量大' },
                  ].map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.k}
                        onClick={() => setType(opt.k as any)}
                        className={clsx(
                          'p-4 rounded-xl border-2 text-left transition-all',
                          type === opt.k
                            ? 'border-ink-700 bg-ink-50 shadow-sm'
                            : 'border-paper-200 bg-white hover:border-paper-400'
                        )}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center',
                            type === opt.k ? 'bg-ink-700 text-white' : 'bg-paper-100 text-espresso-500')}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <p className="font-medium text-espresso-800">{opt.label}</p>
                        </div>
                        <p className="text-xs text-espresso-400">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="label-base">通知标题</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-base"
                  placeholder="简明扼要，显示在消息头部"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label-base !mb-0">消息内容</label>
                  <div className="flex items-center gap-1">
                    {['姓名', '活动名', '时间', '地点'].map((v) => (
                      <button
                        key={v}
                        onClick={() => insertVar(v)}
                        className="px-2 py-1 rounded-md bg-paper-100 border border-paper-300 text-xs text-espresso-600 hover:bg-ink-50 hover:border-ink-300 transition-colors"
                      >
                        {'{'}{v}{'}'}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  className="input-base resize-none font-mono text-sm"
                  placeholder="使用大括号插入变量，例如：您好{姓名}…"
                />
                <p className="mt-2 text-xs text-espresso-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  当前内容约 {content.length} 字
                  {type === 'sms' && ` · 预计 ${Math.ceil(content.length / 67)} 条短信/人`}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-serif text-lg font-semibold text-espresso-800">发送受众</h3>
                  <button className="text-xs text-ink-600 flex items-center gap-0.5 hover:text-ink-700">
                    <Filter className="w-3.5 h-3.5" /> 高级筛选
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { k: 'confirmed', label: '已确认', Icon: Users },
                    { k: 'waitlist', label: '候补', Icon: Clock },
                    { k: 'checked_in', label: '已签到', Icon: UserCheck },
                    { k: 'no_show', label: '未到场', Icon: AlertCircle },
                    { k: 'pending', label: '待确认', Icon: Sparkles },
                    { k: 'cancelled', label: '已取消', Icon: X },
                  ].map((opt) => {
                    const active = filterStatuses.includes(opt.k as any);
                    const count = regs.filter((r) => r.status === opt.k).length;
                    return (
                      <button
                        key={opt.k}
                        onClick={() => toggleStatus(opt.k as any)}
                        className={clsx(
                          'p-3 rounded-xl border transition-all text-left',
                          active
                            ? 'border-ink-600 bg-ink-50 shadow-sm'
                            : 'border-paper-200 bg-white hover:border-paper-400',
                          count === 0 && 'opacity-50 cursor-not-allowed'
                        )}
                        disabled={count === 0}
                      >
                        <opt.Icon className={clsx('w-4 h-4 mb-1.5', active ? 'text-ink-700' : 'text-espresso-400')} />
                        <p className="text-xs font-medium text-espresso-700">{opt.label}</p>
                        <p className={clsx('text-lg font-serif font-semibold', active ? 'text-ink-700' : 'text-espresso-500')}>
                          {count}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-paper-50 border border-amber-100">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800 mb-2">快捷模板</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {templates.map((t) => (
                        <button
                          key={t.name}
                          onClick={() => { setTitle(t.name); setContent(t.content); setFilterStatuses(t.statuses); }}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-amber-200 hover:bg-amber-100 text-left transition-colors group"
                        >
                          <Copy className="w-3.5 h-3.5 text-amber-600" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-amber-900 truncate">{t.name}</p>
                            <p className="text-[10px] text-amber-700/70">受众：{t.statuses.map(s => ({confirmed:'已确认', waitlist:'候补', checked_in:'已签到'})[s] || s).join('、')}</p>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {sendingId && (
                <div className="p-5 rounded-xl bg-ink-50 border border-ink-200 space-y-3 animate-slide-up">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Send className="w-5 h-5 text-ink-700 animate-pulse-soft" />
                      <p className="font-medium text-ink-800">正在发送中…</p>
                    </div>
                    <span className="font-mono text-ink-700 font-semibold">{sendingProgress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white overflow-hidden border border-ink-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-ink-600 via-ink-500 to-amber-400 transition-all duration-200"
                      style={{ width: `${sendingProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => createNotif({ eventId: id, type, title, content, recipientFilters: { statuses: filterStatuses }, totalRecipients: targetCount, status: 'draft' })}
                  className="btn-secondary"
                  disabled={!!sendingId}
                >
                  <Save className="w-4 h-4" />
                  保存草稿
                </button>
                <button className="btn-secondary" disabled={!!sendingId}>
                  <Clock className="w-4 h-4" />
                  定时发送
                </button>
                <button onClick={sendDraft} className="btn-primary" disabled={!!sendingId || targetCount === 0}>
                  <Play className="w-4 h-4 fill-current" />
                  立即发送（{targetCount}）
                </button>
              </div>
            </div>

            {showEditor && (
              <div className="lg:col-span-1">
                <div className="sticky top-6 space-y-3">
                  <p className="text-xs font-medium text-espresso-400 uppercase tracking-wider px-1">消息预览</p>
                  {type === 'sms' ? (
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                          <Smartphone className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[11px] text-emerald-700/70 mb-2">【墨香书屋】SMS · 模拟预览</p>
                          <p className="text-sm leading-relaxed text-emerald-900 whitespace-pre-wrap">
                            {content
                              .replace('{姓名}', '陈思远')
                              .replace('{活动名}', event?.title || '本期读书会')
                              .replace('{时间}', formatDateTime(event?.startTime || '') || '本周六下午')
                              .replace('{地点}', event?.location || '书店二楼')}
                          </p>
                          <p className="text-[10px] text-emerald-700/50 mt-3 text-right">1/1 · 67字</p>
                        </div>
                      </div>
                    </div>
                  ) : type === 'email' ? (
                    <div className="rounded-2xl bg-white border border-paper-300 shadow-sm overflow-hidden">
                      <div className="px-4 py-3 bg-paper-100 border-b border-paper-200 space-y-1.5">
                        <p className="text-sm font-medium text-espresso-800">{title}</p>
                        <p className="text-xs text-espresso-400">收件人：陈思远 &lt;example@mail.com&gt;</p>
                      </div>
                      <div className="p-5 text-sm text-espresso-600 leading-relaxed whitespace-pre-wrap">
                        {content
                          .replace('{姓名}', '陈思远')
                          .replace('{活动名}', event?.title || '本期读书会')
                          .replace('{时间}', formatDateTime(event?.startTime || '') || '本周六下午')
                          .replace('{地点}', event?.location || '书店二楼')}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-ink-700 to-ink-800 text-white shadow-lift relative overflow-hidden">
                      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-amber-400/10 blur-2xl" />
                      <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                            <Bell className="w-4 h-4 text-amber-300" />
                          </div>
                          <p className="text-sm font-medium">{title}</p>
                        </div>
                        <p className="text-sm text-ink-100 leading-relaxed">
                          {content
                            .replace('{姓名}', '陈思远')
                            .replace('{活动名}', event?.title || '本期读书会')
                            .replace('{时间}', formatDateTime(event?.startTime || '') || '本周六下午')
                            .replace('{地点}', event?.location || '书店二楼')}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between px-2 text-xs">
                    <span className="text-espresso-400">预计发送：{targetCount} 人</span>
                    <span className="text-espresso-400">变量 {Array.from(content.match(/\{[^}]+\}/g) || []).length} 个</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'history' && (
          <div>
            {notifications.length === 0 ? (
              <div className="py-16">
                <EmptyState icon={Clock} title="暂无发送记录" hint="编辑并发送一条通知，将出现在这里" />
              </div>
            ) : (
              <div className="divide-y divide-paper-100">
                {[...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((n) => (
                  <div key={n.id} className="p-6 hover:bg-paper-50/60 transition-colors">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={clsx('w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm',
                          n.type === 'sms' ? 'bg-gradient-to-br from-emerald-400 to-emerald-500 text-white' :
                          n.type === 'email' ? 'bg-gradient-to-br from-ink-500 to-ink-600 text-white' :
                          'bg-gradient-to-br from-amber-400 to-amber-500 text-espresso-800')}>
                          {n.type === 'sms' ? <Smartphone className="w-5 h-5" /> :
                           n.type === 'email' ? <Mail className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-espresso-800">{n.title}</h4>
                            <span className={clsx('badge',
                              n.status === 'sent' ? 'bg-emerald-50 text-emerald-700' :
                              n.status === 'sending' ? 'bg-amber-50 text-amber-700' :
                              n.status === 'failed' ? 'bg-red-50 text-red-600' :
                              'bg-espresso-100 text-espresso-600')}>
                              {n.status === 'sent' ? <CheckCircle2 className="w-3 h-3" /> :
                               n.status === 'sending' ? <Clock className="w-3 h-3" /> :
                               n.status === 'draft' ? <Save className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                              {{ sent: '已发送', sending: '发送中', draft: '草稿', failed: '发送失败', scheduled: '定时中' }[n.status]}
                            </span>
                          </div>
                          <p className="text-sm text-espresso-500 mt-1 line-clamp-2">{n.content}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-espresso-400 flex-wrap">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatRelative(n.createdAt)} · {formatDateTime(n.createdAt)}
                            </span>
                            <span>总数 {n.totalRecipients}</span>
                            <span className="text-emerald-600">成功 {n.sentCount}</span>
                            {n.failedCount > 0 && <span className="text-red-500">失败 {n.failedCount}</span>}
                            <span>类型：{n.type}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button className="btn-ghost !py-1.5 !px-2.5 text-xs">
                          <Eye className="w-3.5 h-3.5" />
                          详情
                        </button>
                        {n.status === 'draft' && (
                          <button className="btn-primary !py-1.5 !px-3 text-xs">
                            <Send className="w-3 h-3" />
                            发送
                          </button>
                        )}
                        {n.status !== 'sending' && (
                          <button className="btn-ghost !py-1.5 !px-2 text-xs text-red-500">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'feedback' && (
          <div className="p-6">
            {feedbacks.length === 0 ? (
              <EmptyState icon={BarChart3} title="还没有收集到反馈" hint="活动结束后发送反馈问卷，将在这里展示结果" />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-6">
                  <div className="paper-card p-6">
                    <div className="flex items-center justify-center mb-4">
                      <div className="text-center">
                        <p className="font-serif text-6xl font-semibold text-espresso-800 tracking-tight">
                          {avgRating}
                        </p>
                        <div className="flex items-center justify-center gap-0.5 my-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.round(parseFloat(avgRating))
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-paper-400'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-espresso-400">{feedbacks.length} 人评价</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((r, i) => {
                        const count = ratingDist[i];
                        const pct = feedbacks.length > 0 ? Math.round((count / feedbacks.length) * 100) : 0;
                        return (
                          <div key={r} className="flex items-center gap-3">
                            <div className="flex items-center gap-0.5 w-12">
                              <span className="text-xs text-espresso-500 w-3">{r}</span>
                              <Star className={`w-3.5 h-3.5 ${r >= 4 ? 'fill-amber-400 text-amber-400' : 'text-espresso-300'}`} />
                            </div>
                            <div className="flex-1 h-2.5 rounded-full bg-paper-200 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-espresso-500 w-10 text-right">{count}人</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="paper-card p-6">
                    <h4 className="font-serif text-lg font-semibold text-espresso-800 mb-4">热词标签</h4>
                    {keywordFreq.length === 0 ? (
                      <p className="text-sm text-espresso-400 text-center py-4">暂无标签</p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {keywordFreq.map(([k, c]) => {
                          const weight = c / (keywordFreq[0]?.[1] || 1);
                          return (
                            <span
                              key={k}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-50 to-ink-50 border border-amber-200/60 text-amber-800"
                              style={{ fontSize: `${11 + weight * 5}px`, fontWeight: 400 + Math.floor(weight * 300) }}
                            >
                              {k}
                              <span className="text-[10px] text-amber-700/70 bg-white/60 px-1.5 rounded">{c}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <div className="paper-card overflow-hidden">
                    <div className="px-5 py-4 border-b border-paper-200 flex items-center justify-between">
                      <h4 className="font-serif text-lg font-semibold text-espresso-800">反馈详情</h4>
                      <button className="btn-ghost !py-1.5 text-xs">
                        <Download className="w-3.5 h-3.5" />
                        导出
                      </button>
                    </div>
                    <div className="divide-y divide-paper-100 max-h-[600px] overflow-y-auto scroll-area">
                      {[...feedbacks]
                        .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                        .map((f) => {
                          const p = getParticipant(f.participantId);
                          return (
                            <div key={f.id} className="p-5 hover:bg-paper-50/60 transition-colors">
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-700 font-medium">
                                    {p?.name?.[0]}
                                  </div>
                                  <div>
                                    <p className="font-medium text-espresso-800">{p?.name || '匿名用户'}</p>
                                    <p className="text-xs text-espresso-400">{formatRelative(f.submittedAt)}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-4 h-4 ${i < f.rating ? 'fill-amber-400 text-amber-400' : 'text-paper-400'}`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-espresso-600 leading-relaxed pl-13 -mt-1">{f.content}</p>
                              {f.keywords.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-3 pl-13">
                                  {f.keywords.map((k) => (
                                    <span key={k} className="px-2 py-0.5 rounded-md bg-ink-50 text-ink-700 text-[11px]">
                                      #{k}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
