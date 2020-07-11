import type { Server } from 'http';

import express, { Router } from 'express';
import bodyParser from 'body-parser';
import { graphqlHTTP } from 'express-graphql';

import { serverErrorMiddleware } from '@/common/errors';

import * as sch from './schema-first';
import * as cdf from './code-first';
import * as mongoGql from './graphql-mongo';
import * as typeGql from './type-graphql-mongo';
import * as typeGqlOrm from './type-gql-orm';

export default class App {
    public app = express();

    // required for proper teardown, e.g. in tests
    private teardownCallbacks: Array<() => Promise<void>> = [];

    constructor(private port: number = 400) {}

    public async init(): Promise<App> {
        const router = await this.createRouter();

        this.app.use(bodyParser.json());
        this.app.use('/', router);
        this.app.use(serverErrorMiddleware);

        return this;
    }

    public listen(): Promise<Server> {
        return new Promise(resolve => this.app.listen(this.port, resolve));
    }

    public teardown(): Promise<void[]> {
        return Promise.all(this.teardownCallbacks.map(cb => cb()));
    }

    private async createRouter(): Promise<Router> {
        const mongo = await mongoGql.initMongo();
        const typeOrm = await typeGqlOrm.initTypeOrm();

        this.teardownCallbacks.push(() => mongo.stop());
        this.teardownCallbacks.push(() => typeOrm.close());

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
            )
            .use(
                '/type-gql',
                graphqlHTTP({
                    schema: typeGql.default,
                    graphiql: true,
                    context: { Books: typeGql.Book, Authors: typeGql.Author },
                }),
            )
            .use(
                '/type-gql-orm',
                graphqlHTTP({
                    schema: typeGqlOrm.default,
                    graphiql: true,
                }),
            );
    }
}
