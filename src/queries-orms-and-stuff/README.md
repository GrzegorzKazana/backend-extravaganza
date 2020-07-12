# backend-extravaganza

## Database management

Module contains express app for managing `Book` and `Authors` using different db tooling. Each tool was used to implement repositories of common interface. Those repositories are used to serve separate endpoints. All endpoints are tested against reference _in-memory_ _vanilla ts_ implementation.

[Tests](https://github.com/GrzegorzKazana/backend-extravaganza/blob/master/src/queries-orms-and-stuff/__test__/app.test.ts)

### Tools

-   `SQL`
-   `Knex.js` query builder
-   `Mongoose` object document mapping
-   `TypeORM` object relational mapping
