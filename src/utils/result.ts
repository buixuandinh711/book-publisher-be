export type Ok<T> = { data: T; ok: true };
export const Ok = <T>(data: T): Ok<T> => ({ data, ok: true });

export type Err<E = Error> = { error: E; ok: false };
export const Err = <T>(err: T): Err<T> => ({ error: err, ok: false });

export type Result<T, E> = Ok<T> | Err<E>;