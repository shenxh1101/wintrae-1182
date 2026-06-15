import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { EventStatusBadge, StatCard } from '@/components/ui/Badges';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  Users,
  Clock,
  MoreVertical,
  Copy,
  Eye,
  Pencil,
  Trash2,
  QrCode,
  CalendarRange,
  BarChart3,
  BookOpen,
  TrendingUp,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { formatDate, formatTime, weekdayName, formatRelative } from '@/utils/date';
import type { EventStatus, BookClubEvent } from '@/types';
import clsx from 'clsx';

const statusFilters: { key: EventStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部活动' },
  { key: 'registration_open', label: '报名中' },
  { key: 'upcoming', label: '即将开始' },
  { key: 'ongoing', label: '进行中' },
  { key: 'draft', label: '草稿' },
  { key: 'completed', label: '已完成' },
  { key: 'cancelled', label: '已取消' },
];

export function EventList() {
  const navigate = useNavigate();
  const { events, duplicateEvent, deleteEvent } = useAppStore();
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inMonth = events.filter((e) => {
      const d = new Date(e.startTime);
      return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
    });
    const totalRegs = events.reduce((sum, e) => sum + e.currentConfirmed + e.currentWaitlist, 0);
    const completed = events.filter((e) => e.status === 'completed');
    const avgRate = completed.length > 0
      ? Math.round(completed.reduce((sum, e) => {
          const all = e.currentConfirmed;
          const allRegs = useAppStore.getState().getEventRegistrations(e.id);
          const checked = allRegs.filter((r) => r.status === 'checked_in').length;
          return sum + (all > 0 ? (checked / all) * 100 : 0);
        }, 0) / completed.length)
      : 0;
    return {
      total: events.length,
      thisMonth: inMonth.length,
      totalRegs,
      avgAttendance: avgRate,
    };
  }, [events]);

  const filtered = useMemo(() => {
    let list = [...events];
    if (statusFilter !== 'all') {
      list = list.filter((e) => e.status === statusFilter);
    }
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      list = list.filter((e) =>
        e.title.toLowerCase().includes(s) ||
        (e.bookTitle || '').toLowerCase().includes(s) ||
        (e.bookAuthor || '').toLowerCase().includes(s) ||
        e.location.toLowerCase().includes(s)
      );
    }
    return list.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [events, statusFilter, search]);

  const quickActions = [
    { label: '查看名单', icon: Users, action: (e: BookClubEvent) => navigate(`/events/${e.id}/registrations`) },
    { label: '签到', icon: QrCode, action: (e: BookClubEvent) => navigate(`/events/${e.id}/checkin`) },
    { label: '通知', icon: BarChart3, action: (e: BookClubEvent) => navigate(`/events/${e.id}/notifications`) },
    { label: '复盘', icon: CalendarRange, action: (e: BookClubEvent) => navigate(`/events/${e.id}/review`) },
  ];

  return (
    <div className="space-y-7 animate-slide-up">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={BookOpen} label="全部活动" value={stats.total} accent="ink" sub="书店累计读书会场次" />
        <StatCard icon={CalendarRange} label="本月活动" value={stats.thisMonth} accent="amber" sub={`${new Date().getFullYear()}年${new Date().getMonth() + 1}月`} />
        <StatCard icon={Users} label="总报名人次" value={stats.totalRegs} accent="espresso" sub="含已确认和候补" />
        <StatCard icon={TrendingUp} label="平均到场率" value={`${stats.avgAttendance}%`} accent="emerald" sub="已完成活动统计" />
      </div>

      <div className="paper-card p-5">
        <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
          <div>
            <h2 className="font-serif text-xl font-semibold text-espresso-800">活动台账</h2>
            <p className="text-sm text-espresso-500 mt-1">管理读书会全生命周期：创建、发布、签到、复盘</p>
          </div>
          <button
            onClick={() => navigate('/events/new')}
            className="btn-primary"
          >
            <Plus className="w-4 h-4" />
            新建活动
          </button>
        </div>

        <div className="flex items-center gap-3 pb-4 border-b border-paper-300 mb-5 overflow-x-auto scroll-area">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-paper-100 border border-paper-300 w-72 shrink-0">
            <Search className="w-4 h-4 text-espresso-400" />
            <input
              type="text"
              placeholder="搜索活动、书目、地点…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm flex-1 text-espresso-700 placeholder:text-espresso-300"
            />
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {statusFilters.map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                  statusFilter === f.key
                    ? 'bg-ink-700 text-white shadow-md'
                    : 'text-espresso-500 hover:bg-paper-200 hover:text-espresso-700'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="ml-auto shrink-0 flex items-center gap-2 text-espresso-500 hover:text-ink-700 cursor-pointer px-3 py-2 rounded-lg hover:bg-paper-200 transition-colors">
            <Filter className="w-4 h-4" />
            <span className="text-sm">高级筛选</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 text-center">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-paper-100 border border-paper-300 flex items-center justify-center mb-4">
              <Sparkles className="w-9 h-9 text-espresso-300" />
            </div>
            <h3 className="font-serif text-lg font-medium text-espresso-700 mb-1">暂无匹配的活动</h3>
            <p className="text-sm text-espresso-400 mb-5">试试调整筛选条件，或者创建一场新的读书会</p>
            <button onClick={() => navigate('/events/new')} className="btn-primary">
              <Plus className="w-4 h-4" /> 立即创建
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
            {filtered.map((event, idx) => (
              <EventCard
                key={event.id}
                event={event}
                index={idx}
                openMenu={openMenu}
                setOpenMenu={setOpenMenu}
                onOpen={quickActions[0].action}
                onDuplicate={() => duplicateEvent(event.id)}
                onDelete={() => deleteEvent(event.id)}
                quickActions={quickActions.slice(1)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EventCard({
  event,
  index,
  openMenu,
  setOpenMenu,
  onOpen,
  onDuplicate,
  onDelete,
  quickActions,
}: {
  event: BookClubEvent;
  index: number;
  openMenu: string | null;
  setOpenMenu: (v: string | null) => void;
  onOpen: (e: BookClubEvent) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  quickActions: { label: string; icon: any; action: (e: BookClubEvent) => void }[];
}) {
  const navigate = useNavigate();
  const statusBarColor: Record<EventStatus, string> = {
    draft: 'bg-espresso-300',
    published: 'bg-ink-400',
    registration_open: 'bg-amber-400',
    upcoming: 'bg-blue-400',
    ongoing: 'bg-emerald-400',
    completed: 'bg-espresso-400',
    cancelled: 'bg-red-300',
  };
  const progress = event.maxCapacity > 0 ? Math.min(100, (event.currentConfirmed / event.maxCapacity) * 100) : 0;
  const seatsLeft = event.maxCapacity - event.currentConfirmed;

  return (
    <div
      onClick={() => onOpen(event)}
      className="group paper-card overflow-hidden cursor-pointer hover:shadow-lift hover:-translate-y-1 transition-all duration-300 animate-slide-up relative"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className={clsx('absolute top-0 left-0 bottom-0 w-1', statusBarColor[event.status])} />

      <div className="p-5 pl-6">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <EventStatusBadge status={event.status} />
            <span className="text-xs text-espresso-400">{formatRelative(event.startTime)}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu(openMenu === event.id ? null : event.id);
            }}
            className="p-1.5 rounded-lg text-espresso-400 hover:bg-paper-200 hover:text-espresso-600 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {openMenu === event.id && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute right-4 top-12 z-20 w-40 py-1.5 rounded-xl bg-white border border-paper-300 shadow-lift animate-slide-up"
            >
              <MenuItem icon={Eye} label="查看详情" onClick={() => onOpen(event)} />
              <MenuItem icon={Pencil} label="编辑活动" onClick={() => navigate(`/events/${event.id}/edit`)} />
              <MenuItem icon={Copy} label="复制活动" onClick={onDuplicate} />
              <MenuItem icon={Trash2} label="删除活动" danger onClick={onDelete} />
            </div>
          )}
        </div>

        <h3 className="font-serif text-lg font-semibold text-espresso-800 leading-snug mb-2 group-hover:text-ink-700 transition-colors line-clamp-2">
          {event.title}
        </h3>
        {event.bookTitle && (
          <div className="flex items-center gap-2 mb-4 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-100 w-fit">
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-xs font-medium text-amber-800">《{event.bookTitle}》{event.bookAuthor ? ` · ${event.bookAuthor}` : ''}</span>
          </div>
        )}

        <div className="space-y-2 text-sm text-espresso-500 mb-5">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-espresso-400 shrink-0" />
            <span className="truncate">
              {formatDate(event.startTime)} {weekdayName(event.startTime)} {formatTime(event.startTime)}-{formatTime(event.endTime)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-espresso-400 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-1 text-espresso-500">
              <Users className="w-3.5 h-3.5" />
              <span>报名 {event.currentConfirmed}/{event.maxCapacity}</span>
            </div>
            {seatsLeft > 0 && event.status === 'registration_open' && (
              <span className="font-medium text-emerald-600">余 {seatsLeft} 席</span>
            )}
            {seatsLeft === 0 && event.status === 'registration_open' && (
              <span className="font-medium text-amber-600 flex items-center gap-1">
                <Clock className="w-3 h-3" /> 已满 · 候补 {event.currentWaitlist}
              </span>
            )}
          </div>
          <div className="w-full h-1.5 rounded-full bg-paper-200 overflow-hidden">
            <div
              className={clsx('status-bar', progress >= 100 ? 'bg-amber-500' : statusBarColor[event.status])}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-paper-200">
          {quickActions.map((a) => {
            const Icon = a.icon;
            return (
              <button
                key={a.label}
                onClick={(e) => {
                  e.stopPropagation();
                  a.action(event);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-espresso-500 hover:bg-ink-50 hover:text-ink-700 transition-colors"
              >
                <Icon className="w-3.5 h-3.5" />
                {a.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger }: { icon: any; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center gap-2 px-3.5 py-2 text-sm transition-colors',
        danger ? 'text-red-600 hover:bg-red-50' : 'text-espresso-600 hover:bg-paper-100'
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}
