/**
 * This store is used by the consuming app to send messages to subscribers within this component library
 */

import { create } from 'zustand';

export const ClientAppEvent = {
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

export type ClientAppEventType = typeof ClientAppEvent[keyof typeof ClientAppEvent];

interface ClientAppEventInterface {
  subscribers: Set<(message: ClientAppEventType) => void>;
  notify: (message: ClientAppEventType) => void;
  subscribe: (callback: (message: ClientAppEventType) => void) => () => void;
}

/**
 * This store is used by the consuming app to send messages to
 * subscribers within the SymthinkTree component library
 */
export const useClientAppEvent = create<ClientAppEventInterface>((set, get) => ({
  subscribers: new Set<(message: ClientAppEventType) => void>(),
  
  notify: (msgAction: ClientAppEventType) => {
    get().subscribers.forEach(callback => callback(msgAction));
  },

  subscribe: (callback: (message: ClientAppEventType) => void) => {
    get().subscribers.add(callback);
    return () => {
      get().subscribers.delete(callback);
    };
  }
})); 