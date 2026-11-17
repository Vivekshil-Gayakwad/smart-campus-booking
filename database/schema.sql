-- ============================================
-- Smart Campus Resource Booking System
-- Main Schema - Tables & Constraints
-- ============================================

CREATE DATABASE IF NOT EXISTS campus_booking;
USE campus_booking;

-- Drop existing tables in correct order (child first)
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS faculty;
DROP TABLE IF EXISTS admins;

-- ============================================
-- 1. Students Table
-- ============================================
CREATE TABLE students (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    branch VARCHAR(50) NOT NULL,
    year_of_study INT NOT NULL CHECK (year_of_study BETWEEN 1 AND 5),
    section VARCHAR(5),
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 2. Faculty Table
-- ============================================
CREATE TABLE faculty (
    faculty_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 3. Admins Table
-- ============================================
CREATE TABLE admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    role VARCHAR(50) DEFAULT 'Admin',
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 4. Resources Table
--    available_for: 'Student', 'Faculty', 'Both'
-- ============================================
CREATE TABLE resources (
    resource_id INT AUTO_INCREMENT PRIMARY KEY,
    resource_name VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    location VARCHAR(100),
    capacity INT,
    available_for ENUM('Student', 'Faculty', 'Both') DEFAULT 'Both',
    is_active TINYINT(1) DEFAULT 1
);

-- ============================================
-- 5. Bookings Table
-- ============================================
CREATE TABLE bookings (
    booking_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    faculty_id INT,
    user_type ENUM('Student', 'Faculty') NOT NULL,
    resource_id INT NOT NULL,
    booking_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    num_attendees INT DEFAULT 1,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    admin_remark VARCHAR(255),
    reviewed_by INT,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id) ON DELETE CASCADE,
    FOREIGN KEY (resource_id) REFERENCES resources(resource_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES admins(admin_id) ON DELETE SET NULL
);

-- ============================================
-- Create Indexes for faster queries
-- ============================================
CREATE INDEX idx_bookings_student ON bookings(student_id);
CREATE INDEX idx_bookings_faculty ON bookings(faculty_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_resources_type ON resources(available_for);
