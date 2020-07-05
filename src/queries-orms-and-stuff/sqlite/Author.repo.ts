import type { Database } from 'sqlite';
import type {
    AuthorRepository as IAuthorRepository,
    Author,
    AuthorProps,
    AuthorDb,
} from '../common/author/Author.models';

import { v4 as uuid } from 'uuid';
import SQL from 'sql-template-strings';

import { ServerError } from '@/common/errors';

export default class AuthorRepository implements IAuthorRepository {
    constructor(private db: Database) {}

    public async init(): Promise<AuthorRepository> {
        await this.db.exec(SQL`CREATE TABLE Authors (
            id TEXT NOT NULL PRIMARY KEY,
            name TEXT NOT NULL,
            surname TEXT NOT NULL,
            dateOfBirth int NOT NULL
        )`);

        return this;
    }

    public async getById(authorId: string): Promise<Author> {
        const author = await this.db.get<AuthorDb>(
            SQL`SELECT * FROM Authors WHERE id = ${authorId}`,
        );

        if (!author) throw new ServerError('Author not found', 404);

        return AuthorRepository.hydateAuthorDb(author);
    }

    public async exists(authorId: string): Promise<boolean> {
        const author = await this.db.get<AuthorDb>(
            SQL`SELECT * FROM Authors WHERE id = ${authorId}`,
        );

        return !!author;
    }

    public async save(author: AuthorProps): Promise<Author> {
        const newAuthor = AuthorRepository.convertAuthor({ ...author, id: uuid() });

        await this.db.run(SQL`INSERT INTO Authors (id, name, surname, dateOfBirth) VALUES (
            ${newAuthor.id},
            ${newAuthor.name},
            ${newAuthor.surname},
            ${newAuthor.dateOfBirth}
        )`);

        return AuthorRepository.hydateAuthorDb(newAuthor);
    }

    public async delete(authorId: string): Promise<Author> {
        const author = await this.getById(authorId);

        if (!author) throw new ServerError('Author not found', 404);

        await this.db.run(SQL`DELETE FROM Authors WHERE id = ${authorId}`);

        return author;
    }

    public async update(authorId: string, newAuthorData: Partial<AuthorProps>): Promise<Author> {
        const author = await this.getById(authorId);

        if (!author) throw new ServerError('Author not found', 404);

        const newAuthor = AuthorRepository.convertAuthor({
            ...author,
            ...newAuthorData,
            id: author.id,
        });

        await this.db.run(SQL`UPDATE Authors
            SET name = ${newAuthor.name},
                surname = ${newAuthor.surname},
                dateOfBirth = ${newAuthor.dateOfBirth}
            WHERE id = ${newAuthor.id}`);

        return AuthorRepository.hydateAuthorDb(newAuthor);
    }

    public async getAllAuthors(): Promise<Author[]> {
        const authors = await this.db.all<AuthorDb[]>(SQL`SELECT * FROM Authors`);

        return authors.map(AuthorRepository.hydateAuthorDb);
    }

    public async getAuthorsFromYear(year: number): Promise<Author[]> {
        const dateStart = new Date(year, 0, 1).getTime();
        const dateEnd = new Date(year + 1, 0, 1).getTime();
        const authors = await this.db.all<AuthorDb[]>(
            SQL`SELECT * FROM Authors WHERE dateOfBirth > ${dateStart} AND dateOfBirth < ${dateEnd}`,
        );

        return authors.map(AuthorRepository.hydateAuthorDb);
    }

    private static hydateAuthorDb(author: AuthorDb): Author {
        return {
            ...author,
            dateOfBirth: new Date(author.dateOfBirth),
        };
    }

    private static convertAuthor(author: Author): AuthorDb {
        return {
            ...author,
            dateOfBirth: author.dateOfBirth.getTime(),
        };
    }
}
