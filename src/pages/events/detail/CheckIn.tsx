import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { RegistrationStatusBadge, StatCard, EmptyState } from '@/components/ui/Badges';
import {
  QrCode,
  Search,
  UserCheck,
  Users,
  Clock,
  UserX,
  Hand,
  Plus,
  X,
  Scan,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Volume2,
  Share2,
  Download,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import clsx from 'clsx';
import { formatDateTime, formatTime } from '@/utils/date';
import { CheckInMethod } from '@/types';

export function CheckIn() {
  const { id } = useParams();
  const event = useAppStore((s) => s.getEvent(id!));
  const regs = useAppStore((s) => s.getEventRegistrations(id!));
  const checkins = useAppStore((s) => s.getEventCheckIns(id!));
  const getParticipant = useAppStore((s) => s.getParticipant);
  const doCheckIn = useAppStore((s) => s.checkIn);
  const manualCheckIn = useAppStore((s) => s.manualCheckIn);
  const walkIn = useAppStore((s) => s.walkInCheckIn);

  const [search, setSearch] = useState('');
  const [input, setInput] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'warning'; message: string; name?: string } | null>(null);
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [recent, setRecent] = useState<{ id: string; name: string; time: string; method: CheckInMethod }[]>([]);

  const totalConfirmed = regs.filter((r) => ['confirmed', 'checked_in', 'no_show'].includes(r.status)).length;
  const alreadyChecked = regs.filter((r) => r.status === 'checked_in').length;
  const waitlistChecked = checkins.filter((c) => {
    const r = regs.find((rr) => rr.id === c.registrationId);
    return r?.status === 'checked_in' && useAppStore.getState().getParticipant(c.participantId);
  }).length;
  const attendanceRate = totalConfirmed > 0 ? Math.round((alreadyChecked / totalConfirmed) * 100) : 0;
  const notYet = totalConfirmed - alreadyChecked;

  useEffect(() => {
    const items = [...checkins]
      .sort((a, b) => new Date(b.checkedInAt).getTime() - new Date(a.checkedInAt).getTime())
      .slice(0, 8)
      .map((c) => ({
        id: c.id,
        name: getParticipant(c.participantId)?.name || '?',
        time: c.checkedInAt,
        method: c.checkInMethod,
      }));
    setRecent(items);
  }, [checkins.length, getParticipant]);

  const handleSubmit = () => {
    if (!input.trim()) return;
    const res = doCheckIn(id!, input.trim(), 'qr_code');
    setToast({
      type: res.success ? 'success' : 'warning',
      message: res.message,
      name: res.participant?.name,
    });
    if (res.success) {
      setInput('');
    }
    setTimeout(() => setToast(null), 3000);
  };

  const pendingList = useMemo(() => {
    let list = regs.filter((r) => r.status !== 'cancelled' && r.status !== 'checked_in');
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      list = list.filter((r) => {
        const p = getParticipant(r.participantId);
        return (p?.name || '').toLowerCase().includes(s) || (p?.phone || '').includes(s);
      });
    }
    return list.sort((a, b) => {
      const order: Record<string, number> = { confirmed: 0, waitlist: 1, pending: 2, no_show: 3 };
      return (order[a.status] || 0) - (order[b.status] || 0);
    });
  }, [regs, search, getParticipant]);

  if (!event) return null;

  return (
    <div className="space-y-6 animate-slide-up">
      {toast && (
        <div
          className={clsx(
            'fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lift animate-slide-up border',
            toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
            toast.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' :
            'bg-red-50 border-red-200 text-red-800'
          )}
        >
          <div className={clsx('w-9 h-9 rounded-full flex items-center justify-center',
            toast.type === 'success' ? 'bg-emerald-500/20' :
            toast.type === 'warning' ? 'bg-amber-500/20' : 'bg-red-500/20')}>
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> :
             <AlertTriangle className="w-5 h-5" />}
          </div>
          <div>
            {toast.name && <p className="text-xs opacity-70">参与者：{toast.name}</p>}
            <p className="font-medium">{toast.message}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={UserCheck}
          label="已签到"
          value={alreadyChecked}
          accent="emerald"
          sub={`候补到场 ${checkins.filter(c => {
            const r = regs.find(rr => rr.id === c.registrationId);
            return r?.waitlistPosition !== undefined;
          }).length} 人`}
        />
        <StatCard icon={Users} label="待签到" value={notYet} accent="ink" sub={`含候补 ${regs.filter(r => r.status === 'waitlist').length} 人`} />
        <StatCard
          icon={Zap}
          label="到场率"
          value={`${attendanceRate}%`}
          accent="amber"
          sub={`目标 80% · ${attendanceRate >= 80 ? '已达成 ✓' : `差 ${80 - attendanceRate}%`}`}
        />
        <StatCard icon={Clock} label="活动状态" value={formatTime(event.startTime)} accent="espresso" sub={`${formatDateTime(event.startTime, false)} 开始`} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="paper-card overflow-hidden">
            <div className="p-6 bg-gradient-to-br from-ink-800 via-ink-700 to-ink-800 text-white relative overflow-hidden">
              <div className="absolute -top-20 -right-10 w-56 h-56 rounded-full bg-amber-400/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full bg-ink-500/30 blur-3xl" />
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur border border-white/15 flex items-center justify-center">
                    <Scan className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl font-semibold">签到核销</h2>
                    <p className="text-ink-200 text-sm mt-0.5">输入签到码或搜索姓名/手机号</p>
                  </div>
                </div>
                <div className="relative max-w-2xl">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-amber-400/20 flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-amber-300" />
                  </div>
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="输入 6 位签到码 / 姓名 / 手机号…"
                    autoFocus
                    className="w-full pl-16 pr-32 py-4 rounded-2xl bg-white/95 text-espresso-800 placeholder:text-espresso-300 text-lg shadow-lift outline-none focus:ring-4 focus:ring-amber-400/30 transition-all"
                  />
                  <button
                    onClick={handleSubmit}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 text-espresso-800 font-medium hover:from-amber-300 hover:to-amber-400 transition-colors flex items-center gap-2 shadow-md"
                  >
                    <Zap className="w-4 h-4" />
                    核销
                  </button>
                </div>
                <div className="mt-5 flex items-center gap-3 flex-wrap text-sm">
                  <button
                    onClick={() => setShowWalkIn(true)}
                    className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur border border-white/15 text-white hover:bg-white/20 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    现场登记签到
                  </button>
                  <button className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur border border-white/15 text-white hover:bg-white/20 transition-colors flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    生成签到码海报
                  </button>
                  <button className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur border border-white/15 text-white hover:bg-white/20 transition-colors flex items-center gap-2">
                    <Volume2 className="w-4 h-4" />
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-soft mr-1"></span>
                    语音播报开
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-espresso-800">待签到名单</h3>
                  <p className="text-xs text-espresso-400 mt-0.5">共 {pendingList.length} 人 · 点击即可签到</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-paper-300 w-64">
                  <Search className="w-4 h-4 text-espresso-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="搜索待签到用户…"
                    className="flex-1 bg-transparent outline-none text-sm"
                  />
                </div>
              </div>

              {pendingList.length === 0 ? (
                <EmptyState icon={Sparkles} title="大家都到了！" hint="所有已确认报名的书友都完成签到啦 🎉" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto scroll-area pr-2">
                  {pendingList.map((r) => {
                    const p = getParticipant(r.participantId);
                    return (
                      <button
                        key={r.id}
                        onClick={() => {
                          manualCheckIn(r.id);
                          setToast({ type: 'success', message: '签到成功！', name: p?.name });
                          setTimeout(() => setToast(null), 2500);
                        }}
                        className="group flex items-center gap-3 p-3 rounded-xl border border-paper-200 bg-white hover:bg-gradient-to-r hover:from-ink-50 hover:to-white hover:border-ink-200 hover:shadow-card transition-all text-left"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-paper-100 to-paper-200 flex items-center justify-center text-espresso-700 font-medium group-hover:from-amber-100 group-hover:to-amber-200 transition-colors">
                          {p?.name?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-espresso-800 truncate">{p?.name}</p>
                            <RegistrationStatusBadge status={r.status} />
                          </div>
                          <p className="text-xs text-espresso-400">{p?.phone}</p>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-paper-100 group-hover:bg-ink-700 text-espresso-300 group-hover:text-white flex items-center justify-center transition-colors">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="paper-card p-6 overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-serif text-lg font-semibold text-espresso-800">实时到场率</h3>
                <p className="text-xs text-espresso-400 mt-0.5">目标 80%</p>
              </div>
              <button className="p-2 rounded-lg text-espresso-400 hover:bg-paper-100 hover:text-ink-600 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-center">
              <DonutChart percentage={attendanceRate} label="到场率" sub={`${alreadyChecked} / ${totalConfirmed} 人`} />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-paper-200">
              <LegendItem color="bg-emerald-500" label="已签到" value={alreadyChecked} />
              <LegendItem color="bg-amber-400" label="候补到场" value={waitlistChecked} />
              <LegendItem color="bg-ink-300" label="未到" value={notYet} />
              <LegendItem color="bg-red-400" label="已取消" value={regs.filter(r => r.status === 'cancelled').length} />
            </div>
          </div>

          <div className="paper-card overflow-hidden">
            <div className="px-5 py-4 border-b border-paper-200 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-semibold text-espresso-800">签到流水</h3>
                <p className="text-xs text-espresso-400 mt-0.5">实时更新</p>
              </div>
              <span className="badge bg-emerald-50 text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-soft" />
                实时
              </span>
            </div>
            {recent.length === 0 ? (
              <div className="p-8">
                <EmptyState icon={Hand} title="等待书友到场" hint="扫码签到后将出现在这里" />
              </div>
            ) : (
              <ul className="divide-y divide-paper-100 max-h-[360px] overflow-y-auto scroll-area">
                {recent.map((r) => (
                  <li key={r.id} className="px-5 py-3 flex items-center gap-3 animate-slide-in">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-espresso-700 text-sm truncate">{r.name}</p>
                      <p className="text-xs text-espresso-400">
                        {r.method === 'qr_code' ? '扫码签到' : r.method === 'manual' ? '手动签到' : '现场登记'}
                      </p>
                    </div>
                    <p className="text-xs font-mono text-espresso-500">{formatTime(r.time)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {showWalkIn && <WalkInDialog eventId={id!} onClose={() => setShowWalkIn(false)} />}
    </div>
  );
}

function LegendItem({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
      <span className="text-xs text-espresso-500 flex-1">{label}</span>
      <span className="text-sm font-semibold text-espresso-800">{value}</span>
    </div>
  );
}

function DonutChart({ percentage, label, sub }: { percentage: number; label: string; sub: string }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-48 h-48">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="donutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4A6E63" />
            <stop offset="50%" stopColor="#E8A87C" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r={radius} stroke="#EFE9DE" strokeWidth="16" fill="none" />
        <circle
          cx="100"
          cy="100"
          r={radius}
          stroke="url(#donutGrad)"
          strokeWidth="16"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-serif text-4xl font-semibold text-espresso-800 tracking-tight">
          {percentage}%
        </p>
        <p className="text-sm text-espresso-500 font-medium mt-1">{label}</p>
        <p className="text-xs text-espresso-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

function WalkInDialog({ eventId, onClose }: { eventId: string; onClose: () => void }) {
  const walkIn = useAppStore((s) => s.walkInCheckIn);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const submit = () => {
    const r = walkIn(eventId, { name, phone, email });
    if (r) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-espresso-800/40 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-lift border border-paper-300 animate-slide-up overflow-hidden"
      >
        <div className="px-6 py-5 bg-gradient-to-br from-ink-800 to-ink-700 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-amber-400/20 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur border border-white/15 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-serif text-xl font-semibold">现场登记签到</h3>
              <p className="text-ink-200 text-sm mt-0.5">未提前报名的书友快速入场</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="label-base">姓名 *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-base" placeholder="请输入姓名" />
          </div>
          <div>
            <label className="label-base">手机号 *</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input-base" placeholder="用于后续活动通知" />
          </div>
          <div>
            <label className="label-base">邮箱</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="input-base" placeholder="选填" />
          </div>
        </div>
        <div className="px-6 py-4 bg-paper-50 border-t border-paper-200 flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">取消</button>
          <button onClick={submit} className="btn-primary" disabled={!name || !phone}>
            <Download className="w-4 h-4" />
            完成签到
          </button>
        </div>
      </div>
    </div>
  );
}
