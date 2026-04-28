import { Notification } from '../src/store/notificationsSlice';
import { PersonalizedEvent } from '../src/types/events';
import { buildCapabilityShowcaseSummary } from '../src/utils/capabilityShowcase';

function makeEvent(
  overrides: Partial<PersonalizedEvent> = {},
): PersonalizedEvent {
  return {
    clusterId: 'c1',
    events: [],
    primaryTicker: '7203',
    allTickers: ['7203'],
    title: 'テストイベント',
    impact: '中',
    eventType: '決算発表',
    publishedAt: '2026-04-26T09:00:00.000Z',
    sources: ['EDINET'],
    relevanceScore: 80,
    personalImpact: '中',
    scoreReason: 'test',
    ...overrides,
  };
}

function makeNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 'n1',
    ticker: '7203',
    message: 'テスト通知',
    importance: '中',
    timestamp: '2026-04-26T09:05:00.000Z',
    read: false,
    ...overrides,
  };
}

describe('buildCapabilityShowcaseSummary', () => {
  test('空データ時は待機メッセージを返す', () => {
    const summary = buildCapabilityShowcaseSummary([], []);

    expect(summary.topTicker).toBe('N/A');
    expect(summary.dominantImpact).toBe('なし');
    expect(summary.eventCount).toBe(0);
    expect(summary.alertMode).toBe('QUIET');
    expect(summary.confidenceScore).toBe(0);
  });

  test('イベントからtop tickerとインパクト分布を計算する', () => {
    const events = [
      makeEvent({ primaryTicker: '7203', personalImpact: '中' }),
      makeEvent({
        clusterId: 'c2',
        primaryTicker: '6758',
        personalImpact: '強',
      }),
      makeEvent({
        clusterId: 'c3',
        primaryTicker: '6758',
        personalImpact: '弱',
      }),
    ];

    const summary = buildCapabilityShowcaseSummary(events, [
      makeNotification(),
      makeNotification({ id: 'n2', read: true }),
    ]);

    expect(summary.topTicker).toBe('6758');
    expect(summary.dominantImpact).toBe('強');
    expect(summary.impactBreakdown).toEqual({ strong: 1, medium: 1, weak: 1 });
    expect(summary.unreadRate).toBe(50);
  });

  test('直近イベントが多い場合はIMMEDIATEモードになる', () => {
    const now = new Date('2026-04-26T10:00:00.000Z');
    const events = [
      makeEvent({
        clusterId: 'a1',
        personalImpact: '中',
        publishedAt: '2026-04-26T09:20:00.000Z',
      }),
      makeEvent({
        clusterId: 'a2',
        personalImpact: '中',
        publishedAt: '2026-04-26T09:10:00.000Z',
      }),
      makeEvent({
        clusterId: 'a3',
        personalImpact: '中',
        publishedAt: '2026-04-26T09:00:00.000Z',
      }),
    ];

    const summary = buildCapabilityShowcaseSummary(events, [], now);

    expect(summary.recencyHotCount).toBe(3);
    expect(summary.alertMode).toBe('IMMEDIATE');
    expect(summary.confidenceScore).toBeGreaterThan(0);
    expect(summary.evidencePoints).toHaveLength(3);
  });
});
