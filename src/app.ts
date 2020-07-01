import type { Server } from 'http';

import express, { Router } from 'express';
import bodyParser from 'body-parser';

import { serverErrorMiddleware } from './common/errors';

import createAuthorRouter from './common/author/Author.router';
import createAuthorController from './common/author/Author.controller';

import createBookRouter from './common/book/Book.router';
import createBookController from './common/book/Book.controller';

import initDb from './config/database';

import * as InMem from './inmemory';
import * as SQLite from './sqlite';
import { BookRepository } from './common/book/Book.models';
import { AuthorRepository } from './common/author/Author.models';

export default class App {
    public app = express();

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

    private async createRepositories() {
        const db = await initDb();

        return {
            inmem: { book: new InMem.BookRepo(), author: new InMem.AuthorRepo() },
            sqlite: {
                book: await new SQLite.BookRepo(db).init(),
                author: await new SQLite.AuthorRepo(db).init(),
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

        return Router().use('/inmemory', immemoryRouter).use('/sqlite', sqliteRouter);
    }
}
