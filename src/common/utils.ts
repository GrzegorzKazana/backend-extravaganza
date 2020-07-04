export const mapSecond = <I, O>(fn: (a: I) => O) => <A>([a, b]: [A, I]): [A, O] => [a, fn(b)];

export const entries = <T extends Record<string, unknown>>(obj: T): Array<[keyof T, T[keyof T]]> =>
    Object.entries(obj) as Array<[keyof T, T[keyof T]]>;

export const fromEntries = <K extends string, V>(entries: Array<[K, V]>): Record<K, V> =>
    entries.reduce((acc, [key, val]) => {
        acc[key] = val;
        return acc;
    }, {} as Record<K, V>);

export const mapObj = <I, O>(fn: (a: I) => O) => <K extends string>(
    obj: Record<K, I>,
): Record<K, O> => fromEntries(entries(obj).map(mapSecond(fn)));

export const head = <T>(arr: T[]): T | undefined => arr[0];

export const isPaginationValid = (from: number, to: number): boolean =>
    from >= 0 && to >= 0 && to > from;

export const isNil = (a: unknown): a is null | undefined => a === null || a === undefined;
