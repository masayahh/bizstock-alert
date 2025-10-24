/**
 * EDINET API Service
 *
 * Fetches disclosure documents from EDINET (Electronic Disclosure for Investors' NETwork)
 * Per product spec: Primary source (tier A) for official corporate disclosures
 *
 * EDINET API documentation: https://disclosure.edinet-fsa.go.jp/EKW0EZ1001.html
 */

import { v4 as uuidv4 } from 'uuid';

import { RawEvent, EdinetDocument } from '../types/events';

const EDINET_API_BASE = 'https://disclosure.edinet-fsa.go.jp/api/v1';

/**
 * EDINET API response structure
 */
interface EdinetApiResponse {
  metadata: {
    title: string;
    parameter: {
      date: string;
      type: string;
    };
    resultset: {
      count: number;
    };
    processDateTime: string;
    status: string;
    message: string;
  };
  results: EdinetDocument[];
}

/**
 * Fetch EDINET documents for a specific date
 *
 * @param date - Date in YYYY-MM-DD format (JST)
 * @returns Array of raw events from EDINET
 *
 * Per product spec:
 * - This is a tier A (primary) source
 * - Fetch metadata only (no full document text per spec: no redistribution)
 * - Target document types: 有報/四半期/臨報/大量保有
 */
export async function fetchEdinetDocuments(date: string): Promise<RawEvent[]> {
  const url = `${EDINET_API_BASE}/documents.json?date=${date}&type=2`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'BizStockAlert/0.1.0',
      },
    });

    if (!response.ok) {
      throw new Error(
        `EDINET API error: ${response.status} ${response.statusText}`,
      );
    }

    const data: EdinetApiResponse = await response.json();

    if (data.metadata.status !== '200') {
      throw new Error(
        `EDINET API error: ${data.metadata.status} - ${data.metadata.message}`,
      );
    }

    // Filter relevant document types and convert to RawEvent
    const relevantDocs = filterRelevantDocuments(data.results);
    return relevantDocs.map((doc) => convertToRawEvent(doc));
  } catch (error) {
    console.error('Failed to fetch EDINET documents:', error);
    throw error;
  }
}

/**
 * Filter relevant document types per product spec
 * Target: 有報/四半期/臨報/大量保有
 */
function filterRelevantDocuments(docs: EdinetDocument[]): EdinetDocument[] {
  const relevantDocTypes = [
    '有価証券報告書',
    '四半期報告書',
    '半期報告書',
    '臨時報告書',
    '大量保有報告書',
    '変更報告書',
    '訂正報告書',
  ];

  return docs.filter(
    (doc) =>
      // Has security code (listed company)
      doc.secCode &&
      // Is one of the relevant document types
      relevantDocTypes.some((type) => doc.docDescription.includes(type)),
  );
}

/**
 * Convert EDINET document to RawEvent
 */
function convertToRawEvent(doc: EdinetDocument): RawEvent {
  const tickerCode = doc.secCode ? doc.secCode.substring(0, 4) : '';

  return {
    id: uuidv4(),
    source: 'EDINET',
    tier: 'A', // Primary source per product spec
    title: `${doc.filerName}｜${doc.docDescription}`,
    url: `https://disclosure.edinet-fsa.go.jp/E01EW/BLMainController.jsp?PID=W1E63011&SESSIONKEY=&ORGCD=&EDTCD=&PNTCD=&UEKDT=&SPEFL=&RVEFLG=0&ALNDTSTR=&ALNDTED=&SECCD=${doc.secCode}&UNITCNT=&RSC=1&DCL=1&SPNM=${encodeURIComponent(doc.filerName)}`,
    publishedAt: new Date(doc.submitDateTime).toISOString(),
    fetchedAt: new Date().toISOString(),
    tickerCodes: tickerCode ? [tickerCode] : [],
    excerpt: doc.docDescription,
  };
}

/**
 * Fetch EDINET documents for date range
 *
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Array of raw events
 */
export async function fetchEdinetDocumentsRange(
  startDate: string,
  endDate: string,
): Promise<RawEvent[]> {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const allEvents: RawEvent[] = [];

  for (
    let date = new Date(start);
    date <= end;
    date.setDate(date.getDate() + 1)
  ) {
    const dateStr = date.toISOString().split('T')[0];
    try {
      const events = await fetchEdinetDocuments(dateStr);
      allEvents.push(...events);
      // Small delay to avoid overwhelming API
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.warn(`Failed to fetch EDINET for ${dateStr}:`, error);
      // Continue with next date even if one fails
    }
  }

  return allEvents;
}

/**
 * Fetch latest EDINET documents (today only)
 * Convenience function for real-time monitoring
 */
export async function fetchLatestEdinetDocuments(): Promise<RawEvent[]> {
  const today = new Date().toISOString().split('T')[0];
  return fetchEdinetDocuments(today);
}
