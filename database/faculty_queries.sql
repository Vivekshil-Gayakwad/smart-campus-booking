-- ============================================
-- Faculty Queries Reference
-- All SQL queries used in Faculty Portal
-- ============================================

USE campus_booking;

-- ============================================
-- 1. Faculty Registration
--    Inserts a new faculty with professional details
-- ============================================
-- INSERT INTO faculty (full_name, employee_id, email, phone, department, designation, password)
-- VALUES (?, ?, ?, ?, ?, ?, ?);

-- ============================================
-- 2. Faculty Login
--    Validates credentials and returns faculty profile
-- ============================================
-- SELECT faculty_id, full_name, employee_id, email, phone, department, designation
-- FROM faculty
-- WHERE email = ? AND password = ?;

-- ============================================
-- 3. Fetch Resources Available for Faculty
--    Shows only resources marked for 'Faculty' or 'Both'
--    Classrooms and Labs appear here, sports grounds do NOT
-- ============================================
SELECT resource_id, resource_name, resource_type, location, capacity
FROM resources
WHERE available_for IN ('Faculty', 'Both')
  AND is_active = 1
ORDER BY resource_type ASC, resource_name ASC;

-- ============================================
-- 4. Create a New Booking (Faculty)
--    Links booking to faculty_id, sets user_type as Faculty
-- ============================================
-- INSERT INTO bookings (faculty_id, user_type, resource_id, booking_date, time_slot, purpose, num_attendees)
-- VALUES (?, 'Faculty', ?, ?, ?, ?, ?);

-- ============================================
-- 5. View My Bookings (Faculty Dashboard)
--    Joins bookings with resources, shows approval status
--    Includes admin remark if reviewed
-- ============================================
-- SELECT b.booking_id, r.resource_name, r.resource_type, r.location,
--        b.booking_date, b.time_slot, b.purpose, b.num_attendees,
--        b.status, b.admin_remark,
--        DATE_FORMAT(b.created_at, '%d %b %Y %h:%i %p') AS booked_on
-- FROM bookings b
-- INNER JOIN resources r ON b.resource_id = r.resource_id
-- WHERE b.faculty_id = ?
-- ORDER BY b.created_at DESC;

-- ============================================
-- 6. Check Booking Conflict
--    Checks if the resource is already booked for same date & time
-- ============================================
-- SELECT COUNT(*) AS conflict_count
-- FROM bookings
-- WHERE resource_id = ?
--   AND booking_date = ?
--   AND time_slot = ?
--   AND status = 'Approved';
