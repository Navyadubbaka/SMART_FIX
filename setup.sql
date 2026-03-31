-- ============================================================
--  SmartFix - Complete Database Setup
--  Run this file ONCE in MySQL to create all required tables
-- ============================================================

CREATE DATABASE IF NOT EXISTS smartfix;
USE smartfix;

-- ============================================================
--  USERS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(15),
  address VARCHAR(255),
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'technician', 'admin') NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
--  TECHNICIANS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS technicians (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(15),
  category VARCHAR(50) NOT NULL DEFAULT 'General',
  status ENUM('Available', 'Busy') DEFAULT 'Available',
  address VARCHAR(255),
  skills VARCHAR(500),
  availability ENUM('Available', 'Busy') DEFAULT 'Available',
  experience VARCHAR(50),
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_ratings INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================
--  COMPLAINTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  issue TEXT,
  category VARCHAR(50),
  image VARCHAR(255),
  technician_id INT,
  status ENUM('Pending', 'Resolved') DEFAULT 'Pending',
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (technician_id) REFERENCES technicians(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- ============================================================
--  SAMPLE TECHNICIANS (Optional — uncomment to seed data)
-- ============================================================

-- INSERT INTO users (name, email, phone, address, password, role) VALUES
-- ('Ravi Sharma', 'ravi@tech.com', '9848012345', 'Ameerpet, Hyderabad', '$2b$10$dummyhash', 'technician'),
-- ('Suresh Babu', 'suresh@tech.com', '9849023456', 'Kukatpally, Hyderabad', '$2b$10$dummyhash', 'technician'),
-- ('Praveen Reddy', 'praveen@tech.com', '9866034567', 'Banjara Hills, Hyderabad', '$2b$10$dummyhash', 'technician');

-- INSERT INTO technicians (user_id, name, phone, category, status, address, skills, availability, experience, rating, total_ratings) VALUES
-- (LAST_INSERT_ID()-2, 'Ravi Sharma', '9848012345', 'Plumbing', 'Available', 'Ameerpet, Hyderabad', 'Plumbing,Drainage,Leak', 'Available', '3-5 years', 4.50, 10),
-- (LAST_INSERT_ID()-1, 'Suresh Babu', '9849023456', 'Electrical', 'Available', 'Kukatpally, Hyderabad', 'Electrical,AC,Inverter', 'Available', '5-10 years', 4.20, 8),
-- (LAST_INSERT_ID(), 'Praveen Reddy', '9866034567', 'AC', 'Available', 'Banjara Hills, Hyderabad', 'AC,Refrigerator,Geyser', 'Available', '1-2 years', 3.80, 5);


-- ============================================================
--  VERIFICATION QUERIES
-- ============================================================
-- SELECT COUNT(*) AS total_users FROM users;
-- SELECT COUNT(*) AS total_technicians FROM technicians;
-- SELECT COUNT(*) AS total_complaints FROM complaints;
-- DESCRIBE users;
-- DESCRIBE technicians;
-- DESCRIBE complaints;
