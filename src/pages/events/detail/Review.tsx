import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { StatCard, EmptyState } from '@/components/ui/Badges';
import {
  BookOpen,
  Users,
  UserCheck,
  Clock,
  Star,
  TrendingUp,
  Calendar,
  MapPin,
  MessageSquare,
  Award,
  Target,
  Sparkles,
  PenLine,
  CheckCircle2,
  XCircle,
  BarChart3,
  Bookmark,
  ArrowRight,
  ChevronRight,
  Plus,
  FileText,
} from 'lucide-react';
import { formatDateTime } from '@/utils/date';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export function Review() {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = useAppStore((s) => s.getEvent(id!));
  const regs = useAppStore((s) => s.getEventRegistrations(id!));
  const checkins = useAppStore((s) => s.getEventCheckIns(id!));
  const feedbacks = useAppStore((s) => s.getEventFeedbacks(id!));
  const getParticipant = useAppStore((s) => s.getParticipant);
  const notifications = useAppStore((s) => s.getEventNotifications(id!));

  if (!event) return null;

  const confirmed = regs.filter((r) => ['confirmed', 'checked_in', 'no_show'].includes(r.status)).length;
  const checked = regs.filter((r) => r.status === 'checked_in').length;
  const noShow = regs.filter((r) => r.status === 'no_show').length;
  const cancelled = regs.filter((r) => r.status === 'cancelled').length;
  const waitlist = regs.filter((r) => r.status === 'waitlist').length;
  const attendanceRate = confirmed > 0 ? Math.round((checked / confirmed) * 100) : 0;

  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length)
    : 0;
  const feedbackRate = regs.filter((r) => r.status === 'checked_in').length > 0
    ? Math.round((feedbacks.length / regs.filter((r) => r.status === 'checked_in').length) * 100)
    : 0;

  const regTimeline = useMemo(() => {
    const days: Record<string, number> = {};
    regs.forEach((r) => {
      const d = formatDateTime(r.registeredAt).slice(5, 10);
      days[d] = (days[d] || 0) + 1;
    });
    return Object.entries(days)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count], i, arr) => ({
        date,
        新增报名: count,
        累计: arr.slice(0, i + 1).reduce((s, [, c]) => s + c, 0),
      }));
  }, [regs]);

  const checkInTimeline = useMemo(() => {
    const hours: Record<string, number> = {};
    checkins.forEach((c) => {
      const h = formatDateTime(c.checkedInAt).slice(11, 16);
      hours[h] = (hours[h] || 0) + 1;
    });
    return Object.entries(hours)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([hour, count]) => ({ hour, 签到人数: count }));
  }, [checkins]);

  const radarData = useMemo(() => {
    const kw: Record<string, number> = {};
    feedbacks.forEach((f) => f.keywords.forEach((k) => (kw[k] = (kw[k] || 0) + 1)));
    const items = Object.entries(kw)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([k, v]) => ({ subject: k, A: v * 20, fullMark: 100 }));
    if (items.length < 3) {
      items.push(
        { subject: '氛围', A: 80, fullMark: 100 },
        { subject: '内容', A: 75, fullMark: 100 },
        { subject: '场地', A: 70, fullMark: 100 }
      );
    }
    return items;
  }, [feedbacks]);

  const pieData = [
    { name: '已签到', value: checked, color: '#10B981' },
    { name: '未到场', value: noShow, color: '#EF4444' },
    { name: '候补到场', value: checkins.filter((c) => regs.find((r) => r.id === c.registrationId)?.waitlistPosition).length, color: '#E8A87C' },
    { name: '取消', value: cancelled, color: '#9D8A74' },
  ];

  const topParticipants = regs
    .filter((r) => r.status === 'checked_in')
    .map((r) => {
      const p = getParticipant(r.participantId);
      return { ...r, participant: p, regs: p?.totalRegistrations || 0 };
    })
    .sort((a, b) => b.regs - a.regs)
    .slice(0, 5);

  const newFaces = regs.filter((r) => {
    const p = getParticipant(r.participantId);
    return p && p.totalRegistrations <= 1;
  }).length;

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard icon={Users} label="报名总数" value={confirmed + waitlist + cancelled} accent="ink" sub={`正式${confirmed} · 候补${waitlist}`} />
        <StatCard icon={UserCheck} label="实际到场" value={checked} accent="emerald" sub={`到场率 ${attendanceRate}%`} />
        <StatCard icon={Star} label="综合评分" value={avgRating.toFixed(1)} accent="amber" sub={`${feedbacks.length} 人反馈 (${feedbackRate}%)`} />
        <StatCard icon={Sparkles} label="新面孔占比" value={confirmed > 0 ? Math.round((newFaces / confirmed) * 100) : 0 + '%'} accent="espresso" sub={`${newFaces} 位首次参与`} />
        <StatCard icon={Bookmark} label="历史场次" value="#007" accent="ink" sub={`比上一场 +${Math.max(0, attendanceRate - 65)}% 到场率`} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="paper-card p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-serif text-lg font-semibold text-espresso-800">活动信息概览</h3>
                <p className="text-xs text-espresso-400 mt-0.5">关键信息速览</p>
              </div>
              <button
                onClick={() => navigate(`/events/new`)}
                className="btn-secondary !py-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                基于本场创建
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <InfoRow icon={BookOpen} label="本期书目" value={event.bookTitle ? `《${event.bookTitle}》` : '—'} sub={event.bookAuthor} />
              <InfoRow icon={Calendar} label="活动时间" value={formatDateTime(event.startTime, false)} sub={`${formatDateTime(event.startTime).slice(11, 16)} - ${formatDateTime(event.endTime).slice(11, 16)}`} />
              <InfoRow icon={MapPin} label="活动地点" value={event.location.split('·')[0]} sub={event.location.split('·')[1] || ''} />
              <InfoRow icon={Target} label="通知触达" value={`${notifications.reduce((s, n) => s + n.sentCount, 0)} 人次`} sub={`${notifications.length} 条消息`} />
            </div>
            {event.notes && (
              <div className="mt-5 p-4 rounded-xl bg-paper-50 border border-paper-200">
                <p className="text-xs font-medium text-espresso-400 mb-1 flex items-center gap-1">
                  <FileText className="w-3 h-3" /> 活动备注
                </p>
                <p className="text-sm text-espresso-600">{event.notes}</p>
              </div>
            )}
          </div>

          <div className="paper-card p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-serif text-lg font-semibold text-espresso-800">报名趋势</h3>
                <p className="text-xs text-espresso-400 mt-0.5">按日新增报名及累计曲线</p>
              </div>
              <span className="badge bg-ink-50 text-ink-700">
                <BarChart3 className="w-3 h-3" />
                报名数据分析
              </span>
            </div>
            <div className="h-72">
              {regTimeline.length < 2 ? (
                <div className="h-full flex items-center justify-center">
                  <EmptyState icon={TrendingUp} title="数据点不足" hint="多次报名可形成趋势曲线" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={regTimeline} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EFE9DE" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#7A6650' }} axisLine={{ stroke: '#E5DCCD' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#7A6650' }} axisLine={{ stroke: '#E5DCCD' }} />
                    <Tooltip
                      contentStyle={{ background: '#fff', border: '1px solid #E5DCCD', borderRadius: 12, boxShadow: '0 4px 20px rgba(45, 74, 62, 0.10)' }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, color: '#7A6650' }} />
                    <Line type="monotone" dataKey="累计" stroke="#2D4A3E" strokeWidth={3} dot={{ fill: '#2D4A3E', r: 4 }} />
                    <Line type="monotone" dataKey="新增报名" stroke="#E8A87C" strokeWidth={2.5} dot={{ fill: '#E8A87C', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="paper-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg font-semibold text-espresso-800">签到高峰分布</h3>
                <span className="badge bg-emerald-50 text-emerald-700">
                  <Clock className="w-3 h-3" /> 按小时
                </span>
              </div>
              <div className="h-56">
                {checkInTimeline.length < 2 ? (
                  <div className="h-full flex items-center justify-center">
                    <EmptyState icon={Clock} title="暂无签到数据" hint="活动进行时可查看实时分布" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={checkInTimeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#EFE9DE" />
                      <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#7A6650' }} />
                      <YAxis tick={{ fontSize: 11, fill: '#7A6650' }} />
                      <Tooltip />
                      <Bar dataKey="签到人数" fill="#4A6E63" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="paper-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg font-semibold text-espresso-800">参与情况构成</h3>
                <span className="badge bg-amber-50 text-amber-700">
                  <Bookmark className="w-3 h-3" /> 状态占比
                </span>
              </div>
              <div className="h-56 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="paper-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-semibold text-espresso-800">关键词雷达</h3>
              <span className="badge bg-ink-50 text-ink-700">
                <Sparkles className="w-3 h-3" /> 反馈维度
              </span>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#E5DCCD" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#5D4B38' }} />
                  <PolarRadiusAxis tick={{ fontSize: 9, fill: '#9D8A74' }} />
                  <Radar name="评分" dataKey="A" stroke="#2D4A3E" fill="#4A6E63" fillOpacity={0.3} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="ink-card p-6 relative overflow-hidden bg-grain">
            <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-amber-400/10 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-amber-300" />
                <h3 className="font-serif text-lg font-semibold text-white">核心指标</h3>
              </div>
              <div className="space-y-4">
                <KPI label="到场率" value={`${attendanceRate}%`} target={80} />
                <KPI label="反馈回收率" value={`${feedbackRate}%`} target={50} />
                <KPI label="好评率" value={feedbacks.length ? `${Math.round(((feedbacks.filter(f => f.rating >= 4).length) / feedbacks.length) * 100)}%` : '—'} target={80} />
                <KPI label="候补转化率" value={waitlist > 0 ? `${Math.round((checkins.filter(c => regs.find(r => r.id === c.registrationId)?.waitlistPosition).length / waitlist) * 100)}%` : '—'} target={30} />
              </div>
            </div>
          </div>

          <div className="paper-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-semibold text-espresso-800">核心书友 TOP5</h3>
              <button
                onClick={() => navigate(`/events/${id}/registrations`)}
                className="text-xs text-ink-600 hover:text-ink-700 flex items-center gap-0.5"
              >
                全部名单
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {topParticipants.length === 0 ? (
              <EmptyState icon={Award} title="暂无数据" hint="活动结束后统计排名" />
            ) : (
              <ul className="space-y-2.5">
                {topParticipants.map((r, i) => (
                  <li
                    key={r.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-paper-50 transition-colors"
                  >
                    <div className={
                      i === 0 ? 'w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 text-espresso-800 flex items-center justify-center font-bold text-sm shadow-sm' :
                      i === 1 ? 'w-8 h-8 rounded-lg bg-gradient-to-br from-espresso-300 to-espresso-400 text-white flex items-center justify-center font-bold text-sm shadow-sm' :
                      i === 2 ? 'w-8 h-8 rounded-lg bg-gradient-to-br from-amber-200 to-amber-300 text-espresso-800 flex items-center justify-center font-bold text-sm shadow-sm' :
                      'w-8 h-8 rounded-lg bg-paper-100 text-espresso-500 flex items-center justify-center font-bold text-sm'
                    }>
                      {i + 1}
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-ink-100 to-ink-200 flex items-center justify-center text-ink-700 font-medium text-sm">
                      {r.participant?.name?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-espresso-800 text-sm truncate">{r.participant?.name}</p>
                      <p className="text-xs text-espresso-400">{r.participant?.phone?.slice(-4)}</p>
                    </div>
                    <span className="text-xs font-semibold text-ink-700">{r.regs} 次</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="paper-card p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-4">
          <div>
            <h3 className="font-serif text-xl font-semibold text-espresso-800">复盘总结</h3>
            <p className="text-sm text-espresso-500 mt-1">记录活动经验沉淀，为下次活动提供参考</p>
          </div>
          <button className="btn-accent">
            <PenLine className="w-4 h-4" />
            编辑复盘笔记
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="p-5 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h4 className="font-semibold text-emerald-800">做得好的地方</h4>
            </div>
            <ul className="space-y-2 text-sm text-emerald-800/90">
              {feedbacks.length > 0 ? Object.entries(
                feedbacks
                  .flatMap(f => f.keywords)
                  .reduce<Record<string, number>>((acc, k) => ((acc[k] = (acc[k] || 0) + 1), acc), {})
              )
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4)
                .map(([k]) => (
                  <li key={k} className="flex items-start gap-2">
                    <ArrowRight className="w-3.5 h-3.5 mt-1 flex-shrink-0 text-emerald-600" />
                    <span>{k} · 书友反馈好</span>
                  </li>
                )) || [] : (
                <>
                  <li className="flex items-start gap-2"><ArrowRight className="w-3.5 h-3.5 mt-1 flex-shrink-0 text-emerald-600" /><span>签到效率提升，核销迅速</span></li>
                  <li className="flex items-start gap-2"><ArrowRight className="w-3.5 h-3.5 mt-1 flex-shrink-0 text-emerald-600" /><span>到场率表现良好</span></li>
                </>
              )}
            </ul>
          </div>
          <div className="p-5 rounded-xl bg-red-50/60 border border-red-100">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="w-5 h-5 text-red-500" />
              <h4 className="font-semibold text-red-800">可改进之处</h4>
            </div>
            <ul className="space-y-2 text-sm text-red-800/80">
              {noShow > 0 && (
                <li className="flex items-start gap-2"><ArrowRight className="w-3.5 h-3.5 mt-1 flex-shrink-0 text-red-500" /><span>未到场 {noShow} 人，候补转化可提升</span></li>
              )}
              {feedbackRate < 50 && (
                <li className="flex items-start gap-2"><ArrowRight className="w-3.5 h-3.5 mt-1 flex-shrink-0 text-red-500" /><span>反馈率低于 50%，需激励机制</span></li>
              )}
              <li className="flex items-start gap-2"><ArrowRight className="w-3.5 h-3.5 mt-1 flex-shrink-0 text-red-500" /><span>取消规则可进一步明确</span></li>
              <li className="flex items-start gap-2"><ArrowRight className="w-3.5 h-3.5 mt-1 flex-shrink-0 text-red-500" /><span>活动时间可调整至周六下午</span></li>
            </ul>
          </div>
          <div className="p-5 rounded-xl bg-amber-50/60 border border-amber-100">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h4 className="font-semibold text-amber-900">下次建议</h4>
            </div>
            <ul className="space-y-2 text-sm text-amber-900/80">
              <li className="flex items-start gap-2"><ArrowRight className="w-3.5 h-3.5 mt-1 flex-shrink-0 text-amber-600" /><span>尝试不同时段（如周日下午）</span></li>
              <li className="flex items-start gap-2"><ArrowRight className="w-3.5 h-3.5 mt-1 flex-shrink-0 text-amber-600" /><span>增加分组讨论环节</span></li>
              <li className="flex items-start gap-2"><ArrowRight className="w-3.5 h-3.5 mt-1 flex-shrink-0 text-amber-600" /><span>提供电子版阅读材料</span></li>
              <li className="flex items-start gap-2"><ArrowRight className="w-3.5 h-3.5 mt-1 flex-shrink-0 text-amber-600" /><span>发放反馈有礼（咖啡券）</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value, sub }: any) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-ink-50 text-ink-700 flex items-center justify-center">
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs text-espresso-400 font-medium">{label}</span>
      </div>
      <p className="font-semibold text-espresso-800 line-clamp-1">{value}</p>
      {sub && <p className="text-xs text-espresso-400 mt-0.5">{sub}</p>}
    </div>
  );
}

function KPI({ label, value, target }: { label: string; value: string; target: number }) {
  const v = parseInt(value) || 0;
  const pct = Math.min(100, v);
  const met = v >= target;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-ink-100">{label}</span>
        <span className={`font-serif text-xl font-semibold ${met ? 'text-amber-300' : 'text-white'}`}>{value}</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${met ? 'bg-gradient-to-r from-amber-300 to-amber-400' : 'bg-white/30'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-ink-300">目标 {target}%</span>
        {met && <span className="text-[10px] text-amber-300 flex items-center gap-0.5"><CheckCircle2 className="w-2.5 h-2.5" />已达成</span>}
      </div>
    </div>
  );
}
