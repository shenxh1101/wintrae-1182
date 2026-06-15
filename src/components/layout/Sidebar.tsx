import {
  BookOpen,
  CalendarCheck,
  Users,
  QrCode,
  Bell,
  Ban,
  Tags,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  BookMarked,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';

const navGroups = [
  {
    label: '工作台',
    items: [
      { to: '/events', icon: BookOpen, label: '活动台账' },
    ],
  },
  {
    label: '参与者',
    items: [
      { to: '/tags', icon: Tags, label: '标签管理' },
      { to: '/blacklist', icon: Ban, label: '黑名单' },
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const isEventDetailActive = location.pathname.startsWith('/events/') && location.pathname !== '/events' && location.pathname !== '/events/new';

  return (
    <aside
      className={`relative flex flex-col h-screen bg-gradient-to-b from-ink-800 via-ink-800 to-ink-900 text-ink-100 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      } border-r border-ink-950/30 shadow-lift`}
    >
      <div className="relative p-6 border-b border-ink-700/50 bg-grain">
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-md">
            <BookMarked className="w-5 h-5 text-espresso-800" strokeWidth={2.5} />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <h1 className="font-serif text-lg font-semibold text-white tracking-wide truncate">
                墨香书会
              </h1>
              <p className="text-xs text-ink-300 mt-0.5">读书会运营管理系统</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 py-5 scroll-area overflow-y-auto px-3 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-4 mb-2 text-xs font-medium text-ink-400 uppercase tracking-wider">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active =
                  (item.to === '/events' && location.pathname.startsWith('/events') && !isEventDetailActive) ||
                  location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={`nav-item group ${active ? 'active' : ''}`}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-ink-700/50">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-200 to-amber-400 flex items-center justify-center text-espresso-800 font-semibold text-sm flex-shrink-0">
            林
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">林晓雨</p>
              <p className="text-xs text-ink-300">活动负责人</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-ink-300 hover:bg-ink-700/40 hover:text-white transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs">收起侧栏</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

export const detailNavItems = [
  { key: 'overview', to: '', label: '活动总览', icon: BarChart3 },
  { key: 'registrations', to: 'registrations', label: '报名管理', icon: Users },
  { key: 'checkin', to: 'checkin', label: '签到核销', icon: QrCode },
  { key: 'notifications', to: 'notifications', label: '通知与反馈', icon: Bell },
  { key: 'review', to: 'review', label: '复盘总结', icon: CalendarCheck },
];
