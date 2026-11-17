const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

// Import Route Files
const studentRoutes = require('./routes/studentRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET || 'campus-booking-secret',
    resave: false,
    saveUninitialized: false
}));

// MySQL Connection (Supports both local and cloud deployment)
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'Vivekshil@358',
    database: process.env.DB_NAME || 'campus_booking',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    multipleStatements: true
};

if (process.env.DB_SSL === 'true' || (process.env.DB_HOST && process.env.DB_HOST !== 'localhost')) {
    dbConfig.ssl = { rejectUnauthorized: false };
}

const db = mysql.createConnection(dbConfig);

const initDb = require('./database/init_db');

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        console.log('Make sure MySQL is running and the database is created.');
        return;
    }
    console.log('Connected to MySQL database.');

    // Auto-initialize tables and seed data if missing (seamless cloud deployment)
    db.query("SHOW TABLES LIKE 'resources';", (err, rows) => {
        if (!err && (!rows || rows.length === 0)) {
            console.log('No existing tables found. Initializing database schema and seed data...');
            initDb(db);
        }
    });
});

// Use Route Files
app.use('/api/student', studentRoutes(db));
app.use('/api/faculty', facultyRoutes(db));
app.use('/api/admin', adminRoutes(db));

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
