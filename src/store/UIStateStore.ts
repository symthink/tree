import { create } from 'zustand';
import { useToolbarAction, ToolbarAction } from './ToolbarAction';

interface UIState {
    currentCardId: string | null;
    setCurrentCardId: (cardId: string | null) => void;
    isEditing: boolean;
    setEditing: (isEditing: boolean) => void;
}

export const useUIState = create<UIState>((set) => ({
    currentCardId: null,
    setCurrentCardId: (cardId) => set({ currentCardId: cardId }),
    isEditing: false,
    setEditing: (isEditing) => set({ isEditing }),
}));

// Subscribe to EDIT_CARD action
useToolbarAction.subscribe((state) => {
    if (state.currentAction === ToolbarAction.EDIT_CARD) {
        useUIState.getState().setEditing(true);
    }
}); 