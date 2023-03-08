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
        }]).then(function (userInput) {
            switch(userInput.firstChoicePrompt) {
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
};

// function to add Employee if that is User selection
/* function addEmployee() {
    inquirer.prompt([
      {
        name: "employeeName",
        message: "What is the new employees name?",
        type: "input"
      }
    ])
    .then(answers => {
      connection.query(
        "INSERT INTO employees SET ?",
        {
          name: answers.employeeName
        },
        function(err, res) {
          console.log(res.affectedRows + " employee inserted!\n");
        }
      );
    })
  } */
  