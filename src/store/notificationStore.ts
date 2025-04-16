import { create } from 'zustand';

interface NotificationState {
  subscribers: Set<(message: string) => void>;
  notify: (message: string) => void;
  subscribe: (callback: (message: string) => void) => () => void;
}

// This store is used to notify components of changes in the state. Used internally.
export const useNotificationStore = create<NotificationState>((set, get) => ({
  subscribers: new Set<(message: string) => void>(),
  
  notify: (message: string) => {
    get().subscribers.forEach(callback => callback(message));
  },
  
  subscribe: (callback: (message: string) => void) => {
    get().subscribers.add(callback);
    return () => {
      get().subscribers.delete(callback);
    };
  }
})); 


export enum IncomingMsgActionEnum {
  READDOC = 1,
  EDITDOC = 2,
  DIDSAVE = 3,
  VIEWTREE = 4,
  SOURCE = 5,
  POSTBACK = 6,
  POSTSUBCR = 7,
  RECYCLE = 8,
  THEREFORE = 9,
  LISTTYPE = 10,
  REORDER = 11,
  EDITEDITEM = 12,
  ADDITEM = 13,
  VOTE = 14,
  MOVEBAR = 15,
  NAVTO = 16,
  LAUNCH = 99,
}

export enum OutgoingMsgActionEnum {
  PAGECHANGE = 100,
  MODIFIED = 101,
  ERROR = 102,
  ADDSOURCE = 103,
  VIEWTREE = 104,
  POST = 105,
  OPEN = 106,
  READY = 107,
  REPLACE = 108,
  EXPORT = 109,
  SCROLL = 110,
  PRIVACY = 111,
  EDITITEM = 112,
  METRIC = 113,
  RECYCLE = 114,
  SHARE = 115,
  TAFOCUSED = 116,
  STATE = 117,
  SPARKLES = 118,
}

export interface OutgoingMsgAction {
  action: OutgoingMsgActionEnum;
  value: any;
  docId?: string;
}

interface OutgoingActionState {
  subscribers: Set<(message: OutgoingMsgAction) => void>;
  notify: (message: OutgoingMsgAction) => void;
  subscribe: (callback: (message: OutgoingMsgAction) => void) => () => void;
}

// This store is used to send messages out to the consuming app.
// and avoid prop drilling.
export const useOutgoingActionStore = create<OutgoingActionState>((set, get) => ({
  subscribers: new Set<(message: OutgoingMsgAction) => void>(),
  
  notify: (msgAction: OutgoingMsgAction) => {
    get().subscribers.forEach(callback => callback(msgAction));
  },

  subscribe: (callback: (message: OutgoingMsgAction) => void) => {
    get().subscribers.add(callback);
    return () => {
      get().subscribers.delete(callback);
    };
  }
}));  

interface AnimationState {
  animatingItemId: string | null;
  setAnimatingItemId: (id: string | null) => void;
}

export const useAnimationStore = create<AnimationState>((set) => ({
  animatingItemId: null,
  setAnimatingItemId: (id) => set({ animatingItemId: id }),
}));  