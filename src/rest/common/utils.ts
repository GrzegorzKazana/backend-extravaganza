export const entries = <T extends Record<string, unknown>>(obj: T): Array<[keyof T, T[keyof T]]> =>
    Object.entries(obj) as Array<[keyof T, T[keyof T]]>;

export const fromEntries = <K extends string, V>(entries: Array<[K, V]>): Record<K, V> =>
    entries.reduce((acc, [key, val]) => {
        acc[key] = val;
        return acc;
    }, {} as Record<K, V>);

export const mapObj = <I, O>(fn: (a: I) => O) => <K extends string>(
    obj: Record<K, I>,
): Record<K, O> => fromEntries(entries(obj).map(([key, val]) => [key, fn(val)] as [K, O]));

export const head = <T>(arr: T[]): T | undefined => arr[0];
