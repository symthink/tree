import { create } from 'zustand';
import { useToolbarAction, ToolbarAction } from './ToolbarAction';

interface UIState {
  isEditing: boolean;
  editingItemId: string | null;
  setEditing: (isEditing: boolean, itemId?: string) => void;
}

export const useUIState = create<UIState>((set) => ({
  isEditing: false,
  editingItemId: null,
  setEditing: (isEditing, itemId) => set({ isEditing, editingItemId: itemId || null }),
}));

// Subscribe to EDIT_CARD action
useToolbarAction.subscribe((state) => {
  if (state.currentAction === ToolbarAction.EDIT_CARD) {
    useUIState.getState().setEditing(true, state.actionData?.itemId);
  }
}); 