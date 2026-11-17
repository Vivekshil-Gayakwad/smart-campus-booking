const fs = require('fs');
const path = require('path');

module.exports = function initializeDatabase(db, callback) {
    const schemaSql = `
    CREATE TABLE IF NOT EXISTS students (
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

    CREATE TABLE IF NOT EXISTS faculty (
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

    CREATE TABLE IF NOT EXISTS admins (
        admin_id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(15) NOT NULL,
        role VARCHAR(50) DEFAULT 'Admin',
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS resources (
        resource_id INT AUTO_INCREMENT PRIMARY KEY,
        resource_name VARCHAR(100) NOT NULL,
        resource_type VARCHAR(50) NOT NULL,
        location VARCHAR(100),
        capacity INT,
        available_for ENUM('Student', 'Faculty', 'Both') DEFAULT 'Both',
        is_active TINYINT(1) DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS bookings (
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
    `;

    db.query(schemaSql, (err) => {
        if (err) {
            console.error('Schema initialization error:', err.message);
            if (callback) callback(err);
            return;
        }
        console.log('Database tables verified/created successfully.');

        // Insert default admin if not present
        db.query("SELECT COUNT(*) AS count FROM admins", (err, res) => {
            if (!err && res[0].count === 0) {
                db.query("INSERT INTO admins (full_name, email, phone, role, password) VALUES ('Campus Admin', 'admin@campus.com', '9999999999', 'Super Admin', 'admin123')");
                console.log('Default admin seeded.');
            }
        });

        // Insert resources if table is empty
        db.query("SELECT COUNT(*) AS count FROM resources", (err, res) => {
            if (!err && res[0].count === 0) {
                const seedResources = `
                INSERT INTO resources (resource_name, resource_type, location, capacity, available_for) VALUES
                ('Main Seminar Hall', 'Seminar Hall', 'Block A, Ground Floor', 200, 'Both'),
                ('Mini Seminar Hall', 'Seminar Hall', 'Block B, 1st Floor', 80, 'Both'),
                ('Football Ground', 'Sports Ground', 'Campus Ground', 50, 'Student'),
                ('Basketball Court', 'Sports Ground', 'Near Hostel Block', 20, 'Student'),
                ('Cricket Ground', 'Sports Ground', 'Behind Library', 30, 'Student'),
                ('Tennis Court', 'Sports Ground', 'Sports Complex', 4, 'Student'),
                ('Auditorium', 'Auditorium', 'Main Building', 500, 'Both'),
                ('Conference Room', 'Meeting Room', 'Admin Block, 3rd Floor', 30, 'Both'),
                ('Classroom 3105', 'Classroom', 'Block C, 1st Floor', 60, 'Faculty'),
                ('Classroom 3106', 'Classroom', 'Block C, 1st Floor', 60, 'Faculty'),
                ('Classroom 3107', 'Classroom', 'Block C, 1st Floor', 55, 'Faculty'),
                ('Classroom 3201', 'Classroom', 'Block C, 2nd Floor', 70, 'Faculty'),
                ('Classroom 3202', 'Classroom', 'Block C, 2nd Floor', 65, 'Faculty'),
                ('Lab 3108A', 'Laboratory', 'Block C, 1st Floor', 40, 'Faculty'),
                ('Lab 3108B', 'Laboratory', 'Block C, 1st Floor', 40, 'Faculty'),
                ('Computer Lab 1', 'Laboratory', 'Block C, 2nd Floor', 60, 'Faculty');
                `;
                db.query(seedResources, () => console.log('Default resources seeded.'));
            }
            if (callback) callback(null);
        });
    });
};
