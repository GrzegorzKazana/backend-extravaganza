import type { BaseEntity } from 'typeorm';

import DataLoader from 'dataloader';

type Newable<T> = {
    new (): T;
} & typeof BaseEntity;

export const createTypeOrmDataLoader = <E extends BaseEntity>(
    entity: Newable<E>,
    pickId: (a: E) => string,
): DataLoader<string, E> => {
    return new DataLoader<string, E>(async ids => {
        const data = (await entity.findByIds(ids as string[])) as E[];
        const dataById = data.reduce<Record<string, E>>((acc, result) => {
            acc[pickId(result)] = result;

            return acc;
        }, {});

        return ids.map(id => dataById[id]);
    });
};
