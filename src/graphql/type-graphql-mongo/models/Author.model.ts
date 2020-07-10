import type { AuthorProps, Author as IAuthor } from '../../common/types';

import { Schema, model, Document } from 'mongoose';

import { normalize } from '@/common/MockMongoServer';

const authorSchema = new Schema({
    name: String,
    surname: String,
    dateOfBirth: Date,
});

authorSchema.methods.toDTO = function (this: Document) {
    return normalize<AuthorProps>(this.toObject());
};

const Author = model<AuthorType>('Author', authorSchema);

export interface AuthorType extends Document, AuthorProps {
    readonly id: string;
    toDTO: () => IAuthor;
}

export type AuthorModel = typeof Author;

export default Author;
