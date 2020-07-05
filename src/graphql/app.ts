import type { Server } from 'http';

import express, { Router } from 'express';
import bodyParser from 'body-parser';

import { serverErrorMiddleware } from '@/common/errors';

export default class App {
    public app = express();

    constructor(private port: number = 400) {
        this.app.use(bodyParser.json());
        this.app.use('/', this.createRouter());
        this.app.use(serverErrorMiddleware);
    }

    public listen(): Promise<Server> {
        return new Promise(resolve => this.app.listen(this.port, resolve));
    }

    private createRouter(): Router {
        return Router();
    }
}
