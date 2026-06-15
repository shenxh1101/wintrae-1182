export const formatDateTime = (iso: string, withTime = true) => {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  if (!withTime) return `${y}-${m}-${day}`;
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${day} ${h}:${min}`;
};

export const formatDate = (iso: string) => formatDateTime(iso, false);

export const formatTime = (iso: string) => {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
};

export const formatRelative = (iso: string) => {
  const diff = new Date(iso).getTime() - Date.now();
  const abs = Math.abs(diff);
  const mins = Math.floor(abs / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  const future = diff > 0;
  if (days > 0) return future ? `${days}天后` : `${days}天前`;
  if (hours > 0) return future ? `${hours}小时后` : `${hours}小时前`;
  if (mins > 0) return future ? `${mins}分钟后` : `${mins}分钟前`;
  return '刚刚';
};

export const isSameDay = (a: string, b: string) => {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
};

export const weekdayName = (iso: string) => {
  const names = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return names[new Date(iso).getDay()];
};

export const generateSignInCode = (eventId: string, participantId: string, salt?: number) => {
  const seed = `${eventId}-${participantId}-${salt ?? Date.now()}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return String(hash).slice(0, 6).padStart(6, '0');
};
