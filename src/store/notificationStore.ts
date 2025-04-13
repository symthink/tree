import { create, StateCreator } from 'zustand';

interface NotificationState {
  subscribers: Set<(message: string) => void>;
  notify: (message: string) => void;
  subscribe: (callback: (message: string) => void) => () => void;
}

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