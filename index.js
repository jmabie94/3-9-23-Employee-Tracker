const mysql = require('mysql2');
const inquirer = require('inquirer');
const { resolve } = require('path');

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
    console.log('Welcome To Your Employee Tracker');
    setTimeout(() => {
        createWorkforce();
    }, 1000);
};

function createWorkforce() {
    inquirer.prompt([{
        type: "list",
        message: "What would you like to do?",
        name: "firstChoicePrompt",
        choices: [
            "View All Departments", 
            "View All Roles", 
            "View All Employees", 
            "View All Employees By Department",
            "View All Employees By Manager",
            "Add A Department", 
            "Add A Role", 
            "Add An Employee", 
            "Update An Employee Role",
            "Update An Employee Manager", 
            "Done For Now"],
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
            case "View All Employees By Department":
                viewEbyD();
                break;
            case "View All Employes By Manager":
                viewEbyM();
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
            case "Update An Employee Manager":
                updateManager();
                break;
            case "Done For Now":
                console.log('Awesome! Whenever you want to add more, just run index.js again!');
                endProgram();
                break;

            default:
                console.log('An error has occured, please try again');
                endProgram();
        }
    });
};

// reformatting everything
function viewDepartments() {
    const sql = `SELECT dept_id AS id, dept_name AS name FROM departments`;
    db.query(sql, (err, res) => {
        if (err) {
            console.log(err.message);
        }
        console.log(res);
        setTimeout(() => {
            createWorkforce();
        }, 1000);
    });
};

// reformatting everything, specifying with LEFT JOINs
function viewRoles() {
    const sql = `
    SELECT role_id AS id, role_title AS title, dept_name AS department, role_salary AS salary 
    FROM roles
    LEFT JOIN departments 
    ON roles.department_id = departments.id`;
    db.query(sql, (err, res) => {
        if (err) {
            console.log(err.message);
        }
        console.log(res);
        setTimeout(() => {
            createWorkforce();
        }, 1000);
    });
};

// reformatting everything, hyper-specifying
function viewEmployees() {
    const sql = `
    SELECT e.emp_id as id, concat(e.first_name, ' ', e.last_name) AS employee, e.role_title AS title, e.role_salary AS salary, e.dept_name AS department,
    CASE WHEN e.manager_id = e.emp_id 
    THEN concat('N/A') 
    ELSE concat(m.first_name, ' ', m.last_name) 
    END AS manager
    FROM (SELECT * FROM employees 
    LEFT JOIN roles ON employees.role_id = roles.role_id 
    LEFT JOIN departments ON roles.dept_name = departments.dept_id) 
    AS e, employees m WHERE m.emp_id = e.manager_id`;
    db.query(sql, (err, res) => {
        if (err) {
            console.log(err.message);
        }
        console.log(res);
        setTimeout(() => {
            createWorkforce();
        }, 1000);
    });
};

// a ViewEbyD (employee by department) functionality, using getDepartments from the addRole() function and hyper specific sql statement
function viewEbyD() {
    // copy viewEmployee functionality, narrow by department, use inquirer prompt to select the department to narrow with
    const getDepartments = new Promise((resolve, reject) => {
        // doing a promise so that user can select from existing departments rather than having to manually enter the department name each time
        var deptArr = [];
        const sql = `SELECT dept_name FROM departments`;
        db.query(sql, (err, res) => {
            if (err) {
                console.log(err.message);
            }
            for (var i = 0; i < res.length; i++) {
                deptArr.push(Object.values(res[i])[0]);
            }
            resolve(deptArr);
        });
    });

    getDepartments.then((deptArr) => {
        inquirer.prompt([
            {
                type: "list",
                name: "deptId",
                message: "Which department would you like to view?",
                choices: deptArr,
                filter: (deptIdInput) => {
                    if (deptIdInput) {
                        return deptArr.indexOf(deptIdInput);
                    }
                }
            },
        ]).then(({ deptId }) => {
            const sql = `
            SELECT e.emp_id as id, concat(e.first_name, ' ', e.last_name) AS employee, e.role_title AS title, e.role_salary AS salary, e.dept_name AS department,
            CASE WHEN e.manager_id = e.emp_id THEN concat('N/A')
            ELSE concat(m.first_name, ' ', m.last_name)
            END AS manager
            FROM (SELECT * FROM employees LEFT JOIN roles ON employees.role_id = roles.role_id LEFT JOIN departments ON roles.dept_id = departments.dept_id) AS e, employees m
            WHERE m.emp_id = e.manager_id
            AND dept_id = ?`;
            const query = [deptId+1];
            db.query(sql, query, (err, res) => {
                if (err) {
                    console.log(err.message);
                }
                console.log(res);
                setTimeout(() => {
                    createWorkforce();
                }, 1000);
            });
        });
    });
};

// add a ViewEbyM (employee by manager) functionality, cloning viewEbyD()
function viewEbyM() {
    const getActiveManagers = new Promise((resolve, reject) => {
        var activeManagArr = [];
        const sql = `
        SELECT DISTINCT concat(m.first_name, ' ', m.last_name) AS manager 
        FROM employees e, employees m 
        WHERE m.emp_id = e.manager_id`;
        db.query(sql, (err, res) => {
            if (err) {
                console.log(err.message);
            }
            for (var i = 0; i < res.length; i++) {
                activeManagArr.push(Object.values(res[i])[0]);
            }
            resolve(activeManagArr);
        });
    });

    Promise.all([getActiveManagers]).then(([activeManagArr]) => {
        inquirer.prompt([
            {
                type: "list",
                name: "managerId",
                message: "Choose a manager whose employees to view",
                choices: activeManagArr,
                filter: (managerIdInput) => {
                    if (managerIdInput) {
                        return activeManagArr.indexOf(managerIdInput);
                    }
                },
            },
        ]).then(({ managerId }) => {
            const sql = `
            SELECT e.emp_id AS id, concat(e.first_name, ' ', e.last_name) AS employee, e.role_title, e.role_salary AS salary, e.dept_name AS department,
            CASE WHEN e.manager_id = e.emp_id THEN concat('N/A') ELSE concat(m.first_name, ' ', m.last_name) END AS manager
            FROM (SELECT * FROM employees LEFT JOIN employees ON employees.manager_id = employees.emp_id LEFT JOIN roles ON employees.role_id = roles.role_id LEFT JOIN departments ON roles.dept_id = departments.dept_id) AS e, employees m
            WHERE m.emp_id = e.manager_id
            AND manager_id = ?`;
            const query = [managerId];
            db.query(sql, query, (err, res) => {
                if (err) {
                    console.log(err.message);
                }
                console.log(res);
                setTimeout(() => {
                    createWorkforce();
                }, 1000);
            });
        });
    });
};

// add a ViewBbyD (budget by department) functionality, cloning viewEbyD()

// reformatting everything, nesting secondary prompt to allow user to directly view the departments table they've just added something to
function addDepartment() {
    inquirer.prompt([{
        type: "input",
        name: "departmentName",
        message: "What is the name of the Department?",
    }]).then(answers => {
        const sql = "INSERT INTO departments (dept_name) VALUES (?)";
        const query = [answers.departmentName];
        db.query(sql, query, (err, res) => {
            if (err) {
                console.log(err.message);
            }
            console.log(res.affectedRows + " new Department added!\n");
            inquirer.prompt([{
                type: "confirm",
                name: "viewResults",
                message: "Would you like to see the added Department?"
            }]).then(({ viewResults }) => {
                if (viewResults) {
                    viewDepartments();
                } else {
                    createWorkforce();
                }
            });
        });
    });
};

// reformatting everything, nesting secondary prompt to allow user to directly view the roles table they've just added something to
function addRole() {
    const getDepartments = new Promise((resolve, reject) => {
        // doing a promise so that user can select from existing departments rather than having to manually enter the department name each time
        var deptArr = [];
        const sql = `SELECT dept_name FROM departments`;
        db.query(sql, (err, res) => {
            if (err) {
                console.log(err.message);
            }
            for (var i = 0; i < res.length; i++) {
                deptArr.push(Object.values(res[i])[0]);
            }
            resolve(deptArr);
        });
    });

    getDepartments.then((deptArr) => {
        inquirer.prompt([
            {
                type: "list",
                name: "deptId",
                message: "What department is this role within?",
                choices: deptArr,
                // selecting the department from a flexible list, returning based on matching id
                filter: (deptIdInput) => {
                    if (deptIdInput) {
                        return deptArr.indexOf(deptIdInput)
                    }
                },
            },
            {
                type: "input",
                name: "roleTitle",
                message: "What is the title of the role?",
                // making sure they enter a role title
                validate: (roleTitleInput) => {
                    if (roleTitleInput) {
                        return true;
                    } else {
                        console.log("Please enter a role title!");
                        return false;
                    }
                },
            },
            {
                type: "number",
                name: "roleSalary",
                message: "What is the salary of this role?",
                // making sure the salary entered is a number
                validate: (roleSalaryInput) => {
                    if (!roleSalaryInput || roleSalaryInput === NaN) {
                        console.log("Please enter a valid salary for this role! (Plain Numbers Only)");
                        return false;
                    } else {
                        return true;
                    }
                },
                filter: (roleSalaryInput) => {
                    if (!roleSalaryInput || roleSalaryInput === NaN) {
                        return "";
                    } else {
                        return roleSalaryInput;
                    }
                },
            },
        ]).then(({ deptId, roleTitle, roleSalary }) => {
            const sql = `
            INSERT INTO roles (dept_id, role_title, role_salary) 
            VALUES (?,?,?)`;
            const query = [deptId + 1, roleTitle, roleSalary];
            db.query(sql, query, (err, res) => {
                if (err) {
                    console.log(err.message);
                }
                console.log(res.affectedRows + " new Role added!\n");
                inquirer.prompt([{
                    type: "confirm",
                    name: "viewResults",
                    message: "Would you like to see the added Role?"
                }]).then(({ viewResults }) => {
                    if (viewResults) {
                        viewRoles();
                    } else {
                        createWorkforce();
                    }
                });
            });
        });
    });
};

// reformatting everything, nesting secondary prompt to allow user to directly view the employees table they've just added something to
function addEmployee() {
    // doing a promise so that user can select from existing roles
    const getTitles = new Promise((resolve, reject) => {
        var titleArr = [];
        const sql = `SELECT role_title FROM roles`;
        db.query(sql, (err, res) => {
            if (err) {
                console.log(err.message);
            }
            for (var i = 0; i < res.length; i++) {
                titleArr.push(Object.values(res[i])[0]);
            }
            resolve(titleArr);
        });
    });

    // doing a promise so that user can select the new employee's manager and have it accurately show based on that manager's employee ID
    const getActiveManagers = new Promise((resolve, reject) => {
        var activeManagArr = [];
        const sql = `
        SELECT DISTINCT concat(m.first_name, ' ', m.last_name) AS manager 
        FROM employees e, employees m 
        WHERE m.emp_id = e.manager_id`;
        db.query(sql, (err, res) => {
            if (err) {
                console.log(err.message);
            }
            for (var i = 0; i < res.length; i++) {
                activeManagArr.push(Object.values(res[i])[0]);
            }
            activeManagArr.push("Show More");
            resolve(activeManagArr);
        });
    });

    // extending the manager promise to provide additional options
    const getManagers = new Promise((resolve, reject) => {
        var managArr = [];
        const sql = `
        SELECT concat(m.first_name, ' ', m.last_name) AS manager 
        FROM employees m`;
        db.query(sql, (err, res) => {
            if (err) {
                console.log(err.message);
            }
            for (var i = 0; i < res.length; i++) {
                managArr.push(Object.values(res[1])[0]);
            }
            managArr.push("Employee does not have a manager");
            resolve(managArr);
        });
    });

    // doing a promise so that the user's chosen manager can link to their ID
    const getManagerId = new Promise((resolve, reject) => {
        var managArrId = [];
        const sql = `
        SELECT DISTINCT m.emp_id AS manager 
        FROM employees e, employees m 
        WHERE m.emp_id = e.manager_id`;
        db.query(sql, (err, res) => {
            if (err) {
                console.log(err.message);
            }
            for (var i = 0; i < res.length; i++) {
                managArrId.push(Object.values(res[i])[0]);
            }
            resolve(managArrId);
        });
    });

    Promise.all([getTitles, getActiveManagers, getManagers, getManagerId]).then(([titleArr, activeManagArr, managArr, managArrId]) => {
        inquirer.prompt([
            {
                type: "text",
                name: "firstName",
                message: "What is the employee's first name?",
                validate: (firstNameInput) => {
                    if (firstNameInput) {
                        return true;
                    } else {
                        console.log("Please enter a first name!");
                        return false;
                    }
                },
            },
            {
                type: "text",
                name: "lastName",
                message: "What is the employee's last name?",
                validate: (lastNameInput) => {
                    if (lastNameInput) {
                        return true;
                    } else {
                        console.log("Please enter a last name!");
                        return false;
                    }
                },
            },
            {
                type: "list",
                name: "roleId",
                message: "What role does the new employee perform?",
                choices: titleArr,
                filter: (roleIdInput) => {
                    if (roleIdInput) {
                        return titleArr.indexOf(roleIdInput) + 1;
                    }
                },
            },
            {
                type: "list",
                name: "managerId",
                message: "Who is this employee's manager?",
                choices: activeManagArr,
                filter: (managerIdInput) => {
                    if (managerIdInput === "Show More") {
                        return managerIdInput;
                    } else {
                        return activeManagArr.indexOf(managerIdInput);
                    }
                },
            },
            {
                type: "list",
                name: "managerId2",
                message: "Who is this employee's manager?",
                choices: managArr,
                filter: (managerId2Input) => {
                    if (managerId2Input === "Employee does not have a manager") {
                        return managerId2Input;
                    } else {
                        return managArr.indexOf(managerId2Input) + 1;
                    }
                },
                when: ({ managerIdInput }) => {
                    if (isNaN(managerIdInput) === true) {
                        return true;
                    } else {
                        return false;
                    }
                },
            },
        ]).then(({ firstName, lastName, roleId, managerId, managerId2 }) => {
            const getManagerId = () => {
                if (isNaN(managerId)) {
                    if(isNaN(managerId2)) {
                        managArr.push(firstName + ' ' + lastName);
                        return managArr.indexOf(firstName + ' ' + lastName);
                    } else {
                        return managerId2;
                    }
                } else {
                    return managArrId[managerId];
                };
            }
            const managersId = getManagerId();
            const sql = `
            INSERT INTO employees (first_name, last_name, role_id, manager_id)
            VALUES (?,?,?,?)`;
            const query = [
                firstName,
                lastName,
                roleId,
                managersId
            ];
            db.query(sql, query, (err, res) => {
                if (err) {
                    console.log(err.message);
                } 
                console.log(res.affectedRows + " new Employee added!\n");
                inquirer.prompt([{
                    type: "confirm",
                    name: "viewResults",
                    message: "Would you like to see the added Employee?"
                }]).then(({ viewResults }) => {
                    if (viewResults) {
                        viewEmployees();
                    } else {
                        createWorkforce();
                    }
                });
            });
        });
    });
};

function updateEmployee() {
    const getTitles = new Promise((resolve, reject) => {
        var titleArr = [];
        const sql = `SELECT role_title FROM roles`;
        db.query(sql, (err, res) => {
            if (err) {
                console.log(err.message);
            }
            for (var i = 0; i < res.length; i++) {
                titleArr.push(Object.values(res[i])[0]);
            }
            resolve(titleArr);
        });
    });

    const getEmployees = new Promise((resolve, reject) => {
        var empArr = [];
        const sql = `
        SELECT first_name, last_name 
        FROM employees`;
        db.query(sql, (err, res) => {
            if (err) {
                console.log(err.message);
            }
            for (var i = 0; i < res.length; i++) {
                empArr.push(Object.values(res[i])[0] + " " + Object.values(res[i])[1]);
            }
            resolve(empArr);
        });
    });

    Promise.all([getTitles, getEmployees]).then(([titleArr, empArr]) => {
        inquirer.prompt([
            {
                type: "list",
                name: "employeeName",
                message: "Which employee needs updating?",
                choices: empArr,
                filter: (employeeNameInput) => {
                    if (employeeNameInput) {
                        return empArr.indexOf(employeeNameInput);
                    }
                },
            },
            {
                type: "list",
                name: "employeeRole",
                message: "Select employee's new role!",
                choices: titleArr,
                filter: (employeeRoleInput) => {
                    if (employeeRoleInput) {
                        return titleArr.indexOf(employeeRoleInput);
                    }
                },
            },
        ]).then(({ employeeName, employeeRole }) => {
            const sql = "UPDATE employees SET role_id = ? WHERE emp_id = ?";
            const query = [employeeRole + 1, employeeName + 1];
            db.query(sql, query, (err, res) => {
                if (err) {
                    console.log(err.message);
                }
                console.log(res.affectedRows + " Employee updated!\n");
                inquirer.prompt([{
                    type: "confirm",
                    name: "viewResults",
                    message: "Would you like to see the updated Employee?"
                }]).then(({ viewResults }) => {
                    if (viewResults) {
                        viewEmployees();
                    } else {
                        createWorkforce();
                    }
                });
            });
        });
    });
};

function updateManager() {
    // add functionality to update Employee's manager
    // copy the managerId process from addEmployee
    // copy the getEmployees promise from updateEmployee
    // use the promise.all format from updateEmployee, target manager same format as in addEmployee
}

// add functions to delete departments, roles and employees!!!

function endProgram() {
    console.log("Thank you for using the Employee Tracker!");
    setTimeout(() => {
        console.log("See You Next Time");
    }, 1000);
    setTimeout(() => {
        process.exit(1);
    }, 1000);
};

init();