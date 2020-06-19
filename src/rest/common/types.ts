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

export interface Repository<T, Id = string> {
    getById(id: Id): Promise<T>;
    exists(dto: T): Promise<boolean>;
    save(dto: T): Promise<T>;
    delete(id: Id): Promise<T>;
}
