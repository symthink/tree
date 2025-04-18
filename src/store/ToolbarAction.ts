import { create } from 'zustand';

export const ToolbarAction = {
  READDOC: 'readDoc',
  EDITDOC: 'editDoc',
  DIDSAVE: 'didSave',
  VIEWTREE: 'viewTree',
  SOURCE: 'source',
  POSTBACK: 'postBack',
  POSTSUBCR: 'postSubcr',
  RECYCLE: 'recycle',
  THEREFORE: 'therefore',
  LISTTYPE: 'listType',
  REORDER: 'reorder',
  EDITEDITEM: 'editedItem',
  ADDITEM: 'addItem',
  VOTE: 'vote',
  MOVEBAR: 'moveBar',
  NAVTO: 'navTo',
  LAUNCH: 'launch',
} as const;

export type ToolbarActionType = typeof ToolbarAction[keyof typeof ToolbarAction];

interface ToolbarActionState {
  currentAction: ToolbarActionType | null;
  actionData: any;
  setAction: (action: ToolbarActionType, data?: any) => void;
  clearAction: () => void;
}

export const useToolbarAction = create<ToolbarActionState>((set) => ({
  currentAction: null,
  actionData: null,
  setAction: (action, data) => set({ currentAction: action, actionData: data }),
  clearAction: () => set({ currentAction: null, actionData: null }),
})); 