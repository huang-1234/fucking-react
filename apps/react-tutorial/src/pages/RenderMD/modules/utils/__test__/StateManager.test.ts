import { describe, it, expect, vi, beforeEach } from 'vitest';
import StateManager from '../StateManager';

describe('StateManager', () => {
  interface TestState {
    count: number;
    text: string;
    nested?: {
      value: number;
      items: string[];
    };
  }

  let stateManager: StateManager<TestState>;
  const initialState: TestState = {
    count: 0,
    text: 'initial',
    nested: {
      value: 10,
      items: ['item1', 'item2']
    }
  };

  beforeEach(() => {
    stateManager = new StateManager<TestState>(initialState);
  });

  describe('getState', () => {
    it('should return the current state', () => {
      const state = stateManager.getState();
      expect(state).toEqual(initialState);
    });

    it('should return a copy of the state, not the original', () => {
      const state = stateManager.getState();
      state.count = 100;
      expect(stateManager.getState().count).toBe(0);
    });
  });

  describe('setState', () => {
    it('should update the state immutably', () => {
      const oldState = stateManager.getState();

      stateManager.setState((draft: TestState) => {
        draft.count = 5;
      });

      const newState = stateManager.getState();
      expect(newState.count).toBe(5);
      expect(newState).not.toBe(oldState);
      expect(newState.text).toBe('initial');
    });

    it('should handle nested updates', () => {
      stateManager.setState((draft: TestState) => {
        if (draft.nested) {
          draft.nested.value = 20;
          draft.nested.items.push('item3');
        }
      });

      const state = stateManager.getState();
      expect(state.nested?.value).toBe(20);
      expect(state.nested?.items).toEqual(['item1', 'item2', 'item3']);
    });

    it('should notify subscribers after update', () => {
      const subscriber = vi.fn();
      stateManager.subscribe(subscriber);

      stateManager.setState((draft: TestState) => {
        draft.count = 10;
      });

      expect(subscriber).toHaveBeenCalledTimes(1);
      expect(subscriber).toHaveBeenCalledWith(stateManager.getState(), expect.anything(), undefined);
    });
  });

  describe('subscribe and unsubscribe', () => {
    it('should add subscribers that are notified on updates', () => {
      const subscriber1 = vi.fn();
      const subscriber2 = vi.fn();

      stateManager.subscribe(subscriber1);
      stateManager.subscribe(subscriber2);

      stateManager.setState((draft: TestState) => {
        draft.count = 5;
      });

      expect(subscriber1).toHaveBeenCalledTimes(1);
      expect(subscriber2).toHaveBeenCalledTimes(1);
    });

    it('should remove subscribers when unsubscribe is called', () => {
      const subscriber1 = vi.fn();
      const subscriber2 = vi.fn();

      const unsubscribe1 = stateManager.subscribe(subscriber1);
      stateManager.subscribe(subscriber2);

      unsubscribe1();

      stateManager.setState((draft: TestState) => {
        draft.count = 5;
      });

      expect(subscriber1).not.toHaveBeenCalled();
      expect(subscriber2).toHaveBeenCalledTimes(1);
    });
  });

  describe('undo and redo', () => {
    it('should allow undoing changes', () => {
      stateManager.setState((draft: TestState) => {
        draft.count = 5;
      });

      stateManager.setState((draft: TestState) => {
        draft.count = 10;
      });

      stateManager.undo();
      expect(stateManager.getState().count).toBe(5);

      stateManager.undo();
      expect(stateManager.getState().count).toBe(0);
    });

    it('should not go past the initial state when undoing', () => {
      stateManager.setState((draft: TestState) => {
        draft.count = 5;
      });

      stateManager.undo();
      stateManager.undo(); // Try to undo past initial state

      expect(stateManager.getState().count).toBe(0);
    });

    it('should allow redoing undone changes', () => {
      stateManager.setState((draft: TestState) => {
        draft.count = 5;
      });

      stateManager.setState((draft: TestState) => {
        draft.count = 10;
      });

      stateManager.undo();
      stateManager.undo();

      stateManager.redo();
      expect(stateManager.getState().count).toBe(5);

      stateManager.redo();
      expect(stateManager.getState().count).toBe(10);
    });

    it('should clear redo stack when new update is made after undo', () => {
      stateManager.setState((draft: TestState) => {
        draft.count = 5;
      });

      stateManager.setState((draft: TestState) => {
        draft.count = 10;
      });

      stateManager.undo(); // Back to count = 5

      stateManager.setState((draft: TestState) => {
        draft.count = 7;
      });

      stateManager.redo(); // Should do nothing as redo stack is cleared

      expect(stateManager.getState().count).toBe(7);
    });

    it('should notify subscribers after undo/redo', () => {
      const subscriber = vi.fn();
      stateManager.subscribe(subscriber);

      stateManager.setState((draft: TestState) => {
        draft.count = 5;
      });

      subscriber.mockReset();

      stateManager.undo();
      expect(subscriber).toHaveBeenCalledTimes(1);

      subscriber.mockReset();

      stateManager.redo();
      expect(subscriber).toHaveBeenCalledTimes(1);
    });
  });

  describe('canUndo and canRedo', () => {
    it('should correctly report if undo is possible', () => {
      expect(stateManager.canUndo()).toBe(false);

      stateManager.setState((draft: TestState) => {
        draft.count = 5;
      });

      expect(stateManager.canUndo()).toBe(true);

      stateManager.undo();

      expect(stateManager.canUndo()).toBe(false);
    });

    it('should correctly report if redo is possible', () => {
      expect(stateManager.canRedo()).toBe(false);

      stateManager.setState((draft: TestState) => {
        draft.count = 5;
      });

      expect(stateManager.canRedo()).toBe(false);

      stateManager.undo();

      expect(stateManager.canRedo()).toBe(true);

      stateManager.redo();

      expect(stateManager.canRedo()).toBe(false);
    });
  });

  describe('resetState', () => {
    it('should reset the state to the initial state', () => {
      stateManager.setState((draft: TestState) => {
        draft.count = 5;
      });

      stateManager.resetState();

      expect(stateManager.getState()).toEqual(initialState);
    });

    it('should clear history when reset is called', () => {
      stateManager.setState((draft: TestState) => {
        draft.count = 5;
      });

      stateManager.resetState();

      expect(stateManager.canUndo()).toBe(false);
      expect(stateManager.canRedo()).toBe(false);
    });

    it('should notify subscribers when reset is called', () => {
      const subscriber = vi.fn();
      stateManager.subscribe(subscriber);

      stateManager.resetState();

      expect(subscriber).toHaveBeenCalledTimes(1);
    });
  });

  describe('multiple updates', () => {
    it('should handle multiple sequential updates', () => {
      // Simulate batch updates
      stateManager.setState((draft: TestState) => {
        draft.count = 5;
      });

      stateManager.setState((draft: TestState) => {
        draft.text = 'updated';
      });

      expect(stateManager.getState()).toEqual({
        count: 5,
        text: 'updated',
        nested: {
          value: 10,
          items: ['item1', 'item2']
        }
      });

      stateManager.undo();

      // Should undo one update
      expect(stateManager.getState().text).toBe('initial');
      expect(stateManager.getState().count).toBe(5);

      stateManager.undo();

      // Should undo second update
      expect(stateManager.getState()).toEqual(initialState);
    });

    it('should notify subscribers for each update', () => {
      const subscriber = vi.fn();
      stateManager.subscribe(subscriber);

      // Simulate batch updates
      stateManager.setState((draft: TestState) => {
        draft.count = 5;
      });

      stateManager.setState((draft: TestState) => {
        draft.text = 'updated';
      });

      expect(subscriber).toHaveBeenCalledTimes(2);
    });
  });
});