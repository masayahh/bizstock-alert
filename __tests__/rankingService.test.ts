/**
 * Tests for rankingService
 */

import {
  calculateRankingScore,
  calculateRecencyScore,
  DEFAULT_RANKING_CONFIG,
  getTopEvents,
  groupAndRankByTicker,
  IMPACT_FIRST_RANKING,
  LIVE_FEED_RANKING,
  MORNING_DIGEST_RANKING,
  rankEvents,
  rankEventsWithTierPriority,
} from '../src/services/rankingService';
import { PersonalizedEvent } from '../src/types/events';

describe('rankingService', () => {
  describe('calculateRecencyScore', () => {
    it('should return 100 for very recent events', () => {
      const now = new Date('2025-01-15T12:00:00Z');
      const publishedAt = '2025-01-15T11:45:00Z'; // 15 minutes ago

      const score = calculateRecencyScore(publishedAt, now);

      expect(score).toBe(100);
    });

    it('should return lower score for older events', () => {
      const now = new Date('2025-01-15T12:00:00Z');
      const recent = '2025-01-15T11:00:00Z'; // 1 hour ago
      const old = '2025-01-14T12:00:00Z'; // 24 hours ago

      const scoreRecent = calculateRecencyScore(recent, now);
      const scoreOld = calculateRecencyScore(old, now);

      expect(scoreRecent).toBeGreaterThan(scoreOld);
    });

    it('should return 0 for very old events', () => {
      const now = new Date('2025-01-15T12:00:00Z');
      const publishedAt = '2025-01-01T12:00:00Z'; // 14 days ago

      const score = calculateRecencyScore(publishedAt, now);

      expect(score).toBe(0);
    });
  });

  describe('calculateRankingScore', () => {
    it('should calculate composite score', () => {
      const event: PersonalizedEvent = {
        clusterId: 'test1',
        events: [],
        primaryTicker: '7203',
        allTickers: ['7203'],
        title: 'Test',
        impact: '強',
        eventType: '上方修正',
        publishedAt: '2025-01-15T11:00:00Z',
        sources: ['EDINET', 'PR TIMES'],
        relevanceScore: 80,
        personalImpact: '強',
        scoreReason: 'test',
      };

      const referenceTime = new Date('2025-01-15T12:00:00Z');
      const score = calculateRankingScore(
        event,
        DEFAULT_RANKING_CONFIG,
        referenceTime,
      );

      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should apply multi-source boost', () => {
      const singleSource: PersonalizedEvent = {
        clusterId: 'test2a',
        events: [],
        primaryTicker: '7203',
        allTickers: ['7203'],
        title: 'Test',
        impact: '中',
        eventType: 'その他',
        publishedAt: '2025-01-15T11:00:00Z',
        sources: ['PR TIMES'],
        relevanceScore: 50,
        personalImpact: '中',
        scoreReason: 'test',
      };

      const multiSource: PersonalizedEvent = {
        ...singleSource,
        clusterId: 'test2b',
        sources: ['PR TIMES', 'EDINET'],
      };

      const referenceTime = new Date('2025-01-15T12:00:00Z');
      const scoreSingle = calculateRankingScore(
        singleSource,
        DEFAULT_RANKING_CONFIG,
        referenceTime,
      );
      const scoreMulti = calculateRankingScore(
        multiSource,
        DEFAULT_RANKING_CONFIG,
        referenceTime,
      );

      expect(scoreMulti).toBeGreaterThan(scoreSingle);
    });
  });

  describe('rankEvents', () => {
    it('should sort events by ranking score', () => {
      const events: PersonalizedEvent[] = [
        {
          clusterId: 'low',
          events: [],
          primaryTicker: '7203',
          allTickers: ['7203'],
          title: 'Low relevance',
          impact: '弱',
          eventType: 'その他',
          publishedAt: '2025-01-14T10:00:00Z', // Old
          sources: ['PR TIMES'],
          relevanceScore: 30,
          personalImpact: '弱',
          scoreReason: 'test',
        },
        {
          clusterId: 'high',
          events: [],
          primaryTicker: '7203',
          allTickers: ['7203'],
          title: 'High relevance',
          impact: '強',
          eventType: '上方修正',
          publishedAt: '2025-01-15T11:00:00Z', // Recent
          sources: ['EDINET', 'PR TIMES'],
          relevanceScore: 90,
          personalImpact: '強',
          scoreReason: 'test',
        },
        {
          clusterId: 'medium',
          events: [],
          primaryTicker: '7203',
          allTickers: ['7203'],
          title: 'Medium relevance',
          impact: '中',
          eventType: '新製品',
          publishedAt: '2025-01-15T10:00:00Z',
          sources: ['PR TIMES'],
          relevanceScore: 60,
          personalImpact: '中',
          scoreReason: 'test',
        },
      ];

      const referenceTime = new Date('2025-01-15T12:00:00Z');
      const ranked = rankEvents(events, DEFAULT_RANKING_CONFIG, referenceTime);

      expect(ranked[0].clusterId).toBe('high');
      expect(ranked[2].clusterId).toBe('low');
    });
  });

  describe('rankEventsWithTierPriority', () => {
    it('should prioritize tier A events', () => {
      const events: PersonalizedEvent[] = [
        {
          clusterId: 'tierB_high',
          events: [],
          primaryTicker: '7203',
          allTickers: ['7203'],
          title: 'Tier B high relevance',
          impact: '中',
          eventType: '上方修正',
          publishedAt: '2025-01-15T11:00:00Z',
          sources: ['PR TIMES', 'Company IR'],
          relevanceScore: 95, // Very high
          personalImpact: '中',
          scoreReason: 'test',
        },
        {
          clusterId: 'tierA_low',
          events: [],
          primaryTicker: '7203',
          allTickers: ['7203'],
          title: 'Tier A low relevance',
          impact: '強',
          eventType: 'その他',
          publishedAt: '2025-01-14T10:00:00Z', // Old
          sources: ['EDINET'],
          relevanceScore: 40, // Low
          personalImpact: '強',
          scoreReason: 'test',
        },
      ];

      const referenceTime = new Date('2025-01-15T12:00:00Z');
      const ranked = rankEventsWithTierPriority(
        events,
        DEFAULT_RANKING_CONFIG,
        referenceTime,
      );

      // Tier A should come first despite lower relevance
      expect(ranked[0].clusterId).toBe('tierA_low');
      expect(ranked[1].clusterId).toBe('tierB_high');
    });
  });

  describe('groupAndRankByTicker', () => {
    it('should group by ticker and rank within groups', () => {
      const events: PersonalizedEvent[] = [
        {
          clusterId: 'toyota1',
          events: [],
          primaryTicker: '7203',
          allTickers: ['7203'],
          title: 'Toyota 1',
          impact: '中',
          eventType: '新製品',
          publishedAt: '2025-01-15T11:00:00Z',
          sources: ['PR TIMES'],
          relevanceScore: 50,
          personalImpact: '中',
          scoreReason: 'test',
        },
        {
          clusterId: 'sony1',
          events: [],
          primaryTicker: '6758',
          allTickers: ['6758'],
          title: 'Sony 1',
          impact: '強',
          eventType: '決算発表',
          publishedAt: '2025-01-15T10:00:00Z',
          sources: ['EDINET'],
          relevanceScore: 80,
          personalImpact: '強',
          scoreReason: 'test',
        },
        {
          clusterId: 'toyota2',
          events: [],
          primaryTicker: '7203',
          allTickers: ['7203'],
          title: 'Toyota 2',
          impact: '強',
          eventType: '上方修正',
          publishedAt: '2025-01-15T11:30:00Z',
          sources: ['EDINET'],
          relevanceScore: 90,
          personalImpact: '強',
          scoreReason: 'test',
        },
      ];

      const referenceTime = new Date('2025-01-15T12:00:00Z');
      const grouped = groupAndRankByTicker(
        events,
        DEFAULT_RANKING_CONFIG,
        referenceTime,
      );

      expect(grouped.size).toBe(2);
      expect(grouped.get('7203')).toHaveLength(2);
      expect(grouped.get('6758')).toHaveLength(1);

      // Toyota events should be ranked (toyota2 > toyota1)
      const toyotaEvents = grouped.get('7203');
      expect(toyotaEvents).toBeDefined();
      if (toyotaEvents) {
        expect(toyotaEvents[0].clusterId).toBe('toyota2');
      }
    });
  });

  describe('getTopEvents', () => {
    it('should return top N events', () => {
      const events: PersonalizedEvent[] = [
        {
          clusterId: 'event1',
          events: [],
          primaryTicker: '7203',
          allTickers: ['7203'],
          title: 'Event 1',
          impact: '強',
          eventType: '上方修正',
          publishedAt: '2025-01-15T11:00:00Z',
          sources: ['EDINET'],
          relevanceScore: 90,
          personalImpact: '強',
          scoreReason: 'test',
        },
        {
          clusterId: 'event2',
          events: [],
          primaryTicker: '7203',
          allTickers: ['7203'],
          title: 'Event 2',
          impact: '中',
          eventType: '新製品',
          publishedAt: '2025-01-15T10:00:00Z',
          sources: ['PR TIMES'],
          relevanceScore: 60,
          personalImpact: '中',
          scoreReason: 'test',
        },
        {
          clusterId: 'event3',
          events: [],
          primaryTicker: '7203',
          allTickers: ['7203'],
          title: 'Event 3',
          impact: '弱',
          eventType: 'その他',
          publishedAt: '2025-01-15T09:00:00Z',
          sources: ['PR TIMES'],
          relevanceScore: 30,
          personalImpact: '弱',
          scoreReason: 'test',
        },
      ];

      const referenceTime = new Date('2025-01-15T12:00:00Z');
      const top2 = getTopEvents(
        events,
        2,
        DEFAULT_RANKING_CONFIG,
        referenceTime,
      );

      expect(top2).toHaveLength(2);
      expect(top2[0].clusterId).toBe('event1');
    });
  });

  describe('ranking presets', () => {
    it('should have morning digest preset', () => {
      expect(MORNING_DIGEST_RANKING.relevanceWeight).toBe(0.6);
    });

    it('should have live feed preset', () => {
      expect(LIVE_FEED_RANKING.recencyWeight).toBe(0.5);
    });

    it('should have impact-first preset', () => {
      expect(IMPACT_FIRST_RANKING.impactWeight).toBe(0.5);
    });
  });
});
