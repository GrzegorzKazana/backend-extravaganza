import type { RouteHandler } from '../types';
import type { AuthorRepository, Author, AuthorProps } from './Author.models';

export interface AuthorController {
    getAuthor: RouteHandler<{ author: Author }, unknown, { authorId: string }>;
    getAllAuthors: RouteHandler<{ authors: Author[] }>;
    postAuthor: RouteHandler<{ author: AuthorProps }, Author>;
    queryUsersByYear: RouteHandler<
        { authors: Author[] },
        unknown,
        Record<string, string>,
        { year: number }
    >;
    updateAuthor: RouteHandler<{ author: Author }, Partial<AuthorProps>, { authorId: string }>;
}

export default function createAuthorController(
    authorRepository: AuthorRepository,
): AuthorController {
    return {
        getAuthor: ({ params: { authorId } }, res, next) =>
            authorRepository
                .getById(authorId)
                .then(author => res.json({ author }))
                .catch(next),

        getAllAuthors: (req, res, next) =>
            authorRepository
                .getAllAuthors()
                .then(authors => res.json({ authors }))
                .catch(next),

        postAuthor: ({ body: { name, surname, dateOfBirth } }, res, next) =>
            authorRepository
                .save({ name, surname, dateOfBirth })
                .then(author => res.json({ author }))
                .catch(next),

        queryUsersByYear: ({ query: { year } }, res, next) =>
            authorRepository
                .getAuthorsFromYear(year)
                .then(authors => res.json({ authors }))
                .catch(next),

        updateAuthor: ({ params: { authorId }, body: authorData }, res, next) =>
            authorRepository
                .update(authorId, authorData)
                .then(author => res.json({ author }))
                .catch(next),
    };
}
