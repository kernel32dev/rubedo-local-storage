import { State } from "rubedo";

/** creates a state persisted in localStorage, serialized as JSON
 *
 * if the value is already present, then when created, the state will contain the stored value and not the initial one
 *
 * if the value stored cannot be deserialized, the initialValue is used instead
 *
 * undefined is serialized and deserialized as an empty string
 */
export const LocalState: {
    new <T>(key: string, initialValue: T): State<T>;
    /** creates a state persisted in localStorage, serialized as JSON, but only loads values that pass a filter
     *
     * this allows you to ensure the value being loaded conforms to some structures
     * 
     * TODO! implement
     */
    filtered<T>(key: string, initialValue: T, filter: (value: unknown) => value is T): State<T>;
    /** TODO! implement */
    transformed<T>(key: string, initialValue: T, transform: (value: unknown) => T): State<T>;
    /** creates a tracked object or array persisted in localStorage, serialized as JSON */
    track<T extends object>(key: string, initialValue: T): T;
}

/** creates a state persisted in localStorage, without any serialization */
export const LocalStringState: {
    new(key: string, initialValue: string | null): State<string | null>;
    new(key: string, initialValue: string): State<string>;
}