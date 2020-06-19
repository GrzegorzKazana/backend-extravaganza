import type { RouteHandler } from '../types';
import type { AuthorRepository, Author } from './Author.models';

export interface AuthorController {
    getAuthor: RouteHandler<{ author: Author }, unknown, { authorId: string }>;
    getAllAuthors: RouteHandler<{ authors: Author[] }>;
    postAuthor: RouteHandler<{ author: Author }, Author>;
    queryUsersByYear: RouteHandler<
        { authors: Author[] },
        unknown,
        Record<string, string>,
        { year: number }
    >;
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

        postAuthor: ({ body: author }, res, next) =>
            authorRepository
                .save(author)
                .then(author => res.json({ author }))
                .catch(next),

        queryUsersByYear: ({ query: { year } }, res, next) =>
            authorRepository
                .getAuthorsFromYear(year)
                .then(authors => res.json({ authors }))
                .catch(next),
    };
}
