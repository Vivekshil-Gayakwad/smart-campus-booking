-- ============================================
-- Admin Queries Reference
-- All SQL queries used in Admin Portal
-- ============================================

USE campus_booking;

-- ============================================
-- 1. Admin Registration
-- ============================================
-- INSERT INTO admins (full_name, email, phone, role, password)
-- VALUES (?, ?, ?, ?, ?);

-- ============================================
-- 2. Admin Login
-- ============================================
-- SELECT admin_id, full_name, email, phone, role
-- FROM admins
-- WHERE email = ? AND password = ?;

-- ============================================
-- 3. View All Bookings with User & Resource Details
--    Uses LEFT JOIN for student/faculty (one will be NULL)
--    COALESCE picks the non-null name/email
-- ============================================
SELECT b.booking_id, b.user_type,
       COALESCE(s.full_name, f.full_name) AS booked_by_name,
       COALESCE(s.email, f.email) AS booked_by_email,
       COALESCE(s.phone, f.phone) AS booked_by_phone,
       s.roll_number, s.branch,
       f.employee_id, f.department, f.designation,
       r.resource_name, r.resource_type, r.location,
       b.booking_date, b.time_slot, b.purpose, b.num_attendees,
       b.status, b.admin_remark,
       a.full_name AS reviewed_by_name,
       DATE_FORMAT(b.created_at, '%d %b %Y %h:%i %p') AS booked_on,
       DATE_FORMAT(b.reviewed_at, '%d %b %Y %h:%i %p') AS reviewed_on
FROM bookings b
LEFT JOIN students s ON b.student_id = s.student_id
LEFT JOIN faculty f ON b.faculty_id = f.faculty_id
LEFT JOIN admins a ON b.reviewed_by = a.admin_id
INNER JOIN resources r ON b.resource_id = r.resource_id
ORDER BY
    CASE b.status WHEN 'Pending' THEN 1 WHEN 'Approved' THEN 2 ELSE 3 END,
    b.created_at DESC;

-- ============================================
-- 4. Approve or Reject a Booking
--    Records which admin reviewed it and when
-- ============================================
-- UPDATE bookings
-- SET status = ?,
--     admin_remark = ?,
--     reviewed_by = ?,
--     reviewed_at = CURRENT_TIMESTAMP
-- WHERE booking_id = ?;

-- ============================================
-- 5. Analytics: Summary Counts
-- ============================================
SELECT
    (SELECT COUNT(*) FROM bookings) AS total_bookings,
    (SELECT COUNT(*) FROM bookings WHERE status = 'Pending') AS pending_count,
    (SELECT COUNT(*) FROM bookings WHERE status = 'Approved') AS approved_count,
    (SELECT COUNT(*) FROM bookings WHERE status = 'Rejected') AS rejected_count,
    (SELECT COUNT(*) FROM students) AS total_students,
    (SELECT COUNT(*) FROM faculty) AS total_faculty,
    (SELECT COUNT(*) FROM resources WHERE is_active = 1) AS total_resources;

-- ============================================
-- 6. Analytics: Top 5 Most Booked Resources
-- ============================================
SELECT r.resource_name, r.resource_type, r.location,
       COUNT(b.booking_id) AS total_bookings,
       SUM(CASE WHEN b.status = 'Approved' THEN 1 ELSE 0 END) AS approved_count
FROM bookings b
INNER JOIN resources r ON b.resource_id = r.resource_id
GROUP BY b.resource_id, r.resource_name, r.resource_type, r.location
ORDER BY total_bookings DESC
LIMIT 5;

-- ============================================
-- 7. Analytics: Recent 5 Bookings
-- ============================================
SELECT b.booking_id, b.user_type,
       COALESCE(s.full_name, f.full_name) AS booked_by,
       r.resource_name, b.status,
       DATE_FORMAT(b.created_at, '%d %b %Y') AS booked_on
FROM bookings b
LEFT JOIN students s ON b.student_id = s.student_id
LEFT JOIN faculty f ON b.faculty_id = f.faculty_id
INNER JOIN resources r ON b.resource_id = r.resource_id
ORDER BY b.created_at DESC
LIMIT 5;

-- ============================================
-- 8. Analytics: Bookings Per Department (Faculty)
-- ============================================
SELECT f.department, COUNT(b.booking_id) AS total_bookings
FROM bookings b
INNER JOIN faculty f ON b.faculty_id = f.faculty_id
WHERE b.user_type = 'Faculty'
GROUP BY f.department
ORDER BY total_bookings DESC;
