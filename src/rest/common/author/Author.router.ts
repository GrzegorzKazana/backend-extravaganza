import type { AuthorController } from './Author.controller';

import { Router, NextFunction } from 'express';
import { body, param, query } from 'express-validator';

import { createPayloadGuards, createRouteIgnore } from '../guards';

const validators = createPayloadGuards({
    getAuthor: [param('authorId').isString()],
    postAuthor: [
        body('name').isString(),
        body('surname').isString(),
        body('dateOfBirth').isISO8601().toDate(),
    ],
});

const ignore = createRouteIgnore({
    ifNoYearQuery: [query('year').isNumeric().toInt()],
});

export default function createAuthorRouter(controller: AuthorController): Router {
    return Router()
        .get('/:authorId', validators.getAuthor, controller.getAuthor)
        .get('/', ignore.ifNoYearQuery, controller.queryUsersByYear)
        .get('/', controller.getAllAuthors)
        .post('/', validators.postAuthor, controller.postAuthor);
}
