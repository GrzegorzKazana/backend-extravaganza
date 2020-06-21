import type { BookController } from './Book.controller';

import { Router } from 'express';
import { body, param, query } from 'express-validator';

import { createPayloadGuards, createRouteIgnore } from '../guards';
import { BookGenres, BookGenreRegex } from './Book.models';

const validators = createPayloadGuards({
    getBookById: [param('bookId').isString()],
    postBook: [
        body('title').isString(),
        body('author').isString(),
        body('genre').isIn(Object.values(BookGenres)),
    ],
});

const ignore = createRouteIgnore({
    ifNoAuthorQuery: [query('authorId').isString()],
    ifNoGenreQuery: [query('genre').matches(BookGenreRegex)],
    ifNoPaginationQuery: [query('from').isInt().toInt(), query('count').isInt().toInt()],
});

export default function createAuthorRouter(controller: BookController): Router {
    return Router()
        .get('/:bookId', validators.getBookById, controller.getBook)
        .get('/', ignore.ifNoAuthorQuery, controller.queryBooksByAuthor)
        .get('/', ignore.ifNoGenreQuery, controller.queryBooksByGenre)
        .get('/', ignore.ifNoPaginationQuery, controller.queryPaginatedBooks)
        .get('/', controller.getAllBooks)
        .post('/', validators.postBook, controller.postBook);
}
