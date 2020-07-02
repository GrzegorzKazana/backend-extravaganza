import type Knex from 'knex';
import type {
    AuthorRepository as IAuthorRepository,
    Author,
    AuthorProps,
    AuthorDb,
} from '../common/author/Author.models';

import { ServerError } from '../common/errors';

export default class AuthorRepository implements IAuthorRepository {
    private Authors = () => this.knex<AuthorDb>();

    constructor(private knex: Knex) {}

    public async init(): Promise<AuthorRepository> {
        await this.knex.schema.createTable('Authors', table => {
            table.uuid('id').primary();
            table.text('name').notNullable();
            table.text('surname').notNullable();
            table.integer('dateOfBirth').notNullable();
        });

        return this;
    }

    public async getById(authorId: string): Promise<Author> {
        const author = await this.Authors().select().where('id', authorId).first();

        if (!author) throw new ServerError('Author not found', 404);

        return AuthorRepository.hydateAuthor(author);
    }

    public async exists(authorId: string): Promise<boolean> {
        const author = await this.getById(authorId);

        return !!author;
    }

    public async save(author: AuthorProps): Promise<Author> {
        const newAuthor = await this.Authors()
            .insert({ ...author, dateOfBirth: author.dateOfBirth.getTime() })
            .returning('*')
            .first();

        // assuming that insertion succeds -> row is returned
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return AuthorRepository.hydateAuthor(newAuthor!);
    }

    public async delete(authorId: string): Promise<Author> {
        const author = await this.Authors().where('id', authorId).delete().returning('*').first();

        if (!author) throw new ServerError('Author not found', 404);

        return AuthorRepository.hydateAuthor(author);
    }

    public async update(
        authorId: string,
        { dateOfBirth, ...restAuthor }: Partial<AuthorProps>,
    ): Promise<Author> {
        const convertedAuthor = dateOfBirth
            ? { ...restAuthor, dateOfBirth: dateOfBirth.getTime() }
            : restAuthor;

        const newAuthor = await this.Authors()
            .update(convertedAuthor)
            .where('id', authorId)
            .returning('*')
            .first();
        if (!newAuthor) throw new ServerError('Author not found', 404);

        return AuthorRepository.hydateAuthor(newAuthor);
    }

    public async getAllAuthors(): Promise<Author[]> {
        const authors = await this.Authors().select();

        return authors.map(author => AuthorRepository.hydateAuthor(author));
    }

    public async getAuthorsFromYear(year: number): Promise<Author[]> {
        const dateStart = new Date(year, 0, 1).getTime();
        const dateEnd = new Date(year + 1, 0, 1).getTime();
        const authors = await this.Authors()
            .select()
            .whereBetween('dateOfBirth', [dateStart, dateEnd]);

        return authors.map(author => AuthorRepository.hydateAuthor(author));
    }

    private static hydateAuthor(author: AuthorDb): Author {
        return {
            ...author,
            dateOfBirth: new Date(author.dateOfBirth),
        };
    }
}
