import { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { RegistrationStatusBadge, EmptyState } from '@/components/ui/Badges';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Ban,
  Tag,
  MoreVertical,
  Check,
  X,
  ArrowUp,
  Download,
  Mail,
  Shield,
  ChevronDown,
  ListFilter,
  LayoutList,
  UserX,
  Sparkles,
  Eye,
  UserCog,
} from 'lucide-react';
import { RegistrationStatus, FormField } from '@/types';
import clsx from 'clsx';
import { formatDateTime, formatRelative } from '@/utils/date';

const statusTabs: { key: RegistrationStatus | 'all'; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'confirmed', label: '已确认' },
  { key: 'waitlist', label: '候补' },
  { key: 'checked_in', label: '已签到' },
  { key: 'no_show', label: '未到场' },
  { key: 'cancelled', label: '已取消' },
];

export function Registrations() {
  const { id } = useParams();
  const event = useAppStore((s) => s.getEvent(id!));
  const regs = useAppStore((s) => s.getEventRegistrations(id!));
  const getParticipant = useAppStore((s) => s.getParticipant);
  const isBlacklisted = useAppStore((s) => s.isBlacklisted);
  const tags = useAppStore((s) => s.tags);
  const updateStatus = useAppStore((s) => s.updateRegistrationStatus);
  const promote = useAppStore((s) => s.promoteFromWaitlist);
  const addToBlacklist = useAppStore((s) => s.addToBlacklist);
  const addParticipantTags = useAppStore((s) => s.addParticipantTags);

  const [tab, setTab] = useState<RegistrationStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [tagDialog, setTagDialog] = useState<string | null>(null);

  const fields: FormField[] = event?.formFields || [];

  const filtered = useMemo(() => {
    let list = [...regs];
    if (tab !== 'all') list = list.filter((r) => r.status === tab);
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      list = list.filter((r) => {
        const p = getParticipant(r.participantId);
        return (
          (p?.name || '').toLowerCase().includes(s) ||
          (p?.phone || '').includes(s) ||
          Object.values(r.customFields).some((v) => v.toLowerCase().includes(s))
        );
      });
    }
    list.sort((a, b) => new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime());
    if (tab === 'waitlist') {
      list.sort((a, b) => (a.waitlistPosition || 0) - (b.waitlistPosition || 0));
    }
    return list;
  }, [regs, tab, search, getParticipant]);

  const counts = {
    all: regs.length,
    confirmed: regs.filter((r) => r.status === 'confirmed').length,
    waitlist: regs.filter((r) => r.status === 'waitlist').length,
    checked_in: regs.filter((r) => r.status === 'checked_in').length,
    no_show: regs.filter((r) => r.status === 'no_show').length,
    cancelled: regs.filter((r) => r.status === 'cancelled').length,
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-espresso-800">报名管理</h2>
          <p className="text-sm text-espresso-500 mt-1">管理参与者名单、候补队列、打标签和黑名单</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary">
            <Download className="w-4 h-4" />
            导出名单
          </button>
          <button onClick={() => setShowAdd(true)} className="btn-primary">
            <UserPlus className="w-4 h-4" />
            手动添加
          </button>
        </div>
      </div>

      <div className="paper-card overflow-hidden">
        <div className="p-4 border-b border-paper-200 space-y-4 bg-gradient-to-r from-paper-50 to-transparent">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-paper-300 w-80 shrink-0">
              <Search className="w-4 h-4 text-espresso-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索姓名、手机号、自定义字段…"
                className="flex-1 bg-transparent outline-none text-sm"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-paper-300 text-sm text-espresso-600 hover:bg-paper-100">
              <ListFilter className="w-4 h-4" />
              按标签筛选
              <ChevronDown className="w-4 h-4" />
            </button>
            {selected.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-ink-50 border border-ink-200 text-sm text-ink-700">
                <LayoutList className="w-4 h-4" />
                已选择 {selected.length} 人
                <button className="ml-1 px-2 py-0.5 rounded bg-ink-700 text-white text-xs hover:bg-ink-600">
                  <Mail className="w-3 h-3 inline mr-1" />批量通知
                </button>
                <button className="px-2 py-0.5 rounded bg-amber-400 text-espresso-800 text-xs hover:bg-amber-500">
                  <Tag className="w-3 h-3 inline mr-1" />打标签
                </button>
                <button onClick={() => setSelected([])} className="ml-1 text-espresso-400 hover:text-espresso-700">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 overflow-x-auto scroll-area -mx-1 px-1">
            {statusTabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                  tab === t.key
                    ? 'bg-ink-700 text-white shadow-md'
                    : 'text-espresso-500 hover:bg-paper-200'
                )}
              >
                {t.label}
                <span className={clsx('ml-1.5 px-1.5 py-0.5 rounded-md text-xs', tab === t.key ? 'bg-white/20' : 'bg-paper-200 text-espresso-500')}>
                  {counts[t.key as keyof typeof counts]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16">
            <EmptyState
              icon={Users}
              title={tab === 'all' ? '还没有人报名' : `暂无${statusTabs.find(s => s.key === tab)?.label}名单`}
              hint="参与者可通过活动链接完成自助报名，或点击右上角手动添加"
            />
          </div>
        ) : (
          <div className="overflow-x-auto scroll-area">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-paper-200 bg-paper-50/70">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      className="rounded border-paper-400 text-ink-700"
                      checked={selected.length === filtered.length}
                      onChange={(e) =>
                        setSelected(e.target.checked ? filtered.map((r) => r.id) : [])
                      }
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-espresso-400 uppercase tracking-wider">
                    {tab === 'waitlist' ? '候补位次' : '序号'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-espresso-400 uppercase tracking-wider">参与者</th>
                  {fields.slice(0, 3).map((f) => (
                    <th key={f.id} className="px-4 py-3 text-left text-xs font-medium text-espresso-400 uppercase tracking-wider">
                      {f.label}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left text-xs font-medium text-espresso-400 uppercase tracking-wider">标签</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-espresso-400 uppercase tracking-wider">报名时间</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-espresso-400 uppercase tracking-wider">状态</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-espresso-400 uppercase tracking-wider w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-paper-100">
                {filtered.map((r, i) => {
                  const p = getParticipant(r.participantId);
                  const black = isBlacklisted(r.participantId);
                  const isSel = selected.includes(r.id);
                  return (
                    <tr key={r.id} className={clsx('hover:bg-paper-50/70 transition-colors', isSel && 'bg-ink-50/50')}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSel}
                          onChange={(e) =>
                            setSelected(e.target.checked ? [...selected, r.id] : selected.filter((x) => x !== r.id))
                          }
                          className="rounded border-paper-400 text-ink-700"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-espresso-500">
                        {tab === 'waitlist' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-medium">
                            #{r.waitlistPosition}
                          </span>
                        ) : (
                          i + 1
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={clsx('relative w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium',
                            black ? 'bg-red-100 text-red-600' : 'bg-gradient-to-br from-ink-100 to-ink-200 text-ink-700')}>
                            {p?.name?.[0] || '?'}
                            {black && (
                              <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center">
                                <Ban className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-espresso-800 flex items-center gap-1.5">
                              {p?.name || '未知用户'}
                              {black && <span className="badge bg-red-100 text-red-600 text-[10px]">黑名单</span>}
                            </p>
                            <p className="text-xs text-espresso-400">{p?.phone}</p>
                          </div>
                        </div>
                      </td>
                      {fields.slice(0, 3).map((f) => (
                        <td key={f.id} className="px-4 py-3 text-sm text-espresso-600 max-w-[180px] truncate">
                          {r.customFields[f.name] || '—'}
                        </td>
                      ))}
                      <td className="px-4 py-3">
                        <div className="flex items-center flex-wrap gap-1">
                          {(p?.tags || []).slice(0, 3).map((tid) => {
                            const t = tags.find((x) => x.id === tid);
                            return t ? (
                              <span
                                key={t.id}
                                className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium text-white"
                                style={{ backgroundColor: t.color }}
                              >
                                {t.name}
                              </span>
                            ) : null;
                          })}
                          <button
                            onClick={() => setTagDialog(r.participantId)}
                            className="p-1 rounded text-espresso-300 hover:bg-paper-200 hover:text-ink-600 transition-colors"
                          >
                            <Tag className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-espresso-500 whitespace-nowrap">
                        {formatRelative(r.registeredAt)}
                        <p className="text-[11px] text-espresso-300 mt-0.5">{formatDateTime(r.registeredAt)}</p>
                      </td>
                      <td className="px-4 py-3">
                        <RegistrationStatusBadge status={r.status} />
                      </td>
                      <td className="px-4 py-3 text-right relative">
                        <button
                          onClick={() => setMenuOpen(menuOpen === r.id ? null : r.id)}
                          className="p-1.5 rounded-lg text-espresso-400 hover:bg-paper-200 hover:text-espresso-700"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {menuOpen === r.id && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-3 top-12 z-20 w-48 py-1.5 rounded-xl bg-white border border-paper-300 shadow-lift animate-slide-up"
                          >
                            <MenuItem
                              icon={Eye}
                              label="查看详情"
                              onClick={() => setMenuOpen(null)}
                            />
                            {r.status === 'waitlist' && (
                              <MenuItem
                                icon={ArrowUp}
                                label="优先补位"
                                onClick={() => { promote(r.id); setMenuOpen(null); }}
                              />
                            )}
                            {r.status === 'confirmed' && (
                              <MenuItem
                                icon={UserX}
                                label="取消报名"
                                onClick={() => { updateStatus(r.id, 'cancelled'); setMenuOpen(null); }}
                              />
                            )}
                            <MenuItem
                              icon={UserCog}
                              label="编辑标签"
                              onClick={() => { setTagDialog(r.participantId); setMenuOpen(null); }}
                            />
                            {!black ? (
                              <MenuItem
                                icon={Ban}
                                label="加入黑名单"
                                danger
                                onClick={() => {
                                  if (confirm('确定将该用户加入黑名单吗？')) {
                                    addToBlacklist(r.participantId, '运营拉黑');
                                  }
                                  setMenuOpen(null);
                                }}
                              />
                            ) : null}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {tagDialog && (
        <TagDialog
          participantId={tagDialog}
          onClose={() => setTagDialog(null)}
        />
      )}

      {showAdd && <AddDialog eventId={id!} onClose={() => setShowAdd(false)} />}
    </div>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger }: any) {
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

function TagDialog({ participantId, onClose }: { participantId: string; onClose: () => void }) {
  const tags = useAppStore((s) => s.tags);
  const p = useAppStore((s) => s.getParticipant(participantId));
  const addParticipantTags = useAppStore((s) => s.addParticipantTags);
  const removeParticipantTag = useAppStore((s) => s.removeParticipantTag);
  const [local, setLocal] = useState<string[]>(p?.tags || []);

  const toggle = (tid: string) => {
    setLocal(local.includes(tid) ? local.filter((t) => t !== tid) : [...local, tid]);
  };

  const apply = () => {
    const toAdd = local.filter((t) => !(p?.tags || []).includes(t));
    const toRemove = (p?.tags || []).filter((t) => !local.includes(t));
    if (toAdd.length) addParticipantTags(participantId, toAdd);
    toRemove.forEach((t) => removeParticipantTag(participantId, t));
    onClose();
  };

  return (
    <Modal onClose={onClose} title={`为「${p?.name}」设置标签`}>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => {
            const active = local.includes(t.id);
            return (
              <button
                key={t.id}
                onClick={() => toggle(t.id)}
                className={clsx(
                  'relative px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                  active
                    ? 'text-white shadow-md'
                    : 'bg-paper-100 text-espresso-600 border border-paper-300 hover:border-paper-400'
                )}
                style={active ? { backgroundColor: t.color } : {}}
              >
                {active && <Check className="w-3.5 h-3.5 inline mr-1" />}
                {t.name}
                <span className="text-xs opacity-70 ml-1">({t.participantCount})</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-paper-200">
        <button onClick={onClose} className="btn-secondary">取消</button>
        <button onClick={apply} className="btn-primary">保存</button>
      </div>
    </Modal>
  );
}

function AddDialog({ eventId, onClose }: { eventId: string; onClose: () => void }) {
  const event = useAppStore((s) => s.getEvent(eventId));
  const addReg = useAppStore((s) => s.addRegistration);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const submit = () => {
    const r = addReg(eventId, {
      name, phone, email,
      customFields: { name, phone, email },
    });
    if (r) {
      onClose();
    } else {
      alert('添加失败（名额已满或已在黑名单）');
    }
  };

  return (
    <Modal onClose={onClose} title="手动添加参与者">
      <div className="space-y-4">
        <div>
          <label className="label-base">姓名 *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input-base" placeholder="请输入姓名" />
        </div>
        <div>
          <label className="label-base">手机号 *</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input-base" placeholder="用于接收通知" />
        </div>
        <div>
          <label className="label-base">邮箱</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className="input-base" placeholder="选填" />
        </div>
        {event?.maxCapacity && event.currentConfirmed >= event.maxCapacity && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-sm text-amber-800">
            <Sparkles className="w-4 h-4" />
            名额已满，添加后将自动进入候补队列
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-paper-200">
        <button onClick={onClose} className="btn-secondary">取消</button>
        <button onClick={submit} className="btn-primary" disabled={!name || !phone}>
          <Shield className="w-4 h-4" />
          确认添加
        </button>
      </div>
    </Modal>
  );
}

function Modal({ children, title, onClose }: { children: React.ReactNode; title: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-espresso-800/40 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-lift border border-paper-300 animate-slide-up overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-paper-200 flex items-center justify-between bg-gradient-to-r from-paper-50 to-transparent">
          <h3 className="font-serif text-xl font-semibold text-espresso-800">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-espresso-400 hover:bg-paper-200 hover:text-espresso-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
