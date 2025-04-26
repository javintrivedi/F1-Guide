-- MySQL database schema for beginners_guide_to_f1

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(255) DEFAULT NULL
);

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
    driver_id INT PRIMARY KEY,
    driver_name VARCHAR(100) NOT NULL,
    carNo INT NOT NULL,
    no_of_races INT NOT NULL,
    team_id VARCHAR(50) NOT NULL
);

-- Sample data for users
INSERT INTO users (username, email, password) VALUES
('admin', 'admin@example.com', '$2b$12$KIXQ1v1vQ6Q6Q6Q6Q6Q6QO6Q6Q6Q6Q6Q6Q6Q6Q6Q6Q6Q6Q6Q6Q6Q6Q6'); -- bcrypt hash placeholder

-- Sample data for drivers
INSERT INTO drivers (driver_id, driver_name, carNo, no_of_races, team_id) VALUES
(44, 'Lewis Hamilton', 44, 270, 'Mercedes'),
(33, 'Max Verstappen', 33, 150, 'Red Bull'),
(5, 'Sebastian Vettel', 5, 250, 'Aston Martin');
