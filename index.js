import { Effect, State } from "rubedo";

// TODO! fix desync between localStateCache localStringStateCache trackCache on the same key

/** @type {Map<string, WeakRef<State<any>>>} */
const localStateCache = new Map();

/** @type {Map<string, WeakRef<State<string | null>>>} */
const localStringStateCache = new Map();

/** @type {Map<string, WeakRef<object>>} */
const trackCache = new Map();

export function LocalState(key, initialValue) {
    if (!new.target) throw new TypeError("Constructor LocalState requires 'new'");
    if (new.target != LocalState) throw new TypeError("Cannot extend LocalState");
    if (typeof key != "string") throw new TypeError("key must be a string");
    let state = localStateCache.get(key);
    if (state) state = state.deref();
    if (!state) {
        const storedJSON = localStorage.getItem(key);
        try {
            if (storedJSON) {
                state = new State(storedJSON);
            } else if (storedJSON == "") {
                state = new State(undefined);
            }
        } catch (error) {
            console.warn(`Error deserializing localStorage key "${key}":`, error);
        }
        if (!state) state = new State(initialValue === undefined ? undefined : JSON.parse(JSON.stringify(initialValue)));
        localStateCache.set(key, state);
        new Effect(state, () => {
            const value = state();
            localStorage.setItem(key, value === undefined ? "" : JSON.stringify(value));
        });
    }
    return state;
}

export function LocalStringState(key, initialValue) {
    if (!new.target) throw new TypeError("Constructor LocalStringState requires 'new'");
    if (new.target != LocalStringState) throw new TypeError("Cannot extend LocalStringState");
    if (typeof key != "string") throw new TypeError("key must be a string");
    if (typeof initialValue != "string" && initialValue != null) throw new TypeError("initialValue must be a string or null");
    let state = localStringStateCache.get(key);
    if (state) state = state.deref();
    if (state) return state;
    const storedValue = localStorage.getItem(key);
    state = new State(storedValue == null ? initialValue : storedValue);
    localStringStateCache.set(key, state);
    new Effect(state, () => {
        const value = state();
        if (value == null) {
            localStorage.removeItem(key);
        } else {
            localStorage.setItem(key, value);
        }
    });
    return state;
}

Object.defineProperty(LocalState, "track", {
    value: track, writable: true, enumerable: true
});

function track(key, initialValue) {
    if (typeof key != "string") throw new TypeError("key must be a string");
    if (typeof initialValue != "object") throw new TypeError("initialValue must be an object or an array");
    let tracked = trackCache.get(key);
    if (tracked) tracked = tracked.deref();
    if (tracked) return tracked;
    const storedJSON = localStorage.getItem(key);
    try {
        if (storedJSON) {
            tracked = State.track(JSON.parse(storedJSON));
        }
    } catch (error) {
        console.warn(`Error deserializing localStorage key "${key}":`, error);
    }
    if (!tracked) tracked = State.track(JSON.parse(JSON.stringify(initialValue)));
    new Effect(tracked, () => {
        localStorage.setItem(key, JSON.stringify(tracked));
    });
    return tracked;
}
