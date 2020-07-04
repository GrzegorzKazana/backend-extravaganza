import type { Repository } from 'typeorm';
import type {
    AuthorRepository as IAuthorRepository,
    Author,
    AuthorProps,
} from '../common/author/Author.models';

import { v4 as uuid } from 'uuid';

import AuthorModel from './Author.model';
import { ServerError } from '../common/errors';

export default class AuthorRepository implements IAuthorRepository {
    constructor(private Authors: Repository<AuthorModel>) {}

    public async getById(authorId: string): Promise<Author> {
        const author = await this.Authors.findOne(authorId);

        if (!author) throw new ServerError('Author not found', 404);

        return author.toDTO();
    }

    public async exists(authorId: string): Promise<boolean> {
        const author = await this.getById(authorId);

        return !!author;
    }

    public async save(author: AuthorProps): Promise<Author> {
        const newAuthor = new AuthorModel({ ...author, id: uuid() });

        await this.Authors.insert(newAuthor);

        return newAuthor.toDTO();
    }

    public delete(authorId: string): Promise<Author> {
        return this.Authors.delete(authorId).then(() => this.getById(authorId));
    }

    public async update(
        authorId: string,
        { dateOfBirth, ...restAuthor }: Partial<AuthorProps>,
    ): Promise<Author> {
        const convertedAuthor = dateOfBirth
            ? { ...restAuthor, dateOfBirth: dateOfBirth.getTime() }
            : restAuthor;

        const newAuthor = await this.Authors.update(authorId, convertedAuthor).then(() =>
            this.getById(authorId),
        );

        return newAuthor;
    }

    public async getAllAuthors(): Promise<Author[]> {
        const authors = await this.Authors.find();

        return authors.map(author => author.toDTO());
    }

    public async getAuthorsFromYear(year: number): Promise<Author[]> {
        const dateStart = new Date(year, 0, 1).getTime();
        const dateEnd = new Date(year + 1, 0, 1).getTime();
        const authors = await this.Authors.createQueryBuilder()
            .where('dateOfBirth > :dateStart')
            .andWhere('dateOfBirth < :dateEnd')
            .setParameters({ dateStart, dateEnd })
            .getMany();

        return authors.map(author => author.toDTO());
    }
}
