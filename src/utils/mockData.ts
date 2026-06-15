import type {
  BookClubEvent,
  Participant,
  Registration,
  CheckInRecord,
  Notification,
  BlacklistEntry,
  Feedback,
  ParticipantTag,
  FormField,
} from '../types';
import { generateSignInCode } from './date';

const uid = () => Math.random().toString(36).slice(2, 10);

const now = new Date();
const daysFromNow = (n: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + n);
  return d.toISOString();
};
const hoursOffset = (base: string, h: number) => {
  const d = new Date(base);
  d.setHours(d.getHours() + h);
  return d.toISOString();
};

const defaultFormFields: FormField[] = [
  { id: 'f_name', name: 'name', label: '姓名', type: 'text', required: true, sortOrder: 0, placeholder: '请输入您的姓名' },
  { id: 'f_phone', name: 'phone', label: '手机号码', type: 'tel', required: true, sortOrder: 1, placeholder: '用于接收活动通知' },
  { id: 'f_email', name: 'email', label: '邮箱（选填）', type: 'email', required: false, sortOrder: 2, placeholder: '用于发送活动资料' },
  { id: 'f_expect', name: 'expect', label: '您对本次活动的期待', type: 'textarea', required: false, sortOrder: 3, placeholder: '想从读书会中收获什么？' },
  { id: 'f_source', name: 'source', label: '您是如何了解到本次活动的？', type: 'select', required: false, sortOrder: 4,
    options: ['朋友推荐', '公众号推文', '书店海报', '小红书', '其他'] },
];

const firstNames = ['张', '李', '王', '赵', '刘', '陈', '杨', '林', '周', '吴', '孙', '黄', '徐', '郑', '何', '高', '马', '胡', '朱', '郭'];
const lastNames = ['思远', '书琳', '明轩', '晓蕾', '子墨', '雅文', '浩然', '静怡', '雨桐', '文博', '佳琪', '志远', '沐阳', '若曦', '嘉豪', '慧敏', '振宇', '诗涵', '宇航', '婉清', '云帆', '晨曦', '星河', '秋水', '知远', '忆南', '听雪', '问梅', '墨白', '青衫'];

const randomName = () => firstNames[Math.floor(Math.random() * firstNames.length)] + lastNames[Math.floor(Math.random() * lastNames.length)];
const randomPhone = () => '139' + Math.floor(10000000 + Math.random() * 89999999).toString();
const randomEmail = (name: string) => `${name.toLowerCase().replace(/\s/g, '')}${Math.floor(Math.random() * 1000)}@example.com`;

const tagColors = ['#2D4A3E', '#E8A87C', '#7A6650', '#9CB4AB', '#C2723F', '#6A8C81', '#A25B34', '#4A6E63'];

const tags: ParticipantTag[] = [
  { id: 't1', name: '老会员', color: tagColors[0], description: '参与过5次以上活动', participantCount: 12 },
  { id: 't2', name: '学生', color: tagColors[1], description: '在校大学生/研究生', participantCount: 8 },
  { id: 't3', name: '作家', color: tagColors[2], description: '出版过作品的作者', participantCount: 3 },
  { id: 't4', name: '书评人', color: tagColors[3], description: '在平台发表书评', participantCount: 5 },
  { id: 't5', name: '忠实读者', color: tagColors[4], description: '每月购书超过3本', participantCount: 15 },
  { id: 't6', name: '社区志愿者', color: tagColors[5], description: '参与过书店志愿活动', participantCount: 7 },
  { id: 't7', name: '摄影师', color: tagColors[6], description: '活动摄影担当', participantCount: 2 },
  { id: 't8', name: 'VIP客户', color: tagColors[7], description: '年度VIP会员', participantCount: 6 },
];

const eventTitles = [
  { title: '《百年孤独》：魔幻现实主义的巅峰', book: '百年孤独', author: '加西亚·马尔克斯' },
  { title: '追寻自我之路：《瓦尔登湖》深度共读', book: '瓦尔登湖', author: '梭罗' },
  { title: '诗与远方：海子诗歌赏析会', book: '海子诗选', author: '海子' },
  { title: '东方美学：《美的历程》与中华审美', book: '美的历程', author: '李泽厚' },
  { title: '人间清醒：读鲁迅的呐喊与彷徨', book: '呐喊', author: '鲁迅' },
  { title: '科幻与哲学：《三体》中的文明沉思', book: '三体', author: '刘慈欣' },
  { title: '慢煮生活：汪曾祺散文品读', book: '人间草木', author: '汪曾祺' },
];

const eventStatuses: Array<{ status: BookClubEvent['status']; dayOffset: [number, number] }> = [
  { status: 'draft', dayOffset: [30, 31] },
  { status: 'registration_open', dayOffset: [14, 16] },
  { status: 'upcoming', dayOffset: [3, 4] },
  { status: 'ongoing', dayOffset: [0, 1] },
  { status: 'completed', dayOffset: [-14, -12] },
  { status: 'completed', dayOffset: [-30, -28] },
  { status: 'cancelled', dayOffset: [7, 8] },
];

const participants: Participant[] = [];
for (let i = 0; i < 40; i++) {
  const name = randomName();
  const participantTags = [];
  const tagCount = Math.floor(Math.random() * 3);
  for (let j = 0; j < tagCount; j++) {
    const t = tags[Math.floor(Math.random() * tags.length)];
    if (!participantTags.includes(t.id)) participantTags.push(t.id);
  }
  participants.push({
    id: 'p' + (i + 1),
    name,
    phone: randomPhone(),
    email: Math.random() > 0.5 ? randomEmail(name) : undefined,
    tags: participantTags,
    totalRegistrations: Math.floor(Math.random() * 12) + 1,
    totalCheckIns: Math.floor(Math.random() * 10),
    createdAt: daysFromNow(-Math.floor(Math.random() * 365)),
  });
}

const events: BookClubEvent[] = eventTitles.map((tpl, i) => {
  const startDayOffset = eventStatuses[i].dayOffset[0] + Math.random() * (eventStatuses[i].dayOffset[1] - eventStatuses[i].dayOffset[0]);
  const startTime = daysFromNow(Math.floor(startDayOffset));
  const endTime = hoursOffset(startTime, 2 + Math.random());
  const maxCap = [20, 30, 25, 40, 35, 50, 30][i] || 30;
  const confirmed = eventStatuses[i].status === 'draft' ? 0 : Math.floor(maxCap * (0.5 + Math.random() * 0.5));
  const waitCap = Math.floor(maxCap * 0.3);
  const waitlisted = eventStatuses[i].status === 'completed' || eventStatuses[i].status === 'cancelled'
    ? 0
    : Math.floor(waitCap * Math.random() * 0.7);

  return {
    id: 'e' + (i + 1),
    title: tpl.title,
    description: `一起走进《${tpl.book}》的文字世界。本次读书会将围绕书中核心主题展开深度讨论，欢迎各位书友带上您的阅读感悟与思考，与同好们共度一个充实的下午。活动现场将提供茶水与小食，参与者可自带该书或在书店购买（书友享8折优惠）。`,
    bookTitle: tpl.book,
    bookAuthor: tpl.author,
    status: eventStatuses[i].status,
    startTime,
    endTime,
    location: ['墨香书屋·一楼主会场', '墨香书屋·二楼阅读空间', '墨香书屋·落地窗角落', '墨香书屋·咖啡区'][i % 4],
    maxCapacity: maxCap,
    waitlistCapacity: waitCap,
    currentConfirmed: confirmed,
    currentWaitlist: waitlisted,
    cancelDeadlineHours: 24,
    cancellationFeePercent: 30,
    autoPromoteWaitlist: true,
    formFields: i === 0 ? defaultFormFields : defaultFormFields.slice(0, Math.floor(Math.random() * 2) + 3),
    tags: (function() {
      const tagPool = [['文学经典'], ['哲学', '社科'], ['诗歌', '文学'], ['美学', '艺术'], ['中国文学'], ['科幻'], ['散文', '生活']];
      return tagPool[i] || [];
    })(),
    notes: ['', '需准备一份500字以内的读后感', '请提前阅读第3-7章', '现场有作者连线环节', '建议带笔记本做笔记', '', ''][i],
    createdAt: daysFromNow(-Math.floor(startDayOffset) - 7 - Math.floor(Math.random() * 14)),
    updatedAt: daysFromNow(-1),
  };
});

const registrations: Registration[] = [];
events.forEach((ev) => {
  const shuffled = [...participants].sort(() => Math.random() - 0.5);
  const totalForEvent = ev.currentConfirmed + ev.currentWaitlist + (ev.status === 'completed' ? 5 : 0);
  for (let i = 0; i < Math.min(totalForEvent, shuffled.length); i++) {
    const p = shuffled[i];
    let status: Registration['status'];
    if (i < ev.currentConfirmed) {
      if (ev.status === 'completed') {
        status = Math.random() > 0.15 ? 'checked_in' : 'no_show';
      } else {
        status = 'confirmed';
      }
    } else if (i < ev.currentConfirmed + ev.currentWaitlist) {
      status = 'waitlist';
    } else {
      status = 'cancelled';
    }
    registrations.push({
      id: 'r' + ev.id + '_' + i,
      eventId: ev.id,
      participantId: p.id,
      status,
      waitlistPosition: status === 'waitlist' ? (i - ev.currentConfirmed + 1) : undefined,
      signInCode: generateSignInCode(ev.id, p.id, Math.floor(i * 31 + 7)),
      customFields: {
        name: p.name,
        phone: p.phone,
        email: p.email || '',
        expect: ['', '希望能结交更多书友', '期待深入讨论哲学问题', '想听听大家的阅读心得', '了解更多背景知识', ''][Math.floor(Math.random() * 5)],
        source: ['朋友推荐', '公众号推文', '书店海报', '小红书', '其他'][Math.floor(Math.random() * 5)],
      },
      registeredAt: daysFromNow(-Math.floor(Math.random() * 10 + 1)),
      cancelledAt: status === 'cancelled' ? daysFromNow(-Math.floor(Math.random() * 3)) : undefined,
      cancelReason: status === 'cancelled' ? ['临时有事', '时间冲突', '已阅读过', ''][Math.floor(Math.random() * 3)] : undefined,
    });
  }
});

const checkIns: CheckInRecord[] = [];
registrations
  .filter((r) => r.status === 'checked_in')
  .forEach((r, idx) => {
    checkIns.push({
      id: 'c_' + r.id,
      registrationId: r.id,
      eventId: r.eventId,
      participantId: r.participantId,
      checkedInAt: hoursOffset(events.find((e) => e.id === r.eventId)!.startTime, -0.4 + idx * 0.02),
      checkInMethod: Math.random() > 0.2 ? 'qr_code' : 'manual',
    });
  });

const notifications: Notification[] = [
  {
    id: 'n1',
    eventId: 'e3',
    type: 'sms',
    title: '活动即将开始提醒',
    content: '您好{姓名}，《{活动名}》将于{时间}在{地点}举办，请准时到场。回复T退订。',
    recipientFilters: { statuses: ['confirmed'] },
    status: 'sent',
    totalRecipients: 28,
    sentCount: 28,
    failedCount: 0,
    createdAt: daysFromNow(-2),
    sentAt: daysFromNow(-2),
  },
  {
    id: 'n2',
    eventId: 'e3',
    type: 'in_app',
    title: '候补补位成功通知',
    content: '恭喜您，您已从候补队列中补位成功！请确认您是否能按时出席。',
    recipientFilters: { statuses: ['waitlist'] },
    status: 'sent',
    totalRecipients: 6,
    sentCount: 6,
    failedCount: 0,
    createdAt: daysFromNow(-5),
    sentAt: daysFromNow(-5),
  },
  {
    id: 'n3',
    eventId: 'e6',
    type: 'sms',
    title: '活动取消通知',
    content: '尊敬的书友，因不可抗力原因，本次活动已取消，报名费将在3个工作日内原路退还。',
    recipientFilters: { statuses: ['confirmed', 'waitlist'] },
    status: 'sent',
    totalRecipients: 42,
    sentCount: 42,
    failedCount: 1,
    createdAt: daysFromNow(-8),
    sentAt: daysFromNow(-8),
  },
  {
    id: 'n4',
    eventId: 'e5',
    type: 'in_app',
    title: '活动反馈征集',
    content: '感谢您参加本期读书会！请花3分钟填写反馈问卷，帮助我们做得更好。',
    recipientFilters: { statuses: ['checked_in'] },
    status: 'sent',
    totalRecipients: 26,
    sentCount: 26,
    failedCount: 0,
    createdAt: daysFromNow(-12),
    sentAt: daysFromNow(-12),
  },
  {
    id: 'n5',
    eventId: 'e4',
    type: 'sms',
    title: '明日活动温馨提示',
    content: '书友您好！明天的{活动名}期待与您相见，记得带上好心情哦~',
    recipientFilters: { statuses: ['confirmed'] },
    status: 'draft',
    totalRecipients: 32,
    sentCount: 0,
    failedCount: 0,
    createdAt: daysFromNow(-0),
  },
];

const blacklist: BlacklistEntry[] = [
  {
    id: 'b1',
    participantId: 'p18',
    phone: participants.find((p) => p.id === 'p18')?.phone,
    reason: '连续3次报名未到场且未提前取消',
    blockedAt: daysFromNow(-60),
    blockedBy: 'system',
  },
  {
    id: 'b2',
    participantId: 'p25',
    phone: participants.find((p) => p.id === 'p25')?.phone,
    reason: '活动现场扰乱秩序，经劝阻无效',
    blockedAt: daysFromNow(-20),
    expiresAt: daysFromNow(70),
    blockedBy: '店员-小王',
  },
  {
    id: 'b3',
    participantId: 'p33',
    phone: participants.find((p) => p.id === 'p33')?.phone,
    reason: '活动现场扰乱秩序，经劝阻无效',
    blockedAt: daysFromNow(-30),
    blockedBy: '店员-小李',
  },
];

const feedbacks: Feedback[] = [];
const feedbackKeywords = ['氛围很好', '内容充实', '主持人专业', '书友友善', '场地舒适', '准备充分', '讨论深入', '时间合理', '选书很棒', '期待下次'];
const completedEvents = events.filter((e) => e.status === 'completed');
completedEvents.forEach((ev) => {
  const eventRegs = registrations.filter((r) => r.eventId === ev.id && r.status === 'checked_in');
  eventRegs.slice(0, Math.floor(eventRegs.length * 0.7)).forEach((r, i) => {
    const kws = [];
    const kwCount = Math.floor(Math.random() * 3) + 2;
    for (let k = 0; k < kwCount; k++) {
      const kw = feedbackKeywords[Math.floor(Math.random() * feedbackKeywords.length)];
      if (!kws.includes(kw)) kws.push(kw);
    }
    feedbacks.push({
      id: 'fb' + ev.id + '_' + i,
      eventId: ev.id,
      participantId: r.participantId,
      rating: Math.floor(Math.random() * 2) + 4,
      content: [
        '非常有深度的一次读书会，主持人的讲解让我对这本书有了全新的理解。',
        '认识了很多志同道合的朋友，讨论环节特别精彩，期待下次再聚！',
        '场地很舒适，茶歇也很贴心，整体体验满分。',
        '这次分享的内容特别有启发，已经推荐给身边的朋友了。',
        '组织得很好，时间把控到位，大家的发言都很有质量。',
      ][Math.floor(Math.random() * 5)],
      keywords: kws,
      submittedAt: hoursOffset(ev.endTime, 2 + Math.random() * 24),
    });
  });
});

export const mockData = {
  events,
  participants,
  registrations,
  checkIns,
  notifications,
  blacklist,
  feedbacks,
  tags,
};

export { uid };
