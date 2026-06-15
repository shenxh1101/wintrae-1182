import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { StatCard, EmptyState } from '@/components/ui/Badges';
import { RegistrationStatusBadge } from '@/components/ui/Badges';
import {
  Users,
  UserCheck,
  UserX,
  QrCode,
  Bell,
  MessageSquare,
  FileText,
  ArrowRight,
  Star,
  MessageCircle,
  Sparkles,
  ChevronRight,
  UserPlus,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { formatDateTime, formatRelative } from '@/utils/date';

export function EventOverview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = useAppStore((s) => s.getEvent(id!));
  const regs = useAppStore((s) => s.getEventRegistrations(id!));
  const checkins = useAppStore((s) => s.getEventCheckIns(id!));
  const feedbacks = useAppStore((s) => s.getEventFeedbacks(id!));
  const getParticipant = useAppStore((s) => s.getParticipant);

  if (!event) return null;

  const confirmed = regs.filter((r) => r.status === 'confirmed' || r.status === 'checked_in' || r.status === 'no_show');
  const waitlist = regs.filter((r) => r.status === 'waitlist');
  const cancelled = regs.filter((r) => r.status === 'cancelled');
  const checkedIn = regs.filter((r) => r.status === 'checked_in');
  const noShow = regs.filter((r) => r.status === 'no_show');
  const attendanceRate = confirmed.length > 0 ? Math.round((checkedIn.length / (checkedIn.length + noShow.length)) * 100) : 0;

  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
    : '—';

  const recentRegs = [...regs]
    .sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime())
    .slice(0, 5);

  const shortcutCards = [
    {
      title: '报名管理',
      desc: '查看名单、候补管理、自定义字段',
      icon: Users,
      color: 'from-ink-600 to-ink-700',
      onClick: () => navigate(`/events/${id}/registrations`),
      stat: `${confirmed.length + waitlist.length} 人报名`,
    },
    {
      title: '签到核销',
      desc: '扫码签到、手动录入、实时统计',
      icon: QrCode,
      color: 'from-amber-500 to-amber-600',
      onClick: () => navigate(`/events/${id}/checkin`),
      stat: `${checkins.length} 人已到`,
    },
    {
      title: '通知与反馈',
      desc: '批量通知、反馈问卷、消息记录',
      icon: Bell,
      color: 'from-espresso-500 to-espresso-700',
      onClick: () => navigate(`/events/${id}/notifications`),
      stat: `${feedbacks.length} 条反馈`,
    },
    {
      title: '复盘总结',
      desc: '到场率、数据分析、活动沉淀',
      icon: FileText,
      color: 'from-emerald-500 to-emerald-600',
      onClick: () => navigate(`/events/${id}/review`),
      stat: event.status === 'completed' ? '查看复盘' : '待结束',
    },
  ];

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={Users} label="已确认报名" value={confirmed.length} accent="ink" sub={`名额 ${event.maxCapacity} · 余${event.maxCapacity - confirmed.length}席`} />
        <StatCard icon={UserPlus} label="候补队列" value={waitlist.length} accent="amber" sub={`上限 ${event.waitlistCapacity}`} />
        <StatCard icon={UserCheck} label="已签到" value={checkedIn.length} accent="emerald" sub={event.status === 'completed' ? `到场率 ${attendanceRate}%` : `活动${formatRelative(event.startTime)}`} />
        <StatCard icon={Star} label="平均评分" value={avgRating} accent="espresso" sub={feedbacks.length ? `基于 ${feedbacks.length} 条反馈` : '暂无反馈'} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shortcutCards.map((c, i) => {
              const Icon = c.icon;
              return (
                <button
                  key={c.title}
                  onClick={c.onClick}
                  className="group paper-card p-5 text-left hover:shadow-lift hover:-translate-y-0.5 transition-all duration-300 overflow-hidden relative animate-slide-up"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br ${c.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                  <div className="flex items-start justify-between gap-4 relative">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${c.color} text-white flex items-center justify-center shadow-md`}>
                          <Icon className="w-4.5 h-4.5" strokeWidth={2} />
                        </div>
                        <h3 className="font-serif text-lg font-semibold text-espresso-800">{c.title}</h3>
                      </div>
                      <p className="text-sm text-espresso-500 mb-3">{c.desc}</p>
                      <div className="flex items-center gap-1.5 text-sm text-ink-600 font-medium group-hover:text-ink-700 transition-colors">
                        <span>{c.stat}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {event.description && (
            <div className="paper-card p-6">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-espresso-400" />
                <h3 className="font-serif text-lg font-semibold text-espresso-800">活动说明</h3>
              </div>
              <p className="text-espresso-600 leading-relaxed whitespace-pre-line">{event.description}</p>
              {event.notes && (
                <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-100">
                  <p className="text-xs font-medium text-amber-700 mb-1">📝 内部备注</p>
                  <p className="text-sm text-amber-900">{event.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="paper-card overflow-hidden">
            <div className="px-5 py-4 border-b border-paper-200 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-semibold text-espresso-800">报名动态</h3>
                <p className="text-xs text-espresso-400 mt-0.5">最近 5 条报名记录</p>
              </div>
              <button
                onClick={() => navigate(`/events/${id}/registrations`)}
                className="text-sm text-ink-600 hover:text-ink-700 flex items-center gap-0.5"
              >
                全部 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div>
              {recentRegs.length === 0 ? (
                <div className="p-8">
                  <EmptyState
                    icon={Users}
                    title="暂无报名"
                    hint="活动发布后，参与者即可开始报名"
                  />
                </div>
              ) : (
                <ul className="divide-y divide-paper-100">
                  {recentRegs.map((r) => {
                    const p = getParticipant(r.participantId);
                    return (
                      <li key={r.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-paper-50 transition-colors">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-ink-100 to-ink-200 flex items-center justify-center text-ink-700 font-medium text-sm flex-shrink-0">
                          {p?.name?.[0] || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-espresso-700 truncate">{p?.name || '未知用户'}</p>
                            <RegistrationStatusBadge status={r.status} />
                          </div>
                          <p className="text-xs text-espresso-400 truncate mt-0.5">
                            {formatDateTime(r.registeredAt)} · {p?.phone}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          <div className="paper-card overflow-hidden">
            <div className="px-5 py-4 border-b border-paper-200 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-semibold text-espresso-800">最新反馈</h3>
                <p className="text-xs text-espresso-400 mt-0.5">书友的真实声音</p>
              </div>
              {feedbacks.length > 0 && (
                <button
                  onClick={() => navigate(`/events/${id}/review`)}
                  className="text-sm text-ink-600 hover:text-ink-700 flex items-center gap-0.5"
                >
                  查看 <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="p-5">
              {feedbacks.length === 0 ? (
                <EmptyState icon={MessageSquare} title="还没有反馈" hint="活动结束后可以向参与者发送反馈问卷" />
              ) : (
                <div className="space-y-4">
                  {feedbacks.slice(0, 3).map((f) => {
                    const p = getParticipant(f.participantId);
                    return (
                      <div key={f.id} className="p-3 rounded-xl bg-paper-50 border border-paper-200">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-medium text-amber-700">
                              {p?.name?.[0]}
                            </div>
                            <span className="text-sm font-medium text-espresso-700">{p?.name}</span>
                          </div>
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${i < f.rating ? 'fill-amber-400 text-amber-400' : 'text-paper-400'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-espresso-600 line-clamp-2">{f.content}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="paper-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle className="w-4 h-4 text-espresso-400" />
              <h3 className="font-serif text-lg font-semibold text-espresso-800">报名状态统计</h3>
            </div>
            <div className="space-y-3">
              <StatRow icon={CheckCircle2} label="已确认" value={confirmed.length} total={regs.length} color="bg-ink-600" text="text-ink-700" />
              <StatRow icon={UserPlus} label="候补" value={waitlist.length} total={regs.length} color="bg-amber-500" text="text-amber-700" />
              <StatRow icon={UserCheck} label="已签到" value={checkedIn.length} total={regs.length} color="bg-emerald-500" text="text-emerald-700" />
              <StatRow icon={UserX} label="取消/未到" value={cancelled.length + noShow.length} total={regs.length} color="bg-red-400" text="text-red-600" />
              <StatRow icon={XCircle} label="未到场" value={noShow.length} total={confirmed.length} color="bg-red-500" text="text-red-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ icon: Icon, label, value, total, color, text }: any) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <div className="flex items-center gap-2 text-espresso-600">
          <Icon className={`w-4 h-4 ${text}`} />
          <span>{label}</span>
        </div>
        <span className={`font-semibold ${text}`}>{value}</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-paper-200 overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
