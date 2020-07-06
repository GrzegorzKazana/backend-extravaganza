import type {
    AuthorRepository as IAuthorRepository,
    Author,
    AuthorProps,
} from '../common/author/Author.models';

import { v4 as uuid } from 'uuid';

import { ServerError } from '@/common/errors';

export default class AuthorRepository implements IAuthorRepository {
    private authors: Map<string, Author> = new Map<string, Author>();

    public getById(authorId: string): Promise<Author> {
        const author = this.authors.get(authorId);

        return author
            ? Promise.resolve(author)
            : Promise.reject(new ServerError('Author not found', 404));
    }

    public exists(authorId: string): Promise<boolean> {
        return Promise.resolve(!!this.authors.get(authorId));
    }

    public save(author: AuthorProps): Promise<Author> {
        const newAuthor = { ...author, id: uuid() };

        this.authors.set(newAuthor.id, newAuthor);

        return Promise.resolve(newAuthor);
    }

    public delete(authorId: string): Promise<Author> {
        const author = this.authors.get(authorId);

        if (!author) return Promise.reject(new ServerError('Author not found', 404));

        this.authors.delete(authorId);

        return Promise.resolve(author);
    }

    public update(authorId: string, newAuthorData: Partial<AuthorProps>): Promise<Author> {
        const author = this.authors.get(authorId);

        if (!author) return Promise.reject(new ServerError('Author not found', 404));

        const newAuthor = { ...author, ...newAuthorData, id: author.id };

        this.authors.set(author.id, newAuthor);

        return Promise.resolve(newAuthor);
    }

    public getAllAuthors(): Promise<Author[]> {
        return Promise.resolve([...this.authors.values()]);
    }

    public getAuthorsFromYear(year: number): Promise<Author[]> {
        const authors = [...this.authors.values()];
        const authorsFromYear = authors.filter(
            ({ dateOfBirth }) => dateOfBirth.getFullYear() === year,
        );

        return Promise.resolve(authorsFromYear);
    }
}
