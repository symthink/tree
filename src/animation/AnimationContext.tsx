import React, { createContext, useContext, useReducer } from 'react';

type AnimationState = 'IDLE' | 'ANIMATING' | 'COMPLETED';
type AnimationAction = 
  | { type: 'START_ANIMATION' }
  | { type: 'COMPLETE_ANIMATION' }
  | { type: 'CANCEL_ANIMATION' };

interface AnimationContextState {
  state: AnimationState;
  currentAnimation: string | null;
  queue: string[];
}

const initialState: AnimationContextState = {
  state: 'IDLE',
  currentAnimation: null,
  queue: []
};

function animationReducer(state: AnimationContextState, action: AnimationAction): AnimationContextState {
  switch (action.type) {
    case 'START_ANIMATION':
      return {
        ...state,
        state: 'ANIMATING',
        currentAnimation: state.queue[0] || null,
        queue: state.queue.slice(1)
      };
    case 'COMPLETE_ANIMATION':
      return {
        ...state,
        state: 'IDLE',
        currentAnimation: null
      };
    case 'CANCEL_ANIMATION':
      return {
        ...state,
        state: 'IDLE',
        currentAnimation: null,
        queue: []
      };
    default:
      return state;
  }
}

const AnimationContext = createContext<{
  state: AnimationContextState;
  dispatch: React.Dispatch<AnimationAction>;
} | undefined>(undefined);

export const AnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(animationReducer, initialState);

  return (
    <AnimationContext.Provider value={{ state, dispatch }}>
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