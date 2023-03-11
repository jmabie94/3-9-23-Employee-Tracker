DROP DATABASE IF EXISTS workforce_db;
CREATE DATABASE workforce_db;

USE workforce_db;

DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS employees;

CREATE TABLE departments (
    d_id INT AUTO_INCREMENT PRIMARY KEY,
    dept_name VARCHAR(40) NOT NULL
);

CREATE TABLE roles (
    r_id INT AUTO_INCREMENT PRIMARY KEY,
    role_title VARCHAR(50) NOT NULL,
    role_salary DECIMAL(9,2) NOT NULL,
    dept_id INT,
    FOREIGN KEY (dept_id)
    REFERENCES departments(d_id)
    ON DELETE CASCADE
);

CREATE TABLE employees (
    emp_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT NOT NULL,
    FOREIGN KEY (role_id)
    REFERENCES roles(r_id)
    ON DELETE CASCADE,
    manager_id INT,
    FOREIGN KEY (manager_id)
    REFERENCES employees(emp_id)
    ON DELETE CASCADE
);

/* SELECT e.emp_id AS id, concat(e.first_name, ' ', e.last_name) AS employee, e.role_title AS title, e.role_salary AS salary, e.dept_name AS department, CASE WHEN e.manager_id = e.emp_id THEN concat('N/A') ELSE concat(m.first_name, ' ', m.last_name) END AS manager FROM (SELECT * FROM employees LEFT JOIN roles ON employees.role_id = roles.r_id LEFT JOIN departments ON roles.dept_id = departments.d_id) AS e, employees m WHERE m.emp_id = e.manager_id; */