# Northcoders News API

This is a RESTful API developed using Node.js and the Express web framework.
There is a live, hosted version of the API which can be found at:

https://broken-news.onrender.com

The purpose of this project is to provide an interface to a backend
SQL database designed to support a typical news site and is concerned with
managing user accounts, articles and comments.
Typical functionality includes listing articles, finding how many comments
a particular article elicited, adding comments to articles and managing user
vote counts for both articles and comments.

The SQL database used is PostgreSQL, though there should be minimal use of
proprietary features that differ from standard SQL.

To work with this repository you will first need to clone it on your local
machine using a command such as:

git clone https://github.com/SeanHoldsworth/nc-news.git

You will then need to initialise the project and developer package dependencies
using npm:

npm init -y

You will then need to add two files which have been
intentionally added to the .gitignore file. These are *.env.test* and
*.env.development*. There is an existing (hidden) file called .env.example
that shows the format used. These files specify the names of the PostgreSQL
databases used to hold test and development data respectively. They must
agree with the names of the databases as found in file db/setup.sql.

.env.test:  
PGDATABASE=\<database\>.test

.env.development:  
PGDATABASE=\<database\>

To initialise and seed the databases run the following commands:

* npm run setup-dbs
* npm run seed

Once this has been done you can check that everything has been installed and
initialised correctly by running the included Jest tests with the command:

* npm test

This code was developed on Node v21.6.1 and PostgreSQL 14.11. To check which
version of these you have installed, run the following:

* node --version
* pg_config --version

The versions of other software components used can be found by inspecting the
top level package.json file.