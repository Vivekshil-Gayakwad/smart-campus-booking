const express = require('express');
const router = express.Router();

module.exports = function (db) {

    // Student Registration
    router.post('/register', (req, res) => {
        const { full_name, roll_number, email, phone, branch, year_of_study, section, password } = req.body;

        // Check if email or roll number already exists
        const checkSql = `SELECT COUNT(*) AS count FROM students 
                          WHERE email = ? OR roll_number = ?`;
        db.query(checkSql, [email, roll_number], (err, results) => {
            if (err) return res.json({ success: false, message: 'Registration failed' });
            if (results[0].count > 0) {
                return res.json({ success: false, message: 'Email or Roll Number already registered' });
            }

            const insertSql = `INSERT INTO students 
                               (full_name, roll_number, email, phone, branch, year_of_study, section, password) 
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            db.query(insertSql, [full_name, roll_number, email, phone, branch, year_of_study, section, password], (err) => {
                if (err) return res.json({ success: false, message: 'Registration failed' });
                res.json({ success: true, message: 'Registration successful' });
            });
        });
    });

    // Student Login
    router.post('/login', (req, res) => {
        const { email, password } = req.body;
        const sql = `SELECT student_id, full_name, roll_number, email, phone, branch, year_of_study, section 
                     FROM students WHERE email = ? AND password = ?`;
        db.query(sql, [email, password], (err, results) => {
            if (err) return res.json({ success: false, message: 'Login failed' });
            if (results.length === 0) return res.json({ success: false, message: 'Invalid email or password' });
            res.json({ success: true, student: results[0] });
        });
    });

    // Get Resources for Students (only Student + Both)
    router.get('/resources', (req, res) => {
        const sql = `SELECT resource_id, resource_name, resource_type, location, capacity 
                     FROM resources 
                     WHERE available_for IN ('Student', 'Both') AND is_active = 1 
                     ORDER BY resource_type ASC, resource_name ASC`;
        db.query(sql, (err, results) => {
            if (err) return res.json({ success: false, message: 'Failed to fetch resources' });
            res.json({ success: true, resources: results });
        });
    });

    // Create Booking
    router.post('/booking', (req, res) => {
        const { student_id, resource_id, booking_date, time_slot, purpose, num_attendees } = req.body;

        // Check for duplicate booking
        const checkSql = `SELECT COUNT(*) AS duplicate_count FROM bookings 
                          WHERE student_id = ? AND resource_id = ? AND booking_date = ? 
                          AND time_slot = ? AND status != 'Rejected'`;
        db.query(checkSql, [student_id, resource_id, booking_date, time_slot], (err, results) => {
            if (err) return res.json({ success: false, message: 'Booking failed' });
            if (results[0].duplicate_count > 0) {
                return res.json({ success: false, message: 'You already have a booking for this resource at the same date and time' });
            }

            const insertSql = `INSERT INTO bookings 
                               (student_id, user_type, resource_id, booking_date, time_slot, purpose, num_attendees) 
                               VALUES (?, 'Student', ?, ?, ?, ?, ?)`;
            db.query(insertSql, [student_id, resource_id, booking_date, time_slot, purpose, num_attendees || 1], (err) => {
                if (err) return res.json({ success: false, message: 'Booking failed' });
                res.json({ success: true, message: 'Booking request submitted successfully' });
            });
        });
    });

    // Get My Bookings
    router.get('/bookings/:id', (req, res) => {
        const sql = `SELECT b.booking_id, r.resource_name, r.resource_type, r.location,
                     b.booking_date, b.time_slot, b.purpose, b.num_attendees,
                     b.status, b.admin_remark,
                     DATE_FORMAT(b.created_at, '%d %b %Y %h:%i %p') AS booked_on
                     FROM bookings b 
                     INNER JOIN resources r ON b.resource_id = r.resource_id 
                     WHERE b.student_id = ? 
                     ORDER BY b.created_at DESC`;
        db.query(sql, [req.params.id], (err, results) => {
            if (err) return res.json({ success: false, message: 'Failed to fetch bookings' });
            res.json({ success: true, bookings: results });
        });
    });

    return router;
};
