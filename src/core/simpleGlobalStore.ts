/**
 * Simple non-reactive global store for application-wide state that doesn't require reactivity.
 * This store is a singleton and can be imported and used directly.
 */
class SimpleGlobalStore {
  private navigationRects: DOMRect[] = [];

  /**
   * Stores a DOMRect for navigation animation purposes.
   * Used when navigating forward to store the position of the clicked item.
   */
  pushNavigationRect(rect: DOMRect) {
    this.navigationRects.push(rect);
  }

  /**
   * Retrieves and removes the last stored DOMRect.
   * Used when navigating back to animate to the previous position.
   * @returns The last stored DOMRect or undefined if none exists
   */
  popNavigationRect(): DOMRect | undefined {
    return this.navigationRects.pop();
  }

  /**
   * Clears all stored navigation rects.
   * Useful when resetting navigation or cleaning up.
   */
  clearNavigationRects() {
    this.navigationRects = [];
  }

  /**
   * Peek at the last navigation rect without removing it.
   * @returns The last stored DOMRect or undefined if none exists
   */
  peekLastNavigationRect(): DOMRect | undefined {
    return this.navigationRects[this.navigationRects.length - 1];
  }

  /**
   * Get the current number of stored navigation rects
   */
  get navigationRectsCount(): number {
    return this.navigationRects.length;
  }
}

// Export a singleton instance
export const globalStor = new SimpleGlobalStore();