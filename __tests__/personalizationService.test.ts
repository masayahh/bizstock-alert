/**
 * Tests for personalizationService
 */

import {
  calculateRelevanceScore,
  createUserProfile,
  determinePersonalImpact,
  filterUnreadEvents,
  markEventsAsRead,
  personalizeEvent,
  personalizeEvents,
} from '../src/services/personalizationService';
import { ClusteredEvent, UserProfile } from '../src/types/events';

describe('personalizationService', () => {
  describe('calculateRelevanceScore', () => {
    it('should return 0 for events with no ticker match', () => {
      const event: ClusteredEvent = {
        clusterId: 'test1',
        events: [],
        primaryTicker: '9999',
        allTickers: ['9999'],
        title: 'Test Event',
        impact: '中',
        eventType: '新製品',
        publishedAt: '2025-01-15T10:00:00Z',
        sources: ['PR TIMES'],
      };

      const profile: UserProfile = {
        userId: 'user1',
        watchlist: ['7203', '6758'],
        readEvents: new Set(),
      };

      const { score, reason } = calculateRelevanceScore(event, profile);

      expect(score).toBe(0);
      expect(reason).toContain('該当銘柄なし');
    });

    it('should score watchlist matches', () => {
      const event: ClusteredEvent = {
        clusterId: 'test2',
        events: [],
        primaryTicker: '7203',
        allTickers: ['7203'],
        title: 'トヨタ新製品',
        impact: '中',
        eventType: '新製品',
        publishedAt: '2025-01-15T10:00:00Z',
        sources: ['PR TIMES'],
      };

      const profile: UserProfile = {
        userId: 'user1',
        watchlist: ['7203', '6758'],
        readEvents: new Set(),
      };

      const { score } = calculateRelevanceScore(event, profile);

      expect(score).toBeGreaterThan(0);
    });

    it('should boost score for high-impact events', () => {
      const eventMedium: ClusteredEvent = {
        clusterId: 'test3a',
        events: [],
        primaryTicker: '7203',
        allTickers: ['7203'],
        title: 'Test',
        impact: '中',
        eventType: 'その他',
        publishedAt: '2025-01-15T10:00:00Z',
        sources: ['PR TIMES'],
      };

      const eventStrong: ClusteredEvent = {
        ...eventMedium,
        clusterId: 'test3b',
        impact: '強',
      };

      const profile: UserProfile = {
        userId: 'user1',
        watchlist: ['7203'],
        readEvents: new Set(),
      };

      const scoreMedium = calculateRelevanceScore(eventMedium, profile).score;
      const scoreStrong = calculateRelevanceScore(eventStrong, profile).score;

      expect(scoreStrong).toBeGreaterThan(scoreMedium);
    });

    it('should boost score for multiple sources', () => {
      const singleSource: ClusteredEvent = {
        clusterId: 'test4a',
        events: [],
        primaryTicker: '7203',
        allTickers: ['7203'],
        title: 'Test',
        impact: '中',
        eventType: 'その他',
        publishedAt: '2025-01-15T10:00:00Z',
        sources: ['PR TIMES'],
      };

      const multiSource: ClusteredEvent = {
        ...singleSource,
        clusterId: 'test4b',
        sources: ['PR TIMES', 'EDINET'],
      };

      const profile: UserProfile = {
        userId: 'user1',
        watchlist: ['7203'],
        readEvents: new Set(),
      };

      const scoreSingle = calculateRelevanceScore(singleSource, profile).score;
      const scoreMulti = calculateRelevanceScore(multiSource, profile).score;

      expect(scoreMulti).toBeGreaterThan(scoreSingle);
    });

    it('should weight by portfolio positions', () => {
      const event: ClusteredEvent = {
        clusterId: 'test5',
        events: [],
        primaryTicker: '7203',
        allTickers: ['7203'],
        title: 'トヨタ新製品',
        impact: '中',
        eventType: '新製品',
        publishedAt: '2025-01-15T10:00:00Z',
        sources: ['PR TIMES'],
      };

      const profileSmallPosition: UserProfile = {
        userId: 'user1',
        watchlist: ['7203', '6758'],
        positions: { '7203': 100, '6758': 1000 }, // 7203 is 9% of portfolio
        readEvents: new Set(),
      };

      const profileLargePosition: UserProfile = {
        userId: 'user2',
        watchlist: ['7203', '6758'],
        positions: { '7203': 1000, '6758': 100 }, // 7203 is 91% of portfolio
        readEvents: new Set(),
      };

      const scoreSmall = calculateRelevanceScore(
        event,
        profileSmallPosition,
      ).score;
      const scoreLarge = calculateRelevanceScore(
        event,
        profileLargePosition,
      ).score;

      expect(scoreLarge).toBeGreaterThan(scoreSmall);
    });
  });

  describe('determinePersonalImpact', () => {
    it('should never downgrade 強 impact', () => {
      const event: ClusteredEvent = {
        clusterId: 'test6',
        events: [],
        primaryTicker: '7203',
        allTickers: ['7203'],
        title: 'Test',
        impact: '強',
        eventType: 'その他',
        publishedAt: '2025-01-15T10:00:00Z',
        sources: ['EDINET'],
      };

      const profile: UserProfile = {
        userId: 'user1',
        watchlist: ['7203'],
        readEvents: new Set(),
      };

      const personalImpact = determinePersonalImpact(event, profile, 10); // Low score

      expect(personalImpact).toBe('強');
    });

    it('should upgrade 弱→中 for high relevance', () => {
      const event: ClusteredEvent = {
        clusterId: 'test7',
        events: [],
        primaryTicker: '7203',
        allTickers: ['7203'],
        title: 'Test',
        impact: '弱',
        eventType: 'その他',
        publishedAt: '2025-01-15T10:00:00Z',
        sources: ['Company IR'],
      };

      const profile: UserProfile = {
        userId: 'user1',
        watchlist: ['7203'],
        readEvents: new Set(),
      };

      const personalImpact = determinePersonalImpact(event, profile, 75);

      expect(personalImpact).toBe('中');
    });

    it('should upgrade 中→強 for very high relevance', () => {
      const event: ClusteredEvent = {
        clusterId: 'test8',
        events: [],
        primaryTicker: '7203',
        allTickers: ['7203'],
        title: 'Test',
        impact: '中',
        eventType: '上方修正',
        publishedAt: '2025-01-15T10:00:00Z',
        sources: ['PR TIMES', 'Company IR'],
      };

      const profile: UserProfile = {
        userId: 'user1',
        watchlist: ['7203'],
        readEvents: new Set(),
      };

      const personalImpact = determinePersonalImpact(event, profile, 90);

      expect(personalImpact).toBe('強');
    });
  });

  describe('personalizeEvent', () => {
    it('should create personalized event with scoring', () => {
      const event: ClusteredEvent = {
        clusterId: 'test9',
        events: [],
        primaryTicker: '7203',
        allTickers: ['7203'],
        title: 'トヨタ上方修正',
        impact: '中',
        eventType: '上方修正',
        publishedAt: '2025-01-15T10:00:00Z',
        sources: ['PR TIMES'],
      };

      const profile: UserProfile = {
        userId: 'user1',
        watchlist: ['7203'],
        readEvents: new Set(),
      };

      const personalized = personalizeEvent(event, profile);

      expect(personalized.relevanceScore).toBeGreaterThan(0);
      expect(personalized.personalImpact).toBeDefined();
      expect(personalized.scoreReason).toBeTruthy();
      expect(personalized.clusterId).toBe('test9');
    });
  });

  describe('personalizeEvents', () => {
    it('should filter out non-relevant events', () => {
      const events: ClusteredEvent[] = [
        {
          clusterId: 'test10a',
          events: [],
          primaryTicker: '7203', // In watchlist
          allTickers: ['7203'],
          title: 'トヨタ',
          impact: '中',
          eventType: '新製品',
          publishedAt: '2025-01-15T10:00:00Z',
          sources: ['PR TIMES'],
        },
        {
          clusterId: 'test10b',
          events: [],
          primaryTicker: '9999', // NOT in watchlist
          allTickers: ['9999'],
          title: 'その他',
          impact: '中',
          eventType: 'その他',
          publishedAt: '2025-01-15T10:00:00Z',
          sources: ['PR TIMES'],
        },
      ];

      const profile: UserProfile = {
        userId: 'user1',
        watchlist: ['7203'],
        readEvents: new Set(),
      };

      const personalized = personalizeEvents(events, profile);

      expect(personalized).toHaveLength(1);
      expect(personalized[0].primaryTicker).toBe('7203');
    });
  });

  describe('filterUnreadEvents', () => {
    it('should filter out read events', () => {
      const events = [
        {
          clusterId: 'cluster1',
          events: [{ id: 'event1' }],
          primaryTicker: '7203',
          allTickers: ['7203'],
          title: 'Test 1',
          impact: '中' as const,
          eventType: '新製品' as const,
          publishedAt: '2025-01-15T10:00:00Z',
          sources: ['PR TIMES'],
          relevanceScore: 80,
          personalImpact: '中' as const,
          scoreReason: 'test',
        },
        {
          clusterId: 'cluster2',
          events: [{ id: 'event2' }],
          primaryTicker: '7203',
          allTickers: ['7203'],
          title: 'Test 2',
          impact: '中' as const,
          eventType: '新製品' as const,
          publishedAt: '2025-01-15T11:00:00Z',
          sources: ['PR TIMES'],
          relevanceScore: 80,
          personalImpact: '中' as const,
          scoreReason: 'test',
        },
      ];

      const profile: UserProfile = {
        userId: 'user1',
        watchlist: ['7203'],
        readEvents: new Set(['cluster1']),
      };

      const unread = filterUnreadEvents(events, profile);

      expect(unread).toHaveLength(1);
      expect(unread[0].clusterId).toBe('cluster2');
    });
  });

  describe('markEventsAsRead', () => {
    it('should add events to read set', () => {
      const profile: UserProfile = {
        userId: 'user1',
        watchlist: ['7203'],
        readEvents: new Set(),
      };

      markEventsAsRead(profile, ['event1', 'event2']);

      expect(profile.readEvents.has('event1')).toBe(true);
      expect(profile.readEvents.has('event2')).toBe(true);
    });
  });

  describe('createUserProfile', () => {
    it('should create valid user profile', () => {
      const profile = createUserProfile('user1', ['7203', '6758']);

      expect(profile.userId).toBe('user1');
      expect(profile.watchlist).toEqual(['7203', '6758']);
      expect(profile.readEvents.size).toBe(0);
    });
  });
});
