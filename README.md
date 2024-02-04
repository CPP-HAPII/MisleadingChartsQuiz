To setup:

MacOS:

```
brew install mysql
brew install node
npm install mysql
npm install express
npm install dotenv
brew services start mysql
mysql_secure_installation
```

follow instructions to set a password


SET UP .ENV
Create .env file to store your MySQL credentials:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=mydb
```

run createDatabase.js to connect to MySQL and create database

```
node createDatabase.js
```

if "Error connecting to MySQL: Error: ER_NOT_SUPPORTED_AUTH_MODE: Client does not support authentication protocol requested by server; consider upgrading MySQL client" run command below to troubleshoot

```
mysql -u root -p //then enter password as prompted
mysql> ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'YourPassword';
mysql> exit;
```

```
node createDatabase.js
node createTables.js
node server.js
```

In browser, type localhost:3000/index.html

WINDOWS:
install MySQL installer https://dev.mysql.com/downloads/installer/
follow prompts to install MySQL Workbench and Server

install Node.js https://nodejs.org/en/ download "Recommended For Most Users" version

add .env file

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=mydb
```

if error "sqlMessage: 'Client does not support authentication protocol requested by server; consider upgrading MySQL client'", execute in MySQL Workbench to troubleshoot:

```
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'yourpassword';
flush privileges;
```

in PowerShell

```
node createDatabase.js
node createTables.js
node server.js
```

In browser, type localhost:3000/index.html
