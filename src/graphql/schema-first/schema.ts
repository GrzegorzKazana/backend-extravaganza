export default `
    enum BookGenre {
        SCIFI
        NOVEL
        HORROR
        FANTASY
    }

    type Author {
        id: ID!
        name: String!
        surname: String!
        dateOfBirth: String!
        books: [Book!]!
    }

    type Book {
        id: ID!
        title: String!
        genre: BookGenre!
        author: Author!
    }

    type Query {
        author(id: ID!): Author
        authors: [Author]
        authorsByYear(year: Int!): [Author]
        book(id: ID!): Book
        books: [Book]
        booksByGenre(genre: BookGenre!): [Book]
    }

    type Mutation {
        createBook(title: String!, genre: BookGenre!, author: ID!): Book
        createAuthor(name: String!, surname: String!, dateOfBirth: String!): Author
    }
`;
