import type { Request, Response, NextFunction } from 'express';

export type RouteHandler<
    ResBody = unknown,
    ReqBody = unknown,
    Params extends Record<string, string> = Record<string, string>,
    Query = Record<string, undefined | string | string[]>
> = (
    req: Request<Params, ResBody, ReqBody, Query>,
    res: Response<ResBody>,
    next: NextFunction,
) => void;

export interface Repository<T, O = T, Id = string> {
    getById(id: Id): Promise<O>;
    exists(id: Id): Promise<boolean>;
    save(dto: T): Promise<O>;
    delete(id: Id): Promise<O>;
    update(id: Id, dto: Partial<T>): Promise<O>;
}
