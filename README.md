# Northcoders News API

To work with this repository you will need to add two files which have been
intentionally added to the .gitignore file. These are *.env.test* and
*.env.development*. There is an existing (hidden) file called .env.example
that shows the format used. Thse files specify the names of the Postgres
databases used to hold test and development data respectively. They must
agree with the names of the databases as found in file db/setup.sql.

.env.test:  
PGDATABASE=\<database\>.test

.env.development:  
PGDATABASE=\<database\>

To initialise and seed the databases run the following commands once npm
has been initialised with 'npm init -q' if necessary.

* npm run setup-dbs
* npm run seed

