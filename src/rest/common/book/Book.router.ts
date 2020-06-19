import type { BookController } from './Book.controller';

import { Router } from 'express';
import { body, param, query } from 'express-validator';

const validators = {};

export default function createAuthorRouter(controller: BookController): Router {
    return Router();
}
