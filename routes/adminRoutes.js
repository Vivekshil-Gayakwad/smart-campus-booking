const express = require('express');
const router = express.Router();

module.exports = function (db) {

    // Admin Registration
    router.post('/register', (req, res) => {
        const { full_name, email, phone, role, password } = req.body;

        const checkSql = `SELECT COUNT(*) AS count FROM admins WHERE email = ?`;
        db.query(checkSql, [email], (err, results) => {
            if (err) return res.json({ success: false, message: 'Registration failed' });
            if (results[0].count > 0) {
                return res.json({ success: false, message: 'Email already registered' });
            }

            const insertSql = `INSERT INTO admins (full_name, email, phone, role, password) 
                               VALUES (?, ?, ?, ?, ?)`;
            db.query(insertSql, [full_name, email, phone, role || 'Admin', password], (err) => {
                if (err) return res.json({ success: false, message: 'Registration failed' });
                res.json({ success: true, message: 'Admin registered successfully' });
            });
        });
    });

    // Admin Login
    router.post('/login', (req, res) => {
        const { email, password } = req.body;
        const sql = `SELECT admin_id, full_name, email, phone, role 
                     FROM admins WHERE email = ? AND password = ?`;
        db.query(sql, [email, password], (err, results) => {
            if (err) return res.json({ success: false, message: 'Login failed' });
            if (results.length === 0) return res.json({ success: false, message: 'Invalid email or password' });
            res.json({ success: true, admin: results[0] });
        });
    });

    // Get All Bookings (with full user & resource details)
    router.get('/bookings', (req, res) => {
        const sql = `SELECT b.booking_id, b.user_type,
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
                         b.created_at DESC`;
        db.query(sql, (err, results) => {
            if (err) return res.json({ success: false, message: 'Failed to fetch bookings' });
            res.json({ success: true, bookings: results });
        });
    });

    // Approve / Reject Booking
    router.put('/booking/:id', (req, res) => {
        const { status, admin_remark, admin_id } = req.body;
        const sql = `UPDATE bookings 
                     SET status = ?, admin_remark = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP 
                     WHERE booking_id = ?`;
        db.query(sql, [status, admin_remark, admin_id, req.params.id], (err) => {
            if (err) return res.json({ success: false, message: 'Update failed' });
            res.json({ success: true, message: `Booking ${status}` });
        });
    });

    // Analytics: Summary Counts
    router.get('/analytics/counts', (req, res) => {
        const sql = `SELECT 
                     (SELECT COUNT(*) FROM bookings) AS total_bookings,
                     (SELECT COUNT(*) FROM bookings WHERE status = 'Pending') AS pending,
                     (SELECT COUNT(*) FROM bookings WHERE status = 'Approved') AS approved,
                     (SELECT COUNT(*) FROM bookings WHERE status = 'Rejected') AS rejected,
                     (SELECT COUNT(*) FROM students) AS total_students,
                     (SELECT COUNT(*) FROM faculty) AS total_faculty,
                     (SELECT COUNT(*) FROM resources WHERE is_active = 1) AS total_resources`;
        db.query(sql, (err, results) => {
            if (err) return res.json({ success: false, message: 'Failed to fetch analytics' });
            res.json({ success: true, counts: results[0] });
        });
    });

    // Analytics: Top 5 Most Booked Resources
    router.get('/analytics/top-resources', (req, res) => {
        const sql = `SELECT r.resource_name, r.resource_type, 
                     COUNT(b.booking_id) AS total_bookings,
                     SUM(CASE WHEN b.status = 'Approved' THEN 1 ELSE 0 END) AS approved_count
                     FROM bookings b 
                     INNER JOIN resources r ON b.resource_id = r.resource_id 
                     GROUP BY b.resource_id, r.resource_name, r.resource_type 
                     ORDER BY total_bookings DESC LIMIT 5`;
        db.query(sql, (err, results) => {
            if (err) return res.json({ success: false, message: 'Failed to fetch data' });
            res.json({ success: true, topResources: results });
        });
    });

    // Analytics: Recent 5 Bookings
    router.get('/analytics/recent', (req, res) => {
        const sql = `SELECT b.booking_id, b.user_type,
                     COALESCE(s.full_name, f.full_name) AS booked_by,
                     r.resource_name, b.status,
                     DATE_FORMAT(b.created_at, '%d %b %Y') AS booked_on
                     FROM bookings b
                     LEFT JOIN students s ON b.student_id = s.student_id
                     LEFT JOIN faculty f ON b.faculty_id = f.faculty_id
                     INNER JOIN resources r ON b.resource_id = r.resource_id
                     ORDER BY b.created_at DESC LIMIT 5`;
        db.query(sql, (err, results) => {
            if (err) return res.json({ success: false, message: 'Failed to fetch data' });
            res.json({ success: true, recent: results });
        });
    });

    return router;
};
