import { Notification } from '../store/notificationsSlice';
import { PersonalizedEvent } from '../types/events';

export interface CapabilityShowcaseSummary {
  headline: string;
  topTicker: string;
  eventCount: number;
  notificationCount: number;
  dominantImpact: '強' | '中' | '弱' | 'なし';
  impactBreakdown: {
    strong: number;
    medium: number;
    weak: number;
  };
  confidenceScore: number;
  recencyHotCount: number;
  unreadRate: number;
  alertMode: 'IMMEDIATE' | 'WATCH' | 'QUIET';
  evidencePoints: string[];
  suggestedAction: string;
}

const impactPriority: Record<'強' | '中' | '弱', number> = {
  強: 3,
  中: 2,
  弱: 1,
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getRecencyHotCount(
  events: PersonalizedEvent[],
  now: Date,
  windowMinutes: number,
): number {
  const windowMs = windowMinutes * 60 * 1000;

  return events.filter((event) => {
    const publishedAt = new Date(event.publishedAt).getTime();
    return (
      !Number.isNaN(publishedAt) && now.getTime() - publishedAt <= windowMs
    );
  }).length;
}

export function buildCapabilityShowcaseSummary(
  events: PersonalizedEvent[],
  notifications: Notification[],
  now: Date = new Date(),
): CapabilityShowcaseSummary {
  if (events.length === 0 && notifications.length === 0) {
    return {
      headline: 'データ待機中: 監視を開始すると即時分析を表示します',
      topTicker: 'N/A',
      eventCount: 0,
      notificationCount: 0,
      dominantImpact: 'なし',
      impactBreakdown: { strong: 0, medium: 0, weak: 0 },
      confidenceScore: 0,
      recencyHotCount: 0,
      unreadRate: 0,
      alertMode: 'QUIET',
      evidencePoints: ['ウォッチリスト追加後にシグナルを算出します。'],
      suggestedAction: 'ウォッチリストに銘柄を追加して観測を開始してください。',
    };
  }

  const tickerCounts = new Map<string, number>();
  const sourceDiversity = new Set<string>();

  const impactBreakdown = events.reduce(
    (acc, event) => {
      tickerCounts.set(
        event.primaryTicker,
        (tickerCounts.get(event.primaryTicker) ?? 0) + 1,
      );

      event.sources.forEach((source) => sourceDiversity.add(source));

      if (event.personalImpact === '強') acc.strong += 1;
      if (event.personalImpact === '中') acc.medium += 1;
      if (event.personalImpact === '弱') acc.weak += 1;

      return acc;
    },
    { strong: 0, medium: 0, weak: 0 },
  );

  const topTicker = [...tickerCounts.entries()].sort(
    (a, b) => b[1] - a[1],
  )[0]?.[0];

  const dominantImpact =
    events
      .map((event) => event.personalImpact)
      .sort((a, b) => impactPriority[b] - impactPriority[a])[0] ?? 'なし';

  const recencyHotCount = getRecencyHotCount(events, now, 180);
  const unreadNotifications = notifications.filter((n) => !n.read).length;
  const unreadRate =
    notifications.length === 0
      ? 0
      : Math.round((unreadNotifications / notifications.length) * 100);

  const confidenceRaw =
    events.length * 8 +
    impactBreakdown.strong * 12 +
    sourceDiversity.size * 9 +
    recencyHotCount * 6;
  const confidenceScore = clamp(confidenceRaw, 0, 100);

  const alertMode: CapabilityShowcaseSummary['alertMode'] =
    dominantImpact === '強' || recencyHotCount >= 3
      ? 'IMMEDIATE'
      : dominantImpact === '中' || unreadRate >= 60
        ? 'WATCH'
        : 'QUIET';

  const headline =
    alertMode === 'IMMEDIATE'
      ? '高優先シグナル検知: すぐ確認すべき局面です'
      : alertMode === 'WATCH'
        ? '監視強化モード: 追加情報で判断精度を上げる段階です'
        : '静穏モード: 重要イベント発生まで低ノイズで運用可能です';

  const suggestedAction =
    alertMode === 'IMMEDIATE'
      ? '一次ソース確認→該当銘柄のアラート優先度を高へ。次報が出るまで15分間隔で再評価してください。'
      : alertMode === 'WATCH'
        ? '中重要度イベントをウォッチし、フォローアップ通知をONにして変化率を追跡してください。'
        : '現設定を維持し、強インパクト出現時のみ即時通知する運用が効率的です。';

  const evidencePoints = [
    `Top ticker: ${topTicker ?? 'N/A'}（${tickerCounts.get(topTicker ?? '') ?? 0}件）`,
    `重要度分布: 強${impactBreakdown.strong} / 中${impactBreakdown.medium} / 弱${impactBreakdown.weak}`,
    `直近3時間の新規イベント: ${recencyHotCount}件 / 通知未読率: ${unreadRate}%`,
  ];

  return {
    headline,
    topTicker: topTicker ?? 'N/A',
    eventCount: events.length,
    notificationCount: notifications.length,
    dominantImpact,
    impactBreakdown,
    confidenceScore,
    recencyHotCount,
    unreadRate,
    alertMode,
    evidencePoints,
    suggestedAction,
  };
}
