/**
 * Translation strings for internationalization
 * Supports Japanese (ja) and English (en)
 */

export type Language = 'ja' | 'en';

export interface Translations {
  common: {
    appName: string;
    appSubtitle: string;
    loading: string;
    error: string;
    retry: string;
    close: string;
    cancel: string;
    confirm: string;
    save: string;
    delete: string;
    edit: string;
    add: string;
    search: string;
    filter: string;
    sort: string;
    all: string;
  };
  home: {
    searchPlaceholder: string;
    noResults: string;
    refreshing: string;
    addTicker: string;
    tickerPlaceholder: string;
    invalidTicker: string;
  };
  importance: {
    high: string;
    medium: string;
    low: string;
  };
  events: {
    title: string;
    empty: string;
    emptySubtitle: string;
    details: string;
    sources: string;
    actions: string;
    followUpsOnly: string;
    quietMode: string;
  };
  notifications: {
    title: string;
    empty: string;
    emptySubtitle: string;
  };
  settings: {
    title: string;
    highImmediate: string;
    followUpsOnly: string;
    quietMode: string;
  };
  errors: {
    unexpected: string;
    network: string;
    notFound: string;
    serverError: string;
  };
  accessibility: {
    openMenu: string;
    closeMenu: string;
    filter: string;
    sort: string;
    search: string;
    clearSearch: string;
  };
}

export const translations: Record<Language, Translations> = {
  ja: {
    common: {
      appName: 'BizStock Alert',
      appSubtitle: 'リアルタイムIR通知',
      loading: '読み込み中...',
      error: 'エラー',
      retry: '再試行',
      close: '閉じる',
      cancel: 'キャンセル',
      confirm: '確認',
      save: '保存',
      delete: '削除',
      edit: '編集',
      add: '追加',
      search: '検索',
      filter: 'フィルター',
      sort: '並び替え',
      all: '全て',
    },
    home: {
      searchPlaceholder: 'イベント・通知を検索...',
      noResults: '結果が見つかりませんでした',
      refreshing: '更新中...',
      addTicker: 'ティッカーを追加',
      tickerPlaceholder: 'ティッカーシンボル (例: 7203)',
      invalidTicker: '無効なティッカーシンボルです',
    },
    importance: {
      high: '強',
      medium: '中',
      low: '弱',
    },
    events: {
      title: '最新イベント',
      empty: 'ウォッチリストにティッカーを追加して開始',
      emptySubtitle: '例: 7203, 6758, 9984',
      details: 'イベント詳細',
      sources: '出典',
      actions: 'アクション',
      followUpsOnly: '続報のみ受け取る',
      quietMode: '2時間 静かにする',
    },
    notifications: {
      title: '最新通知',
      empty: '新しい通知はありません',
      emptySubtitle: 'ウォッチリストのイベントが表示されます',
    },
    settings: {
      title: '設定',
      highImmediate: '高重要度即座に通知',
      followUpsOnly: '続報のみ受け取る',
      quietMode: '静かモード',
    },
    errors: {
      unexpected: '予期しないエラーが発生しました',
      network: 'ネットワークエラーが発生しました',
      notFound: 'データが見つかりませんでした',
      serverError: 'サーバーエラーが発生しました',
    },
    accessibility: {
      openMenu: 'メニューを開く',
      closeMenu: 'メニューを閉じる',
      filter: 'フィルター',
      sort: '並び替え',
      search: '検索',
      clearSearch: '検索をクリア',
    },
  },
  en: {
    common: {
      appName: 'BizStock Alert',
      appSubtitle: 'Real-time IR Notifications',
      loading: 'Loading...',
      error: 'Error',
      retry: 'Retry',
      close: 'Close',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      all: 'All',
    },
    home: {
      searchPlaceholder: 'Search events and notifications...',
      noResults: 'No results found',
      refreshing: 'Refreshing...',
      addTicker: 'Add Ticker',
      tickerPlaceholder: 'Ticker symbol (e.g., 7203)',
      invalidTicker: 'Invalid ticker symbol',
    },
    importance: {
      high: 'High',
      medium: 'Medium',
      low: 'Low',
    },
    events: {
      title: 'Latest Events',
      empty: 'Add a ticker to your watchlist to get started',
      emptySubtitle: 'e.g., 7203, 6758, 9984',
      details: 'Event Details',
      sources: 'Sources',
      actions: 'Actions',
      followUpsOnly: 'Follow-ups only',
      quietMode: 'Quiet for 2 hours',
    },
    notifications: {
      title: 'Latest Notifications',
      empty: 'No new notifications',
      emptySubtitle: 'Events from your watchlist will appear here',
    },
    settings: {
      title: 'Settings',
      highImmediate: 'High importance immediate notifications',
      followUpsOnly: 'Follow-ups only',
      quietMode: 'Quiet mode',
    },
    errors: {
      unexpected: 'An unexpected error occurred',
      network: 'A network error occurred',
      notFound: 'Data not found',
      serverError: 'A server error occurred',
    },
    accessibility: {
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      filter: 'Filter',
      sort: 'Sort',
      search: 'Search',
      clearSearch: 'Clear search',
    },
  },
};
