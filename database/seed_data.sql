-- ============================================
-- Seed Data - Default Resources & Admin
-- Run AFTER schema.sql
-- ============================================

USE campus_booking;

-- ============================================
-- Insert Resources
-- Student-only: Sports grounds
-- Faculty-only: Classrooms, Labs
-- Both: Seminar halls, Auditorium, Conference Room
-- ============================================

INSERT INTO resources (resource_name, resource_type, location, capacity, available_for) VALUES
-- Seminar Halls (Both)
('Main Seminar Hall', 'Seminar Hall', 'Block A, Ground Floor', 200, 'Both'),
('Mini Seminar Hall', 'Seminar Hall', 'Block B, 1st Floor', 80, 'Both'),

-- Sports Grounds (Student Only)
('Football Ground', 'Sports Ground', 'Campus Ground', 50, 'Student'),
('Basketball Court', 'Sports Ground', 'Near Hostel Block', 20, 'Student'),
('Cricket Ground', 'Sports Ground', 'Behind Library', 30, 'Student'),
('Tennis Court', 'Sports Ground', 'Sports Complex', 4, 'Student'),

-- Auditorium & Conference (Both)
('Auditorium', 'Auditorium', 'Main Building', 500, 'Both'),
('Conference Room', 'Meeting Room', 'Admin Block, 3rd Floor', 30, 'Both'),

-- Classrooms (Faculty Only)
('Classroom 3105', 'Classroom', 'Block C, 1st Floor', 60, 'Faculty'),
('Classroom 3106', 'Classroom', 'Block C, 1st Floor', 60, 'Faculty'),
('Classroom 3107', 'Classroom', 'Block C, 1st Floor', 55, 'Faculty'),
('Classroom 3201', 'Classroom', 'Block C, 2nd Floor', 70, 'Faculty'),
('Classroom 3202', 'Classroom', 'Block C, 2nd Floor', 65, 'Faculty'),

-- Labs (Faculty Only)
('Lab 3108A', 'Laboratory', 'Block C, 1st Floor', 40, 'Faculty'),
('Lab 3108B', 'Laboratory', 'Block C, 1st Floor', 40, 'Faculty'),
('Computer Lab 1', 'Laboratory', 'Block C, 2nd Floor', 60, 'Faculty');

-- ============================================
-- Insert Default Admin Account
-- Email: admin@campus.com | Password: admin123
-- ============================================

INSERT INTO admins (full_name, email, phone, role, password) VALUES
('Campus Admin', 'admin@campus.com', '9999999999', 'Super Admin', 'admin123');

-- ============================================
-- Verify Data Insertion
-- ============================================

SELECT 'Resources inserted:' AS info, COUNT(*) AS total FROM resources;
SELECT 'Admins inserted:' AS info, COUNT(*) AS total FROM admins;
SELECT resource_name, resource_type, available_for FROM resources ORDER BY available_for, resource_type;
