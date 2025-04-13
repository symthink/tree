import React, { createContext, useContext, useReducer, useCallback } from 'react';

type AnimationState = 'IDLE' | 'ANIMATING' | 'COMPLETED' | 'CANCELLED';

interface AnimationContextState {
  state: AnimationState;
  currentAnimation: string | null;
  queue: string[];
  isAnimating: boolean;
}

type AnimationAction = 
  | { type: 'START_ANIMATION'; payload: string }
  | { type: 'COMPLETE_ANIMATION' }
  | { type: 'CANCEL_ANIMATION' }
  | { type: 'QUEUE_ANIMATION'; payload: string }
  | { type: 'CLEAR_QUEUE' };

const initialState: AnimationContextState = {
  state: 'IDLE',
  currentAnimation: null,
  queue: [],
  isAnimating: false
};

function animationReducer(state: AnimationContextState, action: AnimationAction): AnimationContextState {
  switch (action.type) {
    case 'QUEUE_ANIMATION':
      return {
        ...state,
        queue: [...state.queue, action.payload]
      };
    case 'START_ANIMATION':
      return {
        ...state,
        state: 'ANIMATING',
        currentAnimation: action.payload,
        isAnimating: true
      };
    case 'COMPLETE_ANIMATION':
      return {
        ...state,
        state: 'IDLE',
        currentAnimation: null,
        isAnimating: false
      };
    case 'CANCEL_ANIMATION':
      return {
        ...state,
        state: 'CANCELLED',
        currentAnimation: null,
        isAnimating: false,
        queue: []
      };
    case 'CLEAR_QUEUE':
      return {
        ...state,
        queue: []
      };
    default:
      return state;
  }
}

const AnimationContext = createContext<{
  state: AnimationContextState;
  dispatch: React.Dispatch<AnimationAction>;
  queueAnimation: (animationId: string) => void;
  startAnimation: (animationId: string) => void;
  completeAnimation: () => void;
  cancelAnimation: () => void;
  clearQueue: () => void;
} | undefined>(undefined);

export const AnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(animationReducer, initialState);

  const queueAnimation = useCallback((animationId: string) => {
    dispatch({ type: 'QUEUE_ANIMATION', payload: animationId });
  }, []);

  const startAnimation = useCallback((animationId: string) => {
    dispatch({ type: 'START_ANIMATION', payload: animationId });
  }, []);

  const completeAnimation = useCallback(() => {
    dispatch({ type: 'COMPLETE_ANIMATION' });
  }, []);

  const cancelAnimation = useCallback(() => {
    dispatch({ type: 'CANCEL_ANIMATION' });
  }, []);

  const clearQueue = useCallback(() => {
    dispatch({ type: 'CLEAR_QUEUE' });
  }, []);

  return (
    <AnimationContext.Provider value={{
      state,
      dispatch,
      queueAnimation,
      startAnimation,
      completeAnimation,
      cancelAnimation,
      clearQueue
    }}>
      {children}
    </AnimationContext.Provider>
  );
};

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
}; 