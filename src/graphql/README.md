# backend-extravaganza

## GraphQL

Similar to **Database management** module contains express app for managing `Book` and `Authors` using different graphql tooling and approaches. Each submodule exposes a graphql schema which is used on coresponding endpoint. All graphql endpoints are tested.

[Tests](https://github.com/GrzegorzKazana/backend-extravaganza/blob/master/src/graphql/__test__/app.test.ts)

### Tools

-   code-first approach
-   schema-first approach using `graphql-code-generator` for resolver types
-   schema-first + `mongo` + `DataLoader` for solving `n+1` problem
-   `type-graphql` + `mongo` + `DataLoader`
-   `type-graphql` + `typeORM` + `DataLoader`
