import { create } from 'zustand';

export const SymthinkTreeEvent = {
  PAGECHANGE: 'pageChange',
  MODIFIED: 'modified',
  ERROR: 'error',
  ADDSOURCE: 'addSource',
  VIEWTREE: 'viewTree',
  POST: 'post',
  OPEN: 'open',
  READY: 'ready',
  REPLACE: 'replace',
  EXPORT: 'export',
  SCROLL: 'scroll',
  PRIVACY: 'privacy',
  EDITITEM: 'editItem',
  METRIC: 'metric',
  RECYCLE: 'recycle',
  SHARE: 'share',
  TAFOCUSED: 'taFocused',
  STATE: 'state',
  SPARKLES: 'sparkles',
} as const;

export type SymthinkTreeEventType = typeof SymthinkTreeEvent[keyof typeof SymthinkTreeEvent];

// Payload for the SymthinkTreeEvent
export interface SymthinkTreeEventAction {
  action: SymthinkTreeEventType;
  value: any;
  docId?: string;
}

interface SymthinkTreeEventInterface {
  subscribers: Set<(message: SymthinkTreeEventAction) => void>;
  currentEvent: SymthinkTreeEventAction | null;
  notify: (message: SymthinkTreeEventAction) => void;
  subscribe: (callback: (message: SymthinkTreeEventAction) => void) => () => void;
}

/**
 * This store is used to send messages out to the consuming app
 */
export const useSymthinkTreeEvent = create<SymthinkTreeEventInterface>((set, get) => ({
  subscribers: new Set<(message: SymthinkTreeEventAction) => void>(),
  currentEvent: null,
  
  notify: (msgAction: SymthinkTreeEventAction) => {
    set({ currentEvent: msgAction });
    get().subscribers.forEach(callback => callback(msgAction));
  },

  subscribe: (callback: (message: SymthinkTreeEventAction) => void) => {
    get().subscribers.add(callback);
    return () => {
      get().subscribers.delete(callback);
    };
  }
})); 