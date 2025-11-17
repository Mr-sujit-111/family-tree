/**
 * Utility functions for persisting and restoring tree state
 */

const TREE_STATE_KEY = 'family_tree_state';

export interface TreeState {
  expandedNodes: string[];
  zoomLevel: number;
}

export function saveTreeState(state: TreeState): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(TREE_STATE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save tree state:', error);
    }
  }
}

export function loadTreeState(): TreeState | null {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(TREE_STATE_KEY);
      if (stored) {
        return JSON.parse(stored) as TreeState;
      }
    } catch (error) {
      console.warn('Failed to load tree state:', error);
    }
  }
  return null;
}

export function clearTreeState(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(TREE_STATE_KEY);
    } catch (error) {
      console.warn('Failed to clear tree state:', error);
    }
  }
}

