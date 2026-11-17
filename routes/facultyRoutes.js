const express = require('express');
const router = express.Router();

module.exports = function (db) {

    // Faculty Registration
    router.post('/register', (req, res) => {
        const { full_name, employee_id, email, phone, department, designation, password } = req.body;

        // Check if email or employee ID already exists
        const checkSql = `SELECT COUNT(*) AS count FROM faculty 
                          WHERE email = ? OR employee_id = ?`;
        db.query(checkSql, [email, employee_id], (err, results) => {
            if (err) return res.json({ success: false, message: 'Registration failed' });
            if (results[0].count > 0) {
                return res.json({ success: false, message: 'Email or Employee ID already registered' });
            }

            const insertSql = `INSERT INTO faculty 
                               (full_name, employee_id, email, phone, department, designation, password) 
                               VALUES (?, ?, ?, ?, ?, ?, ?)`;
            db.query(insertSql, [full_name, employee_id, email, phone, department, designation, password], (err) => {
                if (err) return res.json({ success: false, message: 'Registration failed' });
                res.json({ success: true, message: 'Registration successful' });
            });
        });
    });

    // Faculty Login
    router.post('/login', (req, res) => {
        const { email, password } = req.body;
        const sql = `SELECT faculty_id, full_name, employee_id, email, phone, department, designation 
                     FROM faculty WHERE email = ? AND password = ?`;
        db.query(sql, [email, password], (err, results) => {
            if (err) return res.json({ success: false, message: 'Login failed' });
            if (results.length === 0) return res.json({ success: false, message: 'Invalid email or password' });
            res.json({ success: true, faculty: results[0] });
        });
    });

    // Get Resources for Faculty (only Faculty + Both)
    router.get('/resources', (req, res) => {
        const sql = `SELECT resource_id, resource_name, resource_type, location, capacity 
                     FROM resources 
                     WHERE available_for IN ('Faculty', 'Both') AND is_active = 1 
                     ORDER BY resource_type ASC, resource_name ASC`;
        db.query(sql, (err, results) => {
            if (err) return res.json({ success: false, message: 'Failed to fetch resources' });
            res.json({ success: true, resources: results });
        });
    });

    // Create Booking
    router.post('/booking', (req, res) => {
        const { faculty_id, resource_id, booking_date, time_slot, purpose, num_attendees } = req.body;

        // Check for booking conflict (same resource, date, time already approved)
        const checkSql = `SELECT COUNT(*) AS conflict_count FROM bookings 
                          WHERE resource_id = ? AND booking_date = ? 
                          AND time_slot = ? AND status = 'Approved'`;
        db.query(checkSql, [resource_id, booking_date, time_slot], (err, results) => {
            if (err) return res.json({ success: false, message: 'Booking failed' });
            if (results[0].conflict_count > 0) {
                return res.json({ success: false, message: 'This resource is already booked and approved for the selected date and time' });
            }

            const insertSql = `INSERT INTO bookings 
                               (faculty_id, user_type, resource_id, booking_date, time_slot, purpose, num_attendees) 
                               VALUES (?, 'Faculty', ?, ?, ?, ?, ?)`;
            db.query(insertSql, [faculty_id, resource_id, booking_date, time_slot, purpose, num_attendees || 1], (err) => {
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
                     WHERE b.faculty_id = ? 
                     ORDER BY b.created_at DESC`;
        db.query(sql, [req.params.id], (err, results) => {
            if (err) return res.json({ success: false, message: 'Failed to fetch bookings' });
            res.json({ success: true, bookings: results });
        });
    });

    return router;
};
