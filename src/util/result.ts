export type Result<T, E = Error> =
    | { data: T; error: null }
    | { data: null; error: E };

export function asError(err: unknown): Error {
    if (err instanceof Error) {
        return err;
    }

    return new Error(String(err));
}
