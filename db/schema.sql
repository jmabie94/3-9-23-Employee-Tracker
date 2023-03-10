DROP DATABASE IF EXISTS workforce_db;
CREATE DATABASE workforce_db;

USE workforce_db;

DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS employees;

CREATE TABLE departments (
    dept_id INT AUTO_INCREMENT PRIMARY KEY,
    dept_name VARCHAR(30) NOT NULL
);

CREATE TABLE roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_title VARCHAR(30) NOT NULL,
    role_salary INT NOT NULL,
    dept_id INT,
    FOREIGN KEY (dept_id)
    REFERENCES departments(id)
    ON DELETE CASCADE
);

CREATE TABLE employees (
    emp_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(30) NOT NULL,
    last_name VARCHAR(30) NOT NULL,
    role_id INT NOT NULL,
    FOREIGN KEY (role_id)
    REFERENCES roles(id)
    ON DELETE CASCADE,
    manager_id INT DEFAULT 1,
    FOREIGN KEY (manager_id)
    REFERENCES employees(emp_id)
    ON DELETE CASCADE
);