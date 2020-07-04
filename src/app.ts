import type { Server } from 'http';

import express, { Router } from 'express';
import bodyParser from 'body-parser';

import { serverErrorMiddleware } from './common/errors';

import createAuthorRouter from './common/author/Author.router';
import createAuthorController from './common/author/Author.controller';

import createBookRouter from './common/book/Book.router';
import createBookController from './common/book/Book.controller';

import * as InMem from './inmemory';
import * as SQLite from './sqlite';
import * as Knx from './knex';
import * as TypeORM from './typeorm';
import * as Mongo from './mongo';

import { BookRepository } from './common/book/Book.models';
import { AuthorRepository } from './common/author/Author.models';

export default class App {
    public app = express();

    // required for proper teardown, e.g. in tests
    private teardownCallbacks: Array<() => Promise<void>> = [];

    constructor(private port: number = 400) {}

    public async init(): Promise<App> {
        const repos = await this.createRepositories();

        this.app.use(bodyParser.json());
        this.app.use('/', this.createRouter(repos));
        this.app.use(serverErrorMiddleware);

        return this;
    }

    public listen(): Promise<Server> {
        return new Promise(resolve => this.app.listen(this.port, resolve));
    }

    public teardown(): Promise<void[]> {
        return Promise.all(this.teardownCallbacks.map(cb => cb()));
    }

    private async createRepositories() {
        const db = await SQLite.initDb();
        const knex = Knx.initKnex();
        const typeOrm = await TypeORM.initTypeOrm();
        const mongo = await Mongo.initMongo();

        this.teardownCallbacks.push(() => knex.destroy());
        this.teardownCallbacks.push(() => typeOrm.close());
        this.teardownCallbacks.push(() => mongo.stop());

        return {
            inmem: { book: new InMem.BookRepo(), author: new InMem.AuthorRepo() },
            sqlite: {
                book: await new SQLite.BookRepo(db).init(),
                author: await new SQLite.AuthorRepo(db).init(),
            },
            knex: {
                book: await new Knx.BookRepo(knex).init(),
                author: await new Knx.AuthorRepo(knex).init(),
            },
            typeorm: {
                book: new TypeORM.BookRepo(typeOrm),
                author: new TypeORM.AuthorRepo(typeOrm),
            },
            mongo: {
                book: new Mongo.BookRepo(Mongo.Book),
                author: new Mongo.AuthorRepo(Mongo.Author),
            },
        };
    }

    private createRouter(
        repos: Record<string, { book: BookRepository; author: AuthorRepository }>,
    ): Router {
        const immemoryRouter = Router()
            .use('/book', createBookRouter(createBookController(repos.inmem.book)))
            .use('/author', createAuthorRouter(createAuthorController(repos.inmem.author)));

        const sqliteRouter = Router()
            .use('/book', createBookRouter(createBookController(repos.sqlite.book)))
            .use('/author', createAuthorRouter(createAuthorController(repos.sqlite.author)));

        const knexRouter = Router()
            .use('/book', createBookRouter(createBookController(repos.knex.book)))
            .use('/author', createAuthorRouter(createAuthorController(repos.knex.author)));

        const typeormRouter = Router()
            .use('/book', createBookRouter(createBookController(repos.typeorm.book)))
            .use('/author', createAuthorRouter(createAuthorController(repos.typeorm.author)));

        const mongoRouter = Router()
            .use('/book', createBookRouter(createBookController(repos.mongo.book)))
            .use('/author', createAuthorRouter(createAuthorController(repos.mongo.author)));

        return Router()
            .use('/inmemory', immemoryRouter)
            .use('/sqlite', sqliteRouter)
            .use('/knex', knexRouter)
            .use('/typeorm', typeormRouter)
            .use('/mongo', mongoRouter);
    }
}
