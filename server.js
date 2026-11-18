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

// MySQL Connection Pool (Supports both local and cloud deployment)
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : 'Vivekshil@358',
    database: process.env.DB_NAME || 'campus_booking',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 5000,
    multipleStatements: true
};

if (process.env.DB_SSL === 'true' || (process.env.DB_HOST && process.env.DB_HOST !== 'localhost')) {
    dbConfig.ssl = { rejectUnauthorized: false };
}

const db = mysql.createPool(dbConfig);

// Verify database connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        console.log('If deployed on Render, make sure DB_HOST, DB_USER, DB_PASSWORD, DB_PORT are set in Environment Variables.');
        return;
    }
    console.log('Connected to MySQL database successfully.');
    connection.release();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    db.query('SELECT 1 + 1 AS solution', (err) => {
        if (err) {
            return res.status(500).json({
                status: 'error',
                message: 'Database not connected: ' + err.message,
                db_host: process.env.DB_HOST || 'localhost (default)'
            });
        }
        res.json({
            status: 'ok',
            message: 'Database connected and healthy',
            db_host: process.env.DB_HOST || 'localhost'
        });
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
