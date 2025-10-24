/**
 * Tests for normalizationService
 */

import { normalizeEvent } from '../src/services/normalizationService';
import { RawEvent } from '../src/types/events';

describe('normalizationService', () => {
  describe('normalizeEvent', () => {
    it('should normalize a basic raw event', () => {
      const rawEvent: RawEvent = {
        id: 'test-id-1',
        source: 'EDINET',
        tier: 'A',
        title: '  トヨタ自動車｜有価証券報告書  ',
        url: 'https://example.com/doc?utm_source=test#section1',
        publishedAt: '2025-01-15T10:00:00Z',
        fetchedAt: '2025-01-15T10:05:00Z',
        tickerCodes: ['7203'],
        excerpt: '2024年度有価証券報告書',
      };

      const normalized = normalizeEvent(rawEvent);

      expect(normalized.id).toBe('test-id-1');
      expect(normalized.tier).toBe('A');
      expect(normalized.title).toBe('トヨタ自動車｜有価証券報告書');
      expect(normalized.url).not.toContain('utm_source');
      expect(normalized.url).not.toContain('#section1');
      expect(normalized.tickerCodes).toEqual(['7203']);
      expect(normalized.eventType).toBe('決算発表');
      expect(normalized.sourceName).toBe('EDINET');
    });

    it('should classify event type from keywords', () => {
      const rawEvent: RawEvent = {
        id: 'test-id-2',
        source: 'prtimes',
        tier: 'B',
        title: '業績予想の上方修正に関するお知らせ',
        url: 'https://example.com/pr/12345',
        publishedAt: '2025-01-15T11:00:00Z',
        fetchedAt: '2025-01-15T11:05:00Z',
        tickerCodes: ['9999'],
      };

      const normalized = normalizeEvent(rawEvent);

      expect(normalized.eventType).toBe('上方修正');
    });

    it('should normalize URL correctly', () => {
      const rawEvent: RawEvent = {
        id: 'test-id-3',
        source: 'company_ir',
        tier: 'B',
        title: 'Test Event',
        url: 'http://example.com/page?utm_medium=email&ref=newsletter#top',
        publishedAt: '2025-01-15T12:00:00Z',
        fetchedAt: '2025-01-15T12:05:00Z',
        tickerCodes: [],
      };

      const normalized = normalizeEvent(rawEvent);

      expect(normalized.url).toBe('https://example.com/page');
      expect(normalized.url).toMatch(/^https:/);
      expect(normalized.url).not.toContain('utm_');
      expect(normalized.url).not.toContain('#');
    });

    it('should handle events with no ticker codes', () => {
      const rawEvent: RawEvent = {
        id: 'test-id-4',
        source: 'prtimes',
        tier: 'B',
        title: '新商品発売のお知らせ',
        url: 'https://example.com/news',
        publishedAt: '2025-01-15T13:00:00Z',
        fetchedAt: '2025-01-15T13:05:00Z',
        tickerCodes: [],
      };

      const normalized = normalizeEvent(rawEvent);

      expect(normalized.tickerCodes).toEqual([]);
      expect(normalized.eventType).toBe('新製品');
    });

    it('should classify "その他" when no keywords match', () => {
      const rawEvent: RawEvent = {
        id: 'test-id-5',
        source: 'company_ir',
        tier: 'B',
        title: 'Miscellaneous announcement',
        url: 'https://example.com/misc',
        publishedAt: '2025-01-15T14:00:00Z',
        fetchedAt: '2025-01-15T14:05:00Z',
        tickerCodes: ['1234'],
      };

      const normalized = normalizeEvent(rawEvent);

      expect(normalized.eventType).toBe('その他');
    });
  });
});
