import type { EventStatus, RegistrationStatus } from '@/types';
import { CheckCircle2, Clock, XCircle, Loader2, Sparkles } from 'lucide-react';
import clsx from 'clsx';

const eventStatusMap: Record<EventStatus, { label: string; className: string; dot: string }> = {
  draft: { label: '草稿', className: 'bg-espresso-100 text-espresso-600', dot: 'bg-espresso-400' },
  published: { label: '已发布', className: 'bg-ink-100 text-ink-700', dot: 'bg-ink-500' },
  registration_open: { label: '报名中', className: 'bg-amber-100 text-amber-800', dot: 'bg-amber-500' },
  upcoming: { label: '即将开始', className: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' },
  ongoing: { label: '进行中', className: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  completed: { label: '已完成', className: 'bg-paper-200 text-espresso-600', dot: 'bg-espresso-400' },
  cancelled: { label: '已取消', className: 'bg-red-50 text-red-600', dot: 'bg-red-400' },
};

const regStatusMap: Record<RegistrationStatus, { label: string; className: string; icon?: any }> = {
  pending: { label: '待确认', className: 'bg-amber-100 text-amber-700', icon: Clock },
  confirmed: { label: '已确认', className: 'bg-ink-100 text-ink-700', icon: CheckCircle2 },
  waitlist: { label: '候补', className: 'bg-blue-50 text-blue-700', icon: Loader2 },
  cancelled: { label: '已取消', className: 'bg-red-50 text-red-600', icon: XCircle },
  checked_in: { label: '已签到', className: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
  no_show: { label: '未到场', className: 'bg-red-50 text-red-500', icon: XCircle },
};

export function EventStatusBadge({ status }: { status: EventStatus }) {
  const cfg = eventStatusMap[status];
  return (
    <span className={clsx('badge', cfg.className)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  );
}

export function RegistrationStatusBadge({ status }: { status: RegistrationStatus }) {
  const cfg = regStatusMap[status];
  const Icon = cfg.icon;
  return (
    <span className={clsx('badge', cfg.className)}>
      {Icon && <Icon className="w-3 h-3" />}
      {cfg.label}
    </span>
  );
}

export function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  sub,
}: {
  icon: any;
  label: string;
  value: string | number;
  accent?: 'ink' | 'amber' | 'espresso' | 'emerald';
  sub?: string;
}) {
  const accents = {
    ink: 'from-ink-600 to-ink-700 text-ink-50',
    amber: 'from-amber-400 to-amber-500 text-espresso-800',
    espresso: 'from-espresso-600 to-espresso-700 text-white',
    emerald: 'from-emerald-500 to-emerald-600 text-white',
  };
  return (
    <div className="paper-card p-5 overflow-hidden relative group hover:shadow-card transition-shadow duration-300">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-espresso-500 font-medium">{label}</p>
          <p className="mt-2 font-serif text-3xl font-semibold text-espresso-800 tracking-tight">
            {value}
          </p>
          {sub && <p className="mt-1 text-xs text-espresso-400">{sub}</p>}
        </div>
        <div className={clsx('w-11 h-11 rounded-xl bg-gradient-to-br shadow-md flex items-center justify-center', accents[accent || 'ink'])}>
          <Icon className="w-5 h-5" strokeWidth={2} />
        </div>
      </div>
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gradient-to-br from-ink-100 to-transparent opacity-0 group-hover:opacity-60 transition-opacity" />
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  hint,
  action,
}: {
  icon?: any;
  title: string;
  hint?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-paper-200 to-paper-100 border border-paper-300 flex items-center justify-center mb-5">
        {Icon ? <Icon className="w-8 h-8 text-espresso-400" strokeWidth={1.5} /> : <Sparkles className="w-8 h-8 text-espresso-400" />}
      </div>
      <h3 className="font-serif text-lg font-medium text-espresso-700 mb-2">{title}</h3>
      {hint && <p className="text-sm text-espresso-400 max-w-sm mb-5">{hint}</p>}
      {action && action}
    </div>
  );
}
