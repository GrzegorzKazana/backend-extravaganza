import { Request, Response } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { compose, Next, RequestHandler } from 'compose-middleware';

import { head, mapObj } from './utils';
import { PayloadGuardError } from './errors';

export const createPayloadGuards = mapObj(payloadGuard);
export const createRouteIgnore = mapObj(ignoreRouteIfPayloadIsNotMatching);

// eslint-disable-next-line
type LooselyTypedRequest = Request<Record<string, string>, any, unknown, any>;

export function payloadGuard(
    validators: ValidationChain[],
): RequestHandler<LooselyTypedRequest, Response> {
    return compose<Request, Response>(
        ...validators,
        (req: Request, res: Response, next: Next<void>) => {
            const errors = validationResult(req);

            if (errors.isEmpty()) {
                next();
            } else {
                const errorsArray = errors.array();
                const errorDescriptions = errorsArray.map(err => ({
                    [err.param]: err.msg as string,
                }));
                const errorMap = Object.assign({}, ...errorDescriptions) as Record<string, string>;
                const errorMessage = (head(errorsArray)?.msg as string) || 'Failed to parse input';

                next(new PayloadGuardError(errorMessage, errorMap));
            }
        },
    );
}

export function ignoreRouteIfPayloadIsNotMatching(
    validators: ValidationChain[],
): RequestHandler<LooselyTypedRequest, Response> {
    return compose<Request, Response>(
        ...validators,
        (req: Request, res: Response, next: Next<void>) => {
            const errors = validationResult(req);

            if (errors.isEmpty()) {
                next();
            } else {
                // see the `deferToNext` feature of express Router
                // https://expressjs.com/en/guide/using-middleware.html#middleware.router
                // eslint-disable-next-line
                next('route' as any);
            }
        },
    );
}
