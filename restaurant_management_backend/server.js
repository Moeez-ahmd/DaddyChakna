const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const path = require('path');
const fs = require('fs');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Trust proxy for AWS App Runner / Load Balancers
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Static folder for uploads
app.use('/uploads', express.static(uploadsDir));

// Legal Pages
app.get('/api/privacy-policy.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'privacy-policy.html'));
});
app.get('/api/contact-us.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact-us.html'));
});

// Debug Logger
app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
});

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'API is running...' });
});

// Import route definitions
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/menu', require('./routes/menuItemRoutes'));
app.use('/api/deals', require('./routes/dealRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/finance', require('./routes/financeRoutes'));
app.use('/api/staff', require('./routes/staffRoutes'));
app.use('/api/banners', require('./routes/bannerRoutes'));

// Error handler middlewares
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        message: typeof err === 'string' ? err : err.message,
        stack: process.env.NODE_ENV === 'production' ? null : (err.stack || null),
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
