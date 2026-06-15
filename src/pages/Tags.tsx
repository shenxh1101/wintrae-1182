import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { EmptyState, StatCard } from '@/components/ui/Badges';
import { Tags, Plus, X, Users, Palette, Edit3, Sparkles, Search } from 'lucide-react';

const presetColors = [
  '#2D4A3E', '#3B5A51', '#4A6E63', '#6A8C81',
  '#7A6650', '#5D4B38', '#A25B34', '#C2723F',
  '#E8A87C', '#D98E5A', '#9CB4AB', '#83492F',
];

export function TagManagement() {
  const tags = useAppStore((s) => s.tags);
  const participants = useAppStore((s) => s.participants);
  const addTag = useAppStore((s) => s.addTag);

  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');

  const list = tags.filter((t) => !search.trim() || t.name.includes(search));
  const totalTaggings = participants.reduce((s, p) => s + p.tags.length, 0);

  return (
    <div className="p-8 max-w-5xl mx-auto animate-slide-up space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={Tags} label="标签总数" value={tags.length} accent="ink" sub="可自定义创建" />
        <StatCard icon={Users} label="累计打标" value={totalTaggings} accent="amber" sub="含重复打标" />
        <StatCard icon={Palette} label="覆盖用户" value={participants.filter(p => p.tags.length > 0).length} accent="espresso" sub={`占总用户 ${Math.round(participants.filter(p => p.tags.length > 0).length / participants.length * 100)}%`} />
      </div>

      <div className="paper-card overflow-hidden">
        <div className="p-5 border-b border-paper-200 flex items-center justify-between gap-4 flex-wrap bg-gradient-to-r from-paper-50 to-transparent">
          <div>
            <h2 className="font-serif text-xl font-semibold text-espresso-800 flex items-center gap-2">
              <Tags className="w-5 h-5 text-espresso-600" />
              参与者标签
            </h2>
            <p className="text-sm text-espresso-500 mt-1">标签可用于活动筛选、批量通知和精准触达</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-paper-300 w-56">
              <Search className="w-4 h-4 text-espresso-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索标签…" className="flex-1 bg-transparent outline-none text-sm" />
            </div>
            <button onClick={() => setShowAdd(true)} className="btn-primary">
              <Plus className="w-4 h-4" />
              新建标签
            </button>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="py-16">
            <EmptyState icon={Sparkles} title="还没有任何标签" hint="从创建第一个标签开始" />
          </div>
        ) : (
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {list.map((t) => (
              <div
                key={t.id}
                className="group p-4 rounded-xl border border-paper-200 bg-white hover:shadow-card transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-10 h-10 rounded-xl shadow-sm flex items-center justify-center"
                      style={{ backgroundColor: t.color }}
                    >
                      <Tags className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-espresso-800">{t.name}</h4>
                      <p className="text-xs text-espresso-400 flex items-center gap-1 mt-0.5">
                        <Users className="w-3 h-3" />
                        {t.participantCount} 位用户
                      </p>
                    </div>
                  </div>
                  <button className="p-1.5 rounded-lg text-espresso-300 hover:bg-paper-200 hover:text-espresso-600 opacity-0 group-hover:opacity-100 transition-all">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                {t.description && (
                  <p className="text-xs text-espresso-500 leading-relaxed border-t border-paper-100 pt-2">
                    {t.description}
                  </p>
                )}
                <div className="mt-3 w-full h-1.5 rounded-full bg-paper-100 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (t.participantCount / Math.max(...tags.map(x => x.participantCount), 1)) * 100)}%`,
                      backgroundColor: t.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <AddDialog
          onClose={() => setShowAdd(false)}
          onSubmit={(name, color) => addTag(name, color)}
        />
      )}
    </div>
  );
}

function AddDialog({ onClose, onSubmit }: { onClose: () => void; onSubmit: (name: string, color: string) => void }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(presetColors[0]);
  const [desc, setDesc] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-espresso-800/40 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-lift border border-paper-300 animate-slide-up overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-paper-200 bg-gradient-to-r from-paper-50 to-transparent flex items-center justify-between">
          <h3 className="font-serif text-xl font-semibold text-espresso-800 flex items-center gap-2">
            <Tags className="w-5 h-5 text-ink-700" />
            新建标签
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-espresso-400 hover:bg-paper-200 hover:text-espresso-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="label-base">标签名称 *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="input-base" placeholder="如：老会员、VIP、作家等" />
          </div>
          <div>
            <label className="label-base">标签描述</label>
            <input value={desc} onChange={(e) => setDesc(e.target.value)} className="input-base" placeholder="选填，用于标签说明" />
          </div>
          <div>
            <label className="label-base mb-2 block">标签颜色</label>
            <div className="flex items-center gap-2.5 flex-wrap">
              {presetColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-9 h-9 rounded-xl transition-all shadow-sm ${color === c ? 'ring-2 ring-offset-2 ring-espresso-400 scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <label className="w-9 h-9 rounded-xl border-2 border-dashed border-paper-400 flex items-center justify-center cursor-pointer hover:border-paper-500 transition-colors">
                <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-0 h-0 opacity-0 absolute" />
                <Palette className="w-4 h-4 text-espresso-400" />
              </label>
              <div className="ml-2 flex items-center gap-2 px-3 py-1.5 rounded-lg border border-paper-300 bg-paper-50">
                <span className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
                <span className="font-mono text-xs text-espresso-500">{color}</span>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-paper-50 border border-paper-200">
            <p className="text-xs text-espresso-400 mb-2">预览效果</p>
            {name ? (
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium text-white shadow-sm"
                style={{ backgroundColor: color }}
              >
                <Tags className="w-3.5 h-3.5" />
                {name}
              </span>
            ) : (
              <span className="text-xs text-espresso-300 italic">请先输入标签名称</span>
            )}
          </div>
        </div>
        <div className="px-6 py-4 bg-paper-50 border-t border-paper-200 flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary">取消</button>
          <button
            onClick={() => { if (name.trim()) { onSubmit(name.trim(), color); onClose(); } }}
            className="btn-primary"
            disabled={!name.trim()}
          >
            <Plus className="w-4 h-4" />
            创建标签
          </button>
        </div>
      </div>
    </div>
  );
}
