/**
 * Tests for clusteringService
 */

import {
  clusterEvents,
  calculateSimilarity,
  shouldDeliver,
  generateIdempotencyKey,
  applyCooldown,
} from '../src/services/clusteringService';
import { NormalizedEvent } from '../src/types/events';

describe('clusteringService', () => {
  describe('calculateSimilarity', () => {
    it('should return 1.0 for identical texts', () => {
      const text = 'トヨタ自動車が新製品を発表';
      const similarity = calculateSimilarity(text, text);
      expect(similarity).toBe(1.0);
    });

    it('should return high similarity for similar texts', () => {
      const text1 = 'トヨタ自動車が新製品を発表';
      const text2 = 'トヨタ自動車が新商品を発表';
      const similarity = calculateSimilarity(text1, text2);
      expect(similarity).toBeGreaterThan(0.7);
    });

    it('should return low similarity for different texts', () => {
      const text1 = 'トヨタ自動車が新製品を発表';
      const text2 = 'ソニーグループが決算を発表';
      const similarity = calculateSimilarity(text1, text2);
      expect(similarity).toBeLessThan(0.5);
    });
  });

  describe('clusterEvents', () => {
    it('should cluster similar events', () => {
      const events: NormalizedEvent[] = [
        {
          id: 'event1',
          tier: 'A',
          title: 'トヨタ自動車が新製品を発表',
          url: 'https://example.com/1',
          publishedAt: '2025-01-15T10:00:00Z',
          fetchedAt: '2025-01-15T10:05:00Z',
          tickerCodes: ['7203'],
          eventType: '新製品',
          sourceName: 'EDINET',
        },
        {
          id: 'event2',
          tier: 'B',
          title: 'トヨタ自動車が新商品を発表',
          url: 'https://example.com/2',
          publishedAt: '2025-01-15T10:10:00Z',
          fetchedAt: '2025-01-15T10:15:00Z',
          tickerCodes: ['7203'],
          eventType: '新製品',
          sourceName: 'PR TIMES',
        },
      ];

      const clusters = clusterEvents(events);

      expect(clusters).toHaveLength(1);
      expect(clusters[0].events).toHaveLength(2);
      expect(clusters[0].primaryTicker).toBe('7203');
    });

    it('should not cluster events with different tickers', () => {
      const events: NormalizedEvent[] = [
        {
          id: 'event1',
          tier: 'A',
          title: 'トヨタ自動車が新製品を発表',
          url: 'https://example.com/1',
          publishedAt: '2025-01-15T10:00:00Z',
          fetchedAt: '2025-01-15T10:05:00Z',
          tickerCodes: ['7203'],
          eventType: '新製品',
          sourceName: 'EDINET',
        },
        {
          id: 'event2',
          tier: 'B',
          title: 'ソニーが新製品を発表',
          url: 'https://example.com/2',
          publishedAt: '2025-01-15T10:10:00Z',
          fetchedAt: '2025-01-15T10:15:00Z',
          tickerCodes: ['6758'],
          eventType: '新製品',
          sourceName: 'PR TIMES',
        },
      ];

      const clusters = clusterEvents(events);

      expect(clusters).toHaveLength(2);
    });
  });

  describe('shouldDeliver', () => {
    it('should deliver cluster with tier A source', () => {
      const cluster = {
        clusterId: 'test1',
        events: [
          {
            id: 'event1',
            tier: 'A' as const,
            title: 'Test',
            url: 'https://example.com',
            publishedAt: '2025-01-15T10:00:00Z',
            fetchedAt: '2025-01-15T10:00:00Z',
            tickerCodes: ['7203'],
            eventType: '新製品' as const,
            sourceName: 'EDINET',
          },
        ],
        primaryTicker: '7203',
        allTickers: ['7203'],
        title: 'Test',
        impact: '強' as const,
        eventType: '新製品' as const,
        publishedAt: '2025-01-15T10:00:00Z',
        sources: ['EDINET'],
      };

      expect(shouldDeliver(cluster)).toBe(true);
    });

    it('should deliver cluster with 2+ tier B sources', () => {
      const cluster = {
        clusterId: 'test2',
        events: [
          {
            id: 'event1',
            tier: 'B' as const,
            title: 'Test',
            url: 'https://example.com/1',
            publishedAt: '2025-01-15T10:00:00Z',
            fetchedAt: '2025-01-15T10:00:00Z',
            tickerCodes: ['7203'],
            eventType: '新製品' as const,
            sourceName: 'PR TIMES',
          },
          {
            id: 'event2',
            tier: 'B' as const,
            title: 'Test',
            url: 'https://example.com/2',
            publishedAt: '2025-01-15T10:10:00Z',
            fetchedAt: '2025-01-15T10:10:00Z',
            tickerCodes: ['7203'],
            eventType: '新製品' as const,
            sourceName: '会社IR',
          },
        ],
        primaryTicker: '7203',
        allTickers: ['7203'],
        title: 'Test',
        impact: '強' as const,
        eventType: '新製品' as const,
        publishedAt: '2025-01-15T10:00:00Z',
        sources: ['PR TIMES', '会社IR'],
      };

      expect(shouldDeliver(cluster)).toBe(true);
    });

    it('should not deliver cluster with single tier B source', () => {
      const cluster = {
        clusterId: 'test3',
        events: [
          {
            id: 'event1',
            tier: 'B' as const,
            title: 'Test',
            url: 'https://example.com',
            publishedAt: '2025-01-15T10:00:00Z',
            fetchedAt: '2025-01-15T10:00:00Z',
            tickerCodes: ['7203'],
            eventType: '新製品' as const,
            sourceName: 'PR TIMES',
          },
        ],
        primaryTicker: '7203',
        allTickers: ['7203'],
        title: 'Test',
        impact: '中' as const,
        eventType: '新製品' as const,
        publishedAt: '2025-01-15T10:00:00Z',
        sources: ['PR TIMES'],
      };

      expect(shouldDeliver(cluster)).toBe(false);
    });
  });

  describe('generateIdempotencyKey', () => {
    it('should generate consistent idempotency key', () => {
      const cluster = {
        clusterId: 'test_cluster_123',
        events: [],
        primaryTicker: '7203',
        allTickers: ['7203'],
        title: 'Test',
        impact: '強' as const,
        eventType: '新製品' as const,
        publishedAt: '2025-01-15T10:00:00Z',
        sources: ['EDINET'],
      };

      const key1 = generateIdempotencyKey(cluster, 1);
      const key2 = generateIdempotencyKey(cluster, 1);

      expect(key1).toBe(key2);
      expect(key1).toContain('test_cluster_123');
      expect(key1).toContain('強');
    });
  });

  describe('applyCooldown', () => {
    it('should merge clusters within cooldown period', () => {
      const clusters = [
        {
          clusterId: 'cluster1',
          events: [
            {
              id: 'event1',
              tier: 'A' as const,
              title: 'トヨタが新製品を発表',
              url: 'https://example.com/1',
              publishedAt: '2025-01-15T10:00:00Z',
              fetchedAt: '2025-01-15T10:00:00Z',
              tickerCodes: ['7203'],
              eventType: '新製品' as const,
              sourceName: 'EDINET',
            },
          ],
          primaryTicker: '7203',
          allTickers: ['7203'],
          title: 'トヨタが新製品を発表',
          impact: '強' as const,
          eventType: '新製品' as const,
          publishedAt: '2025-01-15T10:00:00Z',
          sources: ['EDINET'],
        },
        {
          clusterId: 'cluster2',
          events: [
            {
              id: 'event2',
              tier: 'B' as const,
              title: 'トヨタが新製品を発表',
              url: 'https://example.com/2',
              publishedAt: '2025-01-15T10:15:00Z',
              fetchedAt: '2025-01-15T10:15:00Z',
              tickerCodes: ['7203'],
              eventType: '新製品' as const,
              sourceName: 'PR TIMES',
            },
          ],
          primaryTicker: '7203',
          allTickers: ['7203'],
          title: 'トヨタが新製品を発表',
          impact: '中' as const,
          eventType: '新製品' as const,
          publishedAt: '2025-01-15T10:15:00Z',
          sources: ['PR TIMES'],
        },
      ];

      const result = applyCooldown(clusters, 30);

      expect(result).toHaveLength(1);
      expect(result[0].events).toHaveLength(2);
    });
  });
});
