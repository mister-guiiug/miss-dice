import { describe, expect, it, vi } from 'vitest';
import { createStore } from './createStore';

describe('createStore', () => {
  it('expose l’état initial et le met à jour', () => {
    const store = createStore<number>(0);
    expect(store.get()).toBe(0);
    store.set(5);
    expect(store.get()).toBe(5);
  });

  it('notifie les abonnés au changement', () => {
    const store = createStore({ n: 1 });
    const listener = vi.fn();
    store.subscribe(listener);
    store.set({ n: 2 });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(store.get()).toEqual({ n: 2 });
  });

  it('ignore une affectation identique (Object.is) sans notifier ni persister', () => {
    const persist = vi.fn();
    const same = { n: 1 };
    const store = createStore(same, persist);
    const listener = vi.fn();
    store.subscribe(listener);
    store.set(same); // même référence
    expect(listener).not.toHaveBeenCalled();
    expect(persist).not.toHaveBeenCalled();
  });

  it('appelle le persist à chaque vrai changement', () => {
    const persist = vi.fn();
    const store = createStore<number>(0, persist);
    store.set(1);
    store.set(2);
    expect(persist).toHaveBeenCalledTimes(2);
    expect(persist).toHaveBeenLastCalledWith(2);
  });

  it('cesse de notifier après désabonnement', () => {
    const store = createStore<number>(0);
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);
    store.set(1);
    unsubscribe();
    store.set(2);
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
