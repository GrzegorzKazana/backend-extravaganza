import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';

import { payloadGuard, ignoreRouteIfPayloadIsNotMatching } from '../guards';

describe('payload route middleware', () => {
    it('calls next with no errors when payload is valid', done => {
        const validators = [body('answer').isInt()];
        const guard = payloadGuard(validators);

        const mockNext = (err?: Error): void => {
            expect(err).toBeUndefined();
            done();
        };

        const request = {
            body: { answer: 42 },
        } as Request;

        guard(request, {} as Response, mockNext as NextFunction);
    });

    it('calls next with error when payload is invalid', done => {
        const validators = [body('answer').isInt()];
        const guard = payloadGuard(validators);

        const mockNext = (err?: Error): void => {
            expect(err).not.toBeUndefined();
            done();
        };

        const request = {
            body: { answer: 'no' },
        } as Request;

        guard(request, {} as Response, mockNext as NextFunction);
    });

    it('calls next with no errors when payload is matching', done => {
        const validators = [body('answer').isInt()];
        const guard = ignoreRouteIfPayloadIsNotMatching(validators);

        const mockNext = (err?: Error): void => {
            expect(err).toBeUndefined();
            done();
        };

        const request = {
            body: { answer: 42 },
        } as Request;

        guard(request, {} as Response, mockNext as NextFunction);
    });

    it('calls next with "router" when payload is invalid', done => {
        const validators = [body('answer').isInt()];
        const guard = ignoreRouteIfPayloadIsNotMatching(validators);

        const mockNext = (err?: Error | string): void => {
            expect(err).toBe('router');
            done();
        };

        const request = {
            body: { answer: 'no' },
        } as Request;

        guard(request, {} as Response, mockNext as NextFunction);
    });
});
