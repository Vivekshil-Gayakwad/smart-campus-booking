-- ============================================
-- Student Queries Reference
-- All SQL queries used in Student Portal
-- ============================================

USE campus_booking;

-- ============================================
-- 1. Student Registration
--    Inserts a new student with all profile fields
-- ============================================
-- INSERT INTO students (full_name, roll_number, email, phone, branch, year_of_study, section, password)
-- VALUES (?, ?, ?, ?, ?, ?, ?, ?);

-- ============================================
-- 2. Student Login
--    Validates email and password, returns student details
-- ============================================
-- SELECT student_id, full_name, roll_number, email, phone, branch, year_of_study, section
-- FROM students
-- WHERE email = ? AND password = ?;

-- ============================================
-- 3. Fetch Resources Available for Students
--    Shows only resources marked for 'Student' or 'Both'
-- ============================================
SELECT resource_id, resource_name, resource_type, location, capacity
FROM resources
WHERE available_for IN ('Student', 'Both')
  AND is_active = 1
ORDER BY resource_type ASC, resource_name ASC;

-- ============================================
-- 4. Create a New Booking (Student)
--    Links booking to student_id, sets user_type as Student
-- ============================================
-- INSERT INTO bookings (student_id, user_type, resource_id, booking_date, time_slot, purpose, num_attendees)
-- VALUES (?, 'Student', ?, ?, ?, ?, ?);

-- ============================================
-- 5. View My Bookings (Student Dashboard)
--    Joins bookings with resources to show full details
--    Ordered by most recent first
-- ============================================
-- SELECT b.booking_id, r.resource_name, r.resource_type, r.location,
--        b.booking_date, b.time_slot, b.purpose, b.num_attendees,
--        b.status, b.admin_remark,
--        DATE_FORMAT(b.created_at, '%d %b %Y %h:%i %p') AS booked_on
-- FROM bookings b
-- INNER JOIN resources r ON b.resource_id = r.resource_id
-- WHERE b.student_id = ?
-- ORDER BY b.created_at DESC;

-- ============================================
-- 6. Check for Duplicate Booking
--    Prevents same student from booking same resource on same date/time
-- ============================================
-- SELECT COUNT(*) AS duplicate_count
-- FROM bookings
-- WHERE student_id = ?
--   AND resource_id = ?
--   AND booking_date = ?
--   AND time_slot = ?
--   AND status != 'Rejected';
