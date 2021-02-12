class Department {
  // constructor(id, name) {
  //   this.id = id;
  //   this.name = name;
  // }
  
  constructor() {
    this.id = '';
    this.name = '';
  }
}

class Role {
  // constructor(id, title, salary, departmentID) {
  //   this.id = id;
  //   this.title = title;
  //   this.salary = salary;
  //   this.departmentID = departmentID;
  // }  

  constructor() {
    this.id = '';
    this.title = '';
    this.salary = '';
    this.departmentID = '';
  }
}

class Employee {
  // constructor(id, firstName, lastName, roleID, managerID) {
  //   this.id = id;
  //   this.firstName = firstName;
  //   this.lastName = lastName;
  //   this.roleID = roleID;
  //   this.managerID = managerID;
  // }
    
  constructor() {
    this.id = '';
    this.firstName = '';
    this.lastName = '';
    this.roleID = '';
    this.managerID = '';
  }
}

module.exports = { Department, Role, Employee };