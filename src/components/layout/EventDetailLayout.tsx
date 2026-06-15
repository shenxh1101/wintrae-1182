import { NavLink, useParams, Outlet, useNavigate } from 'react-router-dom';
import { detailNavItems } from './Sidebar';
import { useAppStore } from '@/store/useAppStore';
import { EventStatusBadge } from '@/components/ui/Badges';
import { formatDate, formatTime, weekdayName } from '@/utils/date';
import { BookOpen, MapPin, Users, ArrowLeft, Copy, Edit3, Share2 } from 'lucide-react';
import clsx from 'clsx';

export function EventDetailLayout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = useAppStore((s) => s.getEvent(id!));
  const duplicateEvent = useAppStore((s) => s.duplicateEvent);

  if (!event) {
    return (
      <div className="p-10 text-center text-espresso-500">
        活动不存在或已被删除
      </div>
    );
  }

  const progress = event.maxCapacity > 0 ? Math.min(100, (event.currentConfirmed / event.maxCapacity) * 100) : 0;

  return (
    <div className="h-full flex flex-col min-w-0">
      <div className="bg-gradient-to-br from-ink-800 via-ink-700 to-ink-800 text-white relative overflow-hidden bg-grain">
        <div className="absolute inset-0 opacity-30 grain-content">
          <div className="absolute -top-40 -right-20 w-96 h-96 rounded-full bg-gradient-to-br from-amber-400/20 to-transparent blur-3xl" />
          <div className="absolute -bottom-40 -left-20 w-96 h-96 rounded-full bg-gradient-to-tr from-ink-500/30 to-transparent blur-3xl" />
        </div>

        <div className="relative z-10 p-8">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex items-start gap-5 flex-1 min-w-0">
              <button
                onClick={() => navigate('/events')}
                className="mt-1 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <EventStatusBadge status={event.status} />
                  {event.tags?.length > 0 && event.tags.map((t) => (
                    <span key={t} className="badge bg-white/10 text-ink-100 border border-white/10">#{t}</span>
                  ))}
                </div>
                <h1 className="font-serif text-3xl font-semibold mb-2 text-white tracking-wide">
                  {event.title}
                </h1>
                {event.bookTitle && (
                  <div className="flex items-center gap-2 text-ink-200 text-sm">
                    <BookOpen className="w-4 h-4" />
                    <span className="font-medium">《{event.bookTitle}》</span>
                    {event.bookAuthor && <span className="text-ink-300">— {event.bookAuthor}</span>}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="btn-secondary !bg-white/10 !border-white/20 !text-white hover:!bg-white/20 hover:!border-white/30">
                <Share2 className="w-4 h-4" />
                分享
              </button>
              <button
                onClick={() => {
                  const nid = duplicateEvent(event.id);
                  navigate(`/events`);
                }}
                className="btn-secondary !bg-white/10 !border-white/20 !text-white hover:!bg-white/20 hover:!border-white/30"
              >
                <Copy className="w-4 h-4" />
                复制活动
              </button>
              <button className="btn-primary !bg-amber-400 !text-espresso-800 hover:!bg-amber-300">
                <Edit3 className="w-4 h-4" />
                编辑
              </button>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-ink-200">{formatDate(event.startTime)} {weekdayName(event.startTime)}</p>
                <p className="text-sm font-medium text-white">{formatTime(event.startTime)} - {formatTime(event.endTime)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <p className="text-xs text-ink-200">活动地点</p>
                <p className="text-sm font-medium text-white truncate">{event.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                <Users className="w-5 h-5 text-amber-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-xs text-ink-200 mb-1.5">
                  <span>报名进度</span>
                  <span className="font-medium text-white">{event.currentConfirmed}/{event.maxCapacity}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-ink-200">候补队列</p>
                <p className="text-sm font-medium text-white">
                  {event.currentWaitlist}
                  <span className="text-xs text-ink-300 ml-1">/ {event.waitlistCapacity}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 px-8 border-t border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="flex items-center gap-1 -mb-px overflow-x-auto scroll-area">
            {detailNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.key}
                  to={item.to}
                  end={item.to === ''}
                  className={({ isActive }) =>
                    clsx(
                      'inline-flex items-center gap-2 px-5 py-3.5 border-b-2 text-sm font-medium whitespace-nowrap transition-colors',
                      isActive
                        ? 'border-amber-400 text-amber-300'
                        : 'border-transparent text-ink-200 hover:text-white hover:bg-white/5'
                    )
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto scroll-area">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
