# Employee Tracker
## **Description**

Program that allows user to view, add, and update employee data into an organized database from command line prompts. User can access and manipulate database within their own project using [lowdb](https://github.com/typicode/lowdb) functionality.

Uses [lowdb](https://github.com/typicode/lowdb), [inquirer](https://github.com/SBoudrias/Inquirer.js) and [chalk](https://github.com/chalk/chalk).
## **Install**

```shell
npm install employee-tracker
```
## **Usage**

Run command-line interface.
```shell
npm explore employee-tracker -- npm start
```

Access database using **lowdb**.
```js
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db/employee_db.json');
const db = low(adapter);
```
```js
// Return a list of employee objects
db.get('employees')
  .value();
```
```js
// Return the role with an id of 2
db.get('roles')
  .find({ id: 2 })
  .value();
```
**Not recommended to write to database using lowdb functions because of id incrementing.**

## **[Tutorial Video](https://youtu.be/)**
