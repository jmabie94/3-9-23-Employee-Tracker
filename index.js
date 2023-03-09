const mysql = require('mysql2');
const inquirer = require('inquirer');

const db = mysql.createConnection(
    {
      host: 'localhost',
      user: 'root',
      password: 's4f6h8k1a#x7R01',
      database: 'workforce_db'
    },
    console.log(`Connected to the workforce_db database.`)
);

function init() {
    function createWorkforce() {
        inquirer.prompt([{
            type: "list",
            message: "What would you like to do?",
            name: "firstChoicePrompt",
            choices: ["View All Departments", "View All Roles", "View All Employees", "Add A Department", "Add A Role", "Add An Employee", "Update An Employee Role"]
        }]).then(function (answers) {
            switch(answers.firstChoicePrompt) {
                case "View All Departments":
                    viewDepartments();
                    break;
                case "View All Roles":
                    viewRoles();
                    break;
                case "View All Employees":
                    viewEmployees();
                    break;
                case "Add A Department":
                    addDepartment();
                    break;
                case "Add A Role":
                    addRole();
                    break;
                case "Add An Employee":
                    addEmployee();
                    break;
                case "Update An Employee Role":
                    updateEmployee();
                    break;
                
                default:
                    console.log('An error has occured, please try again');
            }
        });
    };
    function viewDepartments() {
        db.query('SELECT * FROM departments', function (err, results) {
            console.log(results);
        });
    };
    function viewRoles() {
        db.query('SELECT * FROM roles', function (err, results) {
            console.log(results);
        });
    };
    function viewEmployees() {
        db.query('SELECT * FROM employees', function (err, results) {
            console.log(results);
        });
    };
    function addDepartment() {
        inquirer.prompt([{
            type: "input",
            name: "departmentName",
            message: "What is the name of the Department?",
        }]).then(answers => {
            db.query('INSERT INTO departments SET ?',
                {
                    name: answers.departmentName
                },
                function(err, res) {
                    console.log(res.affectedRows + " new department added!\n");
                }
            );
        });
    };
    function addRole() {
        inquirer.prompt([
            {
                type: "input",
                name: "roleTitle",
                message: "What is the title of the new role?",
            },
            {
                type: "input",
                name: "roleSalary",
                message: "What is the salary of this role?",
            },
            {
                type: "input",
                name: "roleDepartment",
                message: "Under what Department does this new role fall?",
            },
        ]).then(answers => {
            db.query('INSERT INTO roles SET ?',
                {
                    title: answers.roleTitle,
                    salary: answers.roleSalary
                    // need to use DEPARTMENT NAME to find DEPARTMENT ID?
                },
                function(err, res) {
                    console.log(res.affectedRows + " new role added!\n");
                }
            );
        });
    };
    function addEmployee() {
        inquirer.prompt([
            {
                type: "input",
                name: "employeeFirstName",
                message: "What is the employee's first name?",
            },
            {
                type: "input",
                name: "employeeLastName",
                message: "What is the employee's last name?",
            },
            {
                type: "input",
                name: "employeeRole",
                message: "What is the new employee's role?",
            },
            {
                type: "input",
                name: "employeeDepartment",
                message: "What Department does the new employee work in?",
            },
        ]).then(answers => {
            db.query('INSERT INTO employees SET ?',
                {
                    first_name: answers.employeeFirstName,
                    last_name: answers.employeeLastName
                    // need to use ROLE NAME to find ROLE ID?
                    // need to use DEPARTMENT NAME to select MANAGER with matching DEPARTMENT ID to find MANAGER ID? 
                },
                function(err, res) {
                    console.log(res.affectedRows + " new employee added!\n");
                }
            );
        });
    };
    function updateEmployee() {
        inquirer.prompt([
            {
                type: "input",
                name: "employeeSelect",
                message: "What is the name of the employee you'd like to update?",
            },
            {
                type: "list",
                name: "employeeChoice",
                message: "What about the employee needs updating?",
                choices: ["First Name", "Last Name", "Role", "Department", "All of the Above"]
            },
        ]).then(function (answers) {
            switch(answers.employeeChoice) {
                case "First Name":
                    updateFirstName();
                    break;
                case "Last Name":
                    updateLastName();
                    break;
                case "Role":
                    updateRole();
                    break;
                case "Department":
                    updateDepartment();
                    break;
                case "All of the Above":
                    updateFirstName();
                    updateLastName();
                    updateRole();
                    updateDepartment();
                    break;

                default:
                    console.log('An error has occured, please try again');
            }
        });
    };
};

init();