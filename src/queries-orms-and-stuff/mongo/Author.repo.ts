import type {
    AuthorRepository as IAuthorRepository,
    Author,
    AuthorProps,
} from '../common/author/Author.models';

import { ServerError } from '@/common/errors';

import { AuthorModel } from './models/Author.model';

export default class AuthorRepository implements IAuthorRepository {
    constructor(private Authors: AuthorModel) {}

    public async getById(authorId: string): Promise<Author> {
        const author = await this.Authors.findById(authorId);

        if (!author) throw new ServerError('Author not found', 404);

        return author.toDTO();
    }

    public async exists(authorId: string): Promise<boolean> {
        const author = await this.Authors.findById(authorId);

        return !!author;
    }

    public async save(author: AuthorProps): Promise<Author> {
        const newAuthor = await new this.Authors(author).save();

        return newAuthor.toDTO();
    }

    public async delete(authorId: string): Promise<Author> {
        const deletedAuthor = await this.Authors.findByIdAndDelete(authorId);

        if (!deletedAuthor) throw new ServerError('Author not found', 404);

        return deletedAuthor.toDTO();
    }

    public async update(authorId: string, authorData: Partial<AuthorProps>): Promise<Author> {
        const updatedAuthor = await this.Authors.findByIdAndUpdate(authorId, authorData, {
            new: true,
        });

        if (!updatedAuthor) throw new ServerError('Author not found', 404);

        return updatedAuthor.toDTO();
    }

    public async getAllAuthors(): Promise<Author[]> {
        const authors = await this.Authors.find();

        return authors.map(author => author.toDTO());
    }

    public async getAuthorsFromYear(year: number): Promise<Author[]> {
        const dateStart = new Date(year, 0, 1);
        const dateEnd = new Date(year + 1, 0, 1);
        const authors = await this.Authors.find({ dateOfBirth: { $gte: dateStart, $lt: dateEnd } });

        return authors.map(author => author.toDTO());
    }
}
