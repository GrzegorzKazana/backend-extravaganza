import type { Server } from 'http';

import express, { Router } from 'express';
import bodyParser from 'body-parser';
import { graphqlHTTP } from 'express-graphql';

import { serverErrorMiddleware } from '@/common/errors';

import * as sch from './schema-first';
import * as cdf from './code-first';
import * as mongoGql from './graphql-mongo';

export default class App {
    public app = express();

    // required for proper teardown, e.g. in tests
    private teardownCallbacks: Array<() => Promise<void>> = [];

    constructor(private port: number = 400) {
        this.app.use(bodyParser.json());
        this.app.use('/', this.createRouter());
        this.app.use(serverErrorMiddleware);
    }

    public async init(): Promise<App> {
        const mongo = await mongoGql.initMongo();
        this.teardownCallbacks.push(() => mongo.stop());

        this.app.use(bodyParser.json());
        this.app.use('/', this.createRouter());
        this.app.use(serverErrorMiddleware);

        return this;
    }

    public listen(): Promise<Server> {
        return new Promise(resolve => this.app.listen(this.port, resolve));
    }

    public teardown(): Promise<void[]> {
        return Promise.all(this.teardownCallbacks.map(cb => cb()));
    }

    private createRouter(): Router {
        return Router()
            .use(
                '/schema-first',
                graphqlHTTP({
                    schema: sch.default,
                    graphiql: true,
                    context: { books: {}, authors: {} },
                }),
            )
            .use(
                '/code-first',
                graphqlHTTP({
                    schema: cdf.schema,
                    graphiql: true,
                    context: { books: {}, authors: {} },
                }),
            )
            .use(
                '/mongo-gql',
                graphqlHTTP({
                    schema: mongoGql.default,
                    graphiql: true,
                    context: { Books: mongoGql.Book, Authors: mongoGql.Author },
                }),
            );
    }
}
