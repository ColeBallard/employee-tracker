const { Department, Role, Employee } = require('./proto.js');

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const dbPath = '../../db';
const fs = require('fs');

if (!fs.existsSync(dbPath))
  fs.mkdirSync(dbPath);

fs.open(`${dbPath}/employee_db.json`, error => {
  if (error)
    console.log(chalk.green('Creating directory...'));
});
const db = low(new FileSync(`${dbPath}/employee_db.json`));

const inquirer = require('inquirer');
const chalk = require('chalk');
const prompts = require('./prompts.json');

// Helper Functions

const getByID = (key, id) => {
  key = key.substring(0, key.length - 2);

  if (key === 'manager')
    key = 'employee';

  const value = db.get(`${key}s`)
    .find({ 'id': id })
    .value();

  if (!value)
    return null;

  if (key === 'department')
    return value.name;
  else if (key === 'role')
    return value.title;
  else if (key === 'employee')
    return `${value.firstName} ${value.lastName}`;
  else
    console.log(chalk.red('error in getByID()'));
};

const getByKey = (type, key) => {
  const value = db.get(`${type}s`)
    .find({ 'title': key })
    .value();

  if (!value)
    return null;

  return value;
};

const getIncrement = type => {
  // Add s to end of key
  type += 's';

  const typeArray = db.get(type).value();
  
  if (typeArray.length === 0)
    return 1;
    
  // Add 1 to last id
  return typeArray[typeArray.length - 1].id + 1;
};

const getManagerID = () => {
  const managerRole = db.get('roles')
  .find({ title: 'Manager' })
  .value();

  if (!managerRole)
    return null;
  return managerRole.id;
};

const getKeyList = key => {
  // Add s to end of key
  key += 's';

  let keyList = [];
  
  if (key === 'departments' || key === 'roles') {
    for (let value of db.get(key).value()) {
      if (key === 'departments')
        keyList.push(`[${value.id}] ${value.name}`);
      else if (key === 'roles')
        keyList.push(`[${value.id}] ${value.title}`);
      else {
        console.log(chalk.red('error0 in getKeyList()'));
        return;
      }
    }
  }
  else if (key === 'managers') {
    const managerID = getManagerID();
    if (!managerID)
      return [];
    for (let manager of db.get('employees').filter({roleID: managerID}).value()) 
      keyList.push(`[${manager.id}] ${manager.firstName} ${manager.lastName}`);
  }
  else {
    console.log(chalk.red('error1 in getKeyList()'));
    return;
  }
  
  return keyList;
};

const handleUpdate = async type => {
  let res = await inquirer.prompt(prompts.update[0]);

  let { update } = res;

  let newRole = await updatePrompt(getByID('employeeID', parseInt(update.match(/\[(.*?)\]/)[1])), 'role');

  return [update, newRole];
};

const handleCreateNew = async (key, type) => {
  if (key === 'manager')
    await add(type, 'manager');
  else
    await add(key, 'inner');

  const typeArray = db.get(`${type}s`).value();

  if (typeArray.length === 0)
    console.log(chalk.red('error in addPrompt()'))
    
  // Return last created id of type which should be entry created in add function earlier in .then() function
  return parseInt(typeArray[typeArray.length - 1].id);
};

// Secondary Functions

const updatePrompt = (key, type) => {
  prompts.update[1].message = `New ${type} for ${key}:`;
  prompts.update[1].choices = [];

  const list = db.get(`${type}s`).value();
  if (list.length === 0)
    console.log(chalk.red('Nothing to display.'));
  else {
    for (let line of list)
      prompts.update[1].choices.push(line.title);
  }

  return inquirer
  .prompt(prompts.update[1])
  .then(res => {
    const { update } = res;

    return update;
  })
  .catch(error => {
    if(error.isTtyError) 
      console.log(chalk.red('Prompt couldn\'t be rendered in the current environment'));
    else 
      console.log(chalk.red('error in addPrompt() inquirer'));
  });
};

const addPrompt = (key, type) => {
  if (key === 'id')
    return getIncrement(type);

  prompts.add.message = `Enter ${key}:`;

  // List Prompts
  if (key === 'departmentID' || key === 'roleID' || key === 'managerID') {
    // Cuts ID off from end of string
    key = key.substring(0, key.length - 2);

    prompts.add.type = `list`;
    prompts.add.message = `Select ${key}:`;
    prompts.add.choices = getKeyList(key);

    prompts.add.choices.push(`Enter new ${key}`);

    if (key === 'manager')
      prompts.add.choices.push('none');
  }
  // Input Prompts
  else 
    prompts.add.type = 'input';

  return inquirer
  .prompt(prompts.add)
  .then(res => {
    const { add } = res;

    if (add === `Enter new ${key}`)
      return handleCreateNew(key, type);

    else if (key === 'manager' && add === 'none')
      return null;

    if (key === 'department' || key === 'role' || key === 'manager')
      return parseInt(add.match(/\[(.*?)\]/)[1]);
    else
      return add;
  })
  .catch(error => {
    if(error.isTtyError) 
      console.log(chalk.red('Prompt couldn\'t be rendered in the current environment'));
    else 
      console.log(chalk.red('error in addPrompt() inquirer'));
  });
};

// Main Functions

const update = async type => {
  prompts.update[0].message = `Which ${type} would you like to update?`;
  prompts.update[0].choices = [];

  const list = db.get(`${type}s`).value();
  if (list.length === 0)
    console.log(chalk.red('Nothing to display.'));
  else {
    let lineStr;
    for (let line of list) {
      lineStr = '';
      for (const [key, value] of Object.entries(line)) {
        if (key === 'id')
          lineStr += `[${value}] `;
        else if (key === 'departmentID' || key === 'roleID' || key === 'managerID') {
          if (key === 'managerID')
            lineStr += `(Manager: ${getByID(key, value)}) `;
          else
            lineStr += `${getByID(key, value)} `;
        }
        else 
          lineStr += `${value} `;
      }
        
      prompts.update[0].choices.push(lineStr);
    }
  }

  const info = await handleUpdate(type);

  db.get(`${type}s`)
    .find({ id: parseInt(info[0].match(/\[(.*?)\]/)[1])})
    .assign({ roleID: getByKey('role', info[1]).id })
    .write();

  console.log(chalk.green(`Successfully updated role!`));

  menu();
};

const add = async (type, flag) => {
  let typeObj;
  
  switch (type) {
    case 'employee':
      typeObj = new Employee();
      break;
    case 'role':
      typeObj = new Role();
      break;
    case 'department':
      typeObj = new Department();
      break;
    default:
      console.log(chalk.red('error in add() function'))
      menu();
      break;
  }
  
  let tempObj = {};
  Object.assign(tempObj, typeObj);
  
  for (const [key, value] of Object.entries(tempObj)) {
    if (flag === 'manager' && key === 'roleID')
      typeObj[key] = getManagerID();
    else
      typeObj[key] = await addPrompt(key, type);
  }
    
  db.get(`${type}s`)
    .push(typeObj)
    .write();

  console.log(chalk.green(`Successfully added ${type}!`));

  if (flag != 'manager' && flag != 'inner')
    menu();
};

const displayList = type => { 
  const list = db.get(type).value();
  if (list.length === 0)
    console.log(chalk.red('Nothing to display.'));
  else {
    let lineStr;
    for (let line of list) {
      lineStr = '';
      for (const [key, value] of Object.entries(line)) {
        if (key === 'id')
          lineStr += `[${value}] `;
        else if (key === 'departmentID' || key === 'roleID' || key === 'managerID') {
          if (key === 'managerID')
            lineStr += `(Manager: ${getByID(key, value)}) `;
          else
            lineStr += `${getByID(key, value)} `;
        }
        else 
          lineStr += `${value} `;
      }
        
      console.log(chalk.blue(lineStr));
    }
  }
    
  menu();
};

// Base Functions

const menu = () => {
  inquirer
  .prompt(prompts.main)
  .then(res => {
    const { main } = res;
    switch (main) {
      case prompts.main.choices[0]:
        displayList('employees');
        break;
      case prompts.main.choices[1]:
        displayList('roles');
        break;
      case prompts.main.choices[2]:
        displayList('departments');
        break;
      case prompts.main.choices[3]:
        add('employee', null);
        break;
      case prompts.main.choices[4]:
        add('role', null);
        break;
      case prompts.main.choices[5]:
        add('department', null);
        break;
      case prompts.main.choices[6]:
        update('employee');
        break;
      case prompts.main.choices[7]:
        console.log(chalk.green('Have a nice day!'));
        break;
      default:
        console.log(chalk.red('error in menu()'));
        break;
    }
  })
  .catch(error => {
    if(error.isTtyError) 
      console.log(chalk.red('Prompt couldn\'t be rendered in the current environment'));
    else 
      console.log(chalk.red('error in menu() inquirer'));
  });
};

const initDB = () => {
  db.defaults({ departments: [], roles: [], employees: [] })
  .write();
};

// Initial Function

const init = () => {
  initDB();
  console.log(chalk.green(prompts.welcome));
  menu();
};

init();