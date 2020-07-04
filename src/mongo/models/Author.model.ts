import type { AuthorProps, Author as IAuthor } from '../../common/author/Author.models';

import { Schema, model, Document } from 'mongoose';

import { normalize } from '../db';

const authorSchema = new Schema({
    name: String,
    surname: String,
    dateOfBirth: Date,
});

authorSchema.methods.toDTO = function (this: Document) {
    return normalize<AuthorProps>(this.toObject());
};

const Author = model<AuthorType>('Authors', authorSchema);

export interface AuthorType extends Document, AuthorProps {
    toDTO: () => IAuthor;
}

export type AuthorModel = typeof Author;

export default Author;
