[![Build Status](https://semaphoreci.com/api/v1/thecodingpoet/document-management-system-6/branches/chore-142496267-integrate-houndci/shields_badge.svg)](https://semaphoreci.com/thecodingpoet/document-management-system-6) [![Coverage Status](https://coveralls.io/repos/github/andela-oduyile/Document-Management-System/badge.svg)](https://coveralls.io/github/andela-oduyile/Document-Management-System) [![Code Climate](https://codeclimate.com/github/andela-oduyile/Document-Management-System/badges/gpa.svg)](https://codeclimate.com/github/andela-oduyile/Document-Management-System)

# Document-Management-System

This is a system (API) that manages documents with users and user roles. Each document defines access rights; the document defines which roles can access it. Also, each document specifies the date it was published. It is built with NodeJS, Express and Postgres as it's database.
Source code employs ES6 syntax traspiled down to ES5 using Babel.

#### Key Application Features
A created user will have a role: admin, regular.
- Regular, rated/restricted Users can:
    - Create an account
    - Login
    - Create a document
    - Limit access to a document by specifying an access group `i.e. public, private or role`.
    - View public documents created by other users.
    - View documents created by their access group with access level set as `role`.
    - Edit already created documents.
    - View `public` and `role` access level documents of other regular users.
    - Logout.

- In addition to the general user functions, an admin user can:
    - View all users.
    - View all created documents.
    - Delete any user.
    - Update any user's records.
    - Create a new role.
    - View all created roles.
    - Delete created roles aside the default roles `admin` and `regular`

**Documents**:
Documents can be created and must have:
- title
- content
- access; set by default to public but can be any of `private, public or role`


**Authentication**:
Users are authenticated and validated using JSON web token (JWT).
By generating a token on registration and login, API endpoints and documents are protected from unauthorised access.
Requests to protected routes are validated using the generated token.

## Development
This application was developed using [NodeJs](https://nodejs.org) with express for routing. Postgres was used for persisting data with [Sequelize](https://sequelizejs.org) as [ORM](https://en.wikipedia.org/wiki/Object-relational_mapping).

The frontend was built with the [react](https://facebook.github.io/react/) and [redux](reduxjs.org) framework.

### Installation
---

- Clone the project repository.
- Run git clone https://github.com/andela-oduyile/Document-Management-System.
- Change directory into the Document-Management-System directory.
- Run npm install to install the dependencies in the package.json file.
- Use Postman or any API testing tool of your choice to access the endpoints.

## Usage
- Run DB migrate commmand with `sequelize db:migrate`.
- Run DB seeder command with `sequelize db:seed` to seed initial data into your DB.
- Start the app with `$ npm start`
- Login, Sign Up and start creating Documents once the app opens up on the browser

### Testing with Postman
---

You can read the Documentation [here](https://document-man.herokuapp.com/doc) and test out the routes on postman


## Endpoints
Here's the collection of routes. They can be checked out on Postman
[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/89b63da4a2a0c98485e7)

#### Users
EndPoint                      |   Functionality
------------------------------|------------------------
POST /users/login         |   Logs in a user.
POST /users/logout        |   Logs out a user.
POST /users/              |   Creates a new user.
GET /users/               |   Gets all users (available to only the Admin).
GET /users/:id           |   Finds user by id.
PUT /users/:id           |   Updates a user's attributes based on the id specified (available to only the SuperAdmin and Admin)
DELETE /users/:id        |   Deletes user (available only to the Admin)
GET /users/:id/documents   | Gets all documents for a particular user

#### Documents
EndPoint                      |   Functionality
------------------------------|------------------------
POST /documents/          |   Creates a new document instance.
GET /documents/           |   Gets all documents.
GET /documents/:id       |   Find document by id.
PUT /documents/:id       |   Updates a document attributes.
DELETE /documents/:id    |   Delete document.
GET search/documents/?q=${query} | Get all documents with title containing the search query

#### Roles
EndPoint                      |   Functionality
------------------------------|------------------------
GET /roles/               |   Get all Roles.
POST /roles/               |   Create a Role.
PUT /roles/:id               |   Edit a Role.
DELETE /roles/:id               |   Delete a Role.

It should be noted that the endpoints for roles here are only available to the Admin.

#### Contributing
---

1. Fork this repositry to your account.
2. Clone your repositry: git clone https://github.com/andela-oduyile/Document-Management-System
3. Create your feature branch: git checkout -b new-feature
4. Commit your changes: git commit -m "did something"
5. Push to the remote branch: git push origin new-feature
6. Open a pull request.

#### Limitations
---

1. User cannot upload profile pictures
2. Only plain text is supported

#### Licence
MIT

Copyright (c) 2017 Duyile Oluwatomi John