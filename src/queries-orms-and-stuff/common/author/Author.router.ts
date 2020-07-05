import type { AuthorController } from './Author.controller';

import { Router } from 'express';
import { body, param, query } from 'express-validator';

import { createPayloadGuards, createRouteIgnore } from '../guards';

const validators = createPayloadGuards({
    getAuthor: [param('authorId').isString()],
    postAuthor: [
        body('name').isString(),
        body('surname').isString(),
        body('dateOfBirth').isISO8601().toDate(),
    ],
    patchAuthor: [
        param('authorId').isString(),
        body('name').isString().optional(),
        body('surname').isString().optional(),
        body('dateOfBirth').isISO8601().toDate().optional(),
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
        .post('/', validators.postAuthor, controller.postAuthor)
        .patch('/:authorId', validators.patchAuthor, controller.updateAuthor);
}
