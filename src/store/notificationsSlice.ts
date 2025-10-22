import { createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Representation of a push notification delivered to the user. The
 * application will store a list of these notifications locally so that
 * they can be displayed in a history or digest screen. This model loosely
 * follows the spec: each notification contains metadata about the ticker,
 * a human‑readable message, its importance and a timestamp. A `read`
 * flag indicates whether the user has opened the notification inside the app.
 */
export interface Notification {
  /** Unique identifier for the notification (e.g. event ID or UUID). */
  id: string;
  /** Stock ticker associated with the notification (e.g. "7203.T"). */
  ticker: string;
  /** Human‑friendly message summarising the event. */
  message: string;
  /** Impact level per product spec: 強(strong), 中(medium), 弱(weak). */
  importance: '強' | '中' | '弱';
  /** ISO timestamp when the notification was sent. */
  timestamp: string;
  /** Whether the user has opened or acknowledged this notification. */
  read: boolean;
}

export interface NotificationsState {
  /** Array of notifications, newest first. */
  items: Notification[];
}

const initialState: NotificationsState = {
  items: [],
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    /**
     * Push a new notification to the front of the list. Newest
     * notifications appear first. If a notification with the same ID
     * already exists, it will be updated in place.
     */
    addNotification: (state, action: PayloadAction<Notification>) => {
      const existingIndex = state.items.findIndex(
        (n) => n.id === action.payload.id,
      );
      if (existingIndex >= 0) {
        state.items[existingIndex] = action.payload;
      } else {
        state.items.unshift(action.payload);
      }
    },
    /**
     * Mark a notification as read. This could be triggered when
     * the user views the event detail screen.
     */
    markRead: (state, action: PayloadAction<string>) => {
      const notif = state.items.find((n) => n.id === action.payload);
      if (notif) {
        notif.read = true;
      }
    },
    /**
     * Remove all notifications from the list. Useful when clearing
     * history or logging out.
     */
    clearNotifications: (state) => {
      state.items = [];
    },
  },
});

export const { addNotification, markRead, clearNotifications } =
  notificationsSlice.actions;

export default notificationsSlice.reducer;
