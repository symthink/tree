import { create } from 'zustand';

interface AnimationState {
  animatingItemId: string | null;
  setAnimatingItemId: (id: string | null) => void;
  subscribers: Set<() => void>;
  notifySharedElFwdAnimDone: () => void;
  subscribeSharedElFwdAnimDone: (callback: () => void) => () => void;
}

// This store is used to notify components of changes in the state. 
export const useAnimationStore = create<AnimationState>((set, get) => ({
  animatingItemId: null,
  setAnimatingItemId: (id) => set({ animatingItemId: id }),
  
  subscribers: new Set<() => void>(),
  
  // specifically the shared element animation going forward
  notifySharedElFwdAnimDone: () => {
    get().subscribers.forEach(callback => callback());
  },
  
  subscribeSharedElFwdAnimDone: (callback: () => void) => {
    get().subscribers.add(callback);
    return () => {
      get().subscribers.delete(callback);
    };
  }
})); 
