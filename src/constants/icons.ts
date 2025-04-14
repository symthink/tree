/**
 * List of Material Icons used throughout the Symthink component library.
 * These icons are preloaded by the IconPreloader component.
 */
export const SYMTHINK_ICONS = [
  'chevron-left',  // Back button
  'add',           // Add new items
  'more-vert',     // Options menu
  'bookmark',      // Source reference indicator
] as const;

export type SymthinkIcon = typeof SYMTHINK_ICONS[number]; 