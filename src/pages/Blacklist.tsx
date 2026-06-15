import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { EmptyState, StatCard } from '@/components/ui/Badges';
import { Ban, Search, Plus, X, Calendar, User, Shield, Trash2, AlertTriangle } from 'lucide-react';
import { formatDateTime } from '@/utils/date';

export function Blacklist() {
  const blacklist = useAppStore((s) => s.blacklist);
  const getParticipant = useAppStore((s) => s.getParticipant);
  const removeFromBlacklist = useAppStore((s) => s.removeFromBlacklist);
  const addToBlacklist = useAppStore((s) => s.addToBlacklist);
  const participants = useAppStore((s) => s.participants);
  const isBlacklisted = useAppStore((s) => s.isBlacklisted);

  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const filtered = blacklist.filter((b) => {
    if (!search.trim()) return true;
    const s = search.trim().toLowerCase();
    const p = getParticipant(b.participantId);
    return (p?.name || '').toLowerCase().includes(s) || b.reason.toLowerCase().includes(s);
  });

  return (
    <div className="p-8 max-w-5xl mx-auto animate-slide-up space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={Shield} label="黑名单总数" value={blacklist.length} accent="espresso" />
        <StatCard icon={Ban} label="本月新增" value={Math.floor(blacklist.length * 0.3)} accent="ink" sub="30天内加入" />
        <StatCard icon={Calendar} label="平均封禁天数" value={48} accent="amber" sub="含历史数据" />
      </div>

      <div className="paper-card overflow-hidden">
        <div className="p-5 border-b border-paper-200 flex items-center justify-between gap-4 flex-wrap bg-gradient-to-r from-paper-50 to-transparent">
          <div>
            <h2 className="font-serif text-xl font-semibold text-espresso-800 flex items-center gap-2">
              <Ban className="w-5 h-5 text-espresso-600" />
              黑名单管理
            </h2>
            <p className="text-sm text-espresso-500 mt-1">拉黑的用户将无法报名任何活动</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-paper-300 w-64">
              <Search className="w-4 h-4 text-espresso-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索姓名/封禁原因…"
                className="flex-1 bg-transparent outline-none text-sm"
              />
            </div>
            <button onClick={() => setShowAdd(true)} className="btn-primary">
              <Plus className="w-4 h-4" />
              添加黑名单
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16">
            <EmptyState icon={Shield} title="暂无黑名单" hint="正常运营中，所有书友信誉良好" />
          </div>
        ) : (
          <div className="divide-y divide-paper-100">
            {filtered.map((b) => {
              const p = getParticipant(b.participantId);
              return (
                <div key={b.id} className="p-5 flex items-center gap-5 hover:bg-paper-50/60 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center text-red-600 flex-shrink-0">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h4 className="font-semibold text-espresso-800">{p?.name || '未知用户'}</h4>
                      <span className="text-sm text-espresso-500">{p?.phone}</span>
                      <span className="badge bg-red-50 text-red-600 border border-red-100">
                        <AlertTriangle className="w-3 h-3" />
                        已封禁
                      </span>
                    </div>
                    <p className="text-sm text-espresso-600">
                      <span className="text-espresso-400">封禁原因：</span>
                      {b.reason}
                    </p>
                    <div className="flex items-center gap-4 mt-1.5 text-xs text-espresso-400">
                      <span>封禁时间：{formatDateTime(b.blockedAt)}</span>
                      {b.expiresAt && <span>自动解除：{formatDateTime(b.expiresAt)}</span>}
                      <span>操作人：{b.blockedBy}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm('确定将该用户移出黑名单吗？')) {
                        removeFromBlacklist(b.id);
                      }
                    }}
                    className="px-4 py-2 rounded-lg bg-paper-100 text-espresso-600 text-sm hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center gap-1.5"
                  >
                    <X className="w-4 h-4" />
                    解除封禁
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAdd && (
        <AddDialog
          onClose={() => setShowAdd(false)}
          participants={participants.filter((p) => !isBlacklisted(p.id))}
          onSubmit={(pid, reason) => addToBlacklist(pid, reason)}
        />
      )}
    </div>
  );
}

function AddDialog({ onClose, participants, onSubmit }: {
  onClose: () => void;
  participants: any[];
  onSubmit: (pid: string, reason: string) => void;
}) {
  const [selected, setSelected] = useState('');
  const [reason, setReason] = useState('');
  const [search, setSearch] = useState('');
  const list = participants.filter((p) =>
    !search.trim() || p.name.includes(search) || p.phone.includes(search)
  ).slice(0, 50);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-espresso-800/40 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-lift border border-paper-300 animate-slide-up overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-paper-200 bg-gradient-to-r from-paper-50 to-transparent flex items-center justify-between">
          <h3 className="font-serif text-xl font-semibold text-espresso-800 flex items-center gap-2">
            <Ban className="w-5 h-5 text-red-500" />
            添加黑名单
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-espresso-400 hover:bg-paper-200 hover:text-espresso-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto scroll-area">
          <div>
            <label className="label-base">搜索用户</label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-paper-50 border border-paper-300">
              <Search className="w-4 h-4 text-espresso-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="姓名或手机号"
                className="flex-1 bg-transparent outline-none text-sm"
              />
            </div>
            <div className="mt-2 max-h-48 overflow-y-auto scroll-area border border-paper-200 rounded-lg divide-y divide-paper-100">
              {list.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelected(p.id)}
                  className={`w-full px-3 py-2.5 flex items-center gap-3 text-left transition-colors ${
                    selected === p.id ? 'bg-red-50' : 'hover:bg-paper-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ink-100 to-ink-200 flex items-center justify-center text-ink-700 text-sm font-medium">
                    {p.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-espresso-700">{p.name}</p>
                    <p className="text-xs text-espresso-400">{p.phone}</p>
                  </div>
                  {selected === p.id && (
                    <div className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center">
                      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path d="M16.704 5.29a1 1 0 0 1 0 1.42l-8 8a1 1 0 0 1-1.42 0l-4-4a1 1 0 0 1 1.42-1.42L8 12.584l7.29-7.292a1 1 0 0 1 1.414 0z" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label-base">封禁原因 *</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="input-base resize-none text-sm"
              placeholder="请说明封禁原因，将保留在系统日志中"
            />
          </div>
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-espresso-500">快捷原因：</p>
            <div className="flex flex-wrap gap-1.5">
              {['连续3次未到场未请假', '活动现场扰乱秩序', '报名信息造假', '辱骂工作人员'].map((r) => (
                <button
                  key={r}
                  onClick={() => setReason(r)}
                  className="px-2.5 py-1 rounded-md bg-paper-100 border border-paper-300 text-xs text-espresso-600 hover:bg-ink-50 hover:border-ink-300 transition-colors"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="px-6 py-4 bg-paper-50 border-t border-paper-200 flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">取消</button>
          <button
            onClick={() => {
              if (selected && reason.trim()) {
                onSubmit(selected, reason);
                onClose();
              }
            }}
            className="!bg-red-600 hover:!bg-red-500 btn-primary"
            disabled={!selected || !reason.trim()}
          >
            <Trash2 className="w-4 h-4" />
            确认封禁
          </button>
        </div>
      </div>
    </div>
  );
}
