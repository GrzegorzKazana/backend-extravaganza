export default `
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
        genre: String!
        author: Author!
    }

    type Query {
        author(id: ID!): Author
        authors: [Author]
        book(id: ID!): Book
        books: [Book]
    }

    type Mutation {
        createBook(title: String!, genre: String!, author: ID!): Book
        createAuthor(name: String!, surname: String!, dateOfBirth: String!): Author
    }
`;
