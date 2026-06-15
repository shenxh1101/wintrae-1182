import { Search, Bell, Menu, Settings } from 'lucide-react';
import { useParams, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { formatDate, weekdayName, formatTime } from '@/utils/date';

export function Topbar() {
  const { id } = useParams();
  const location = useLocation();
  const event = id ? useAppStore((s) => s.getEvent(id)) : undefined;

  const today = new Date().toISOString();
  const parts = location.pathname.split('/').filter(Boolean);
  const pageLabels: Record<string, string> = {
    events: '活动台账',
    blacklist: '黑名单',
    tags: '标签管理',
    registrations: '报名管理',
    checkin: '签到核销',
    notifications: '通知与反馈',
    review: '复盘总结',
    overview: '活动总览',
    new: '新建活动',
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/70 backdrop-blur-xl border-b border-paper-300 shadow-sm">
      <div className="h-full px-6 flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <nav className="flex items-center gap-2 text-espresso-400">
            <span className="hover:text-ink-700 cursor-pointer">首页</span>
            {parts.map((part, i) => {
              const isLast = i === parts.length - 1;
              const label = pageLabels[part] || (event && i === 1 && !isNaN(Number(part)) ? event.title : part);
              return (
                <span key={i} className="flex items-center gap-2">
                  <span className="text-espresso-300">/</span>
                  <span className={`${isLast ? 'text-espresso-700 font-medium' : 'hover:text-ink-700 cursor-pointer'}`}>
                    {label}
                  </span>
                </span>
              );
            })}
          </nav>
        </div>

        <div className="flex-1" />

        <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl bg-paper-100/80 border border-paper-300 text-sm w-80 transition-all focus-within:shadow-sm focus-within:bg-white">
          <Search className="w-4 h-4 text-espresso-400" />
          <input
            type="text"
            placeholder="搜索活动、参与者、手机号…"
            className="bg-transparent outline-none flex-1 text-espresso-700 placeholder:text-espresso-300"
          />
          <kbd className="hidden lg:block text-xs px-1.5 py-0.5 rounded border border-paper-400 bg-white text-espresso-400">
            ⌘K
          </kbd>
        </div>

        <div className="flex items-center gap-2 pl-2 border-l border-paper-300">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-br from-ink-50 to-ink-100 border border-ink-100">
            <div className="text-right leading-tight">
              <p className="text-xs text-espresso-400">{formatDate(today)} {weekdayName(today)}</p>
              <p className="text-sm font-medium text-ink-700">{formatTime(today)}</p>
            </div>
          </div>
          <button className="relative p-2 rounded-lg text-espresso-500 hover:bg-paper-200 hover:text-ink-700 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white animate-pulse-soft"></span>
          </button>
          <button className="p-2 rounded-lg text-espresso-500 hover:bg-paper-200 hover:text-ink-700 transition-colors">
            <Settings className="w-5 h-5" />
          </button>
          <button className="lg:hidden p-2 rounded-lg text-espresso-500 hover:bg-paper-200 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
