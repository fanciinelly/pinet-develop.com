// server.js
const express = require('express');
const processHandler = require('./process.js');  // Updated path to match your structure
const path = require('path');
const app = express();

const port = 3001;  // Changed from process.env.PORT to direct port number

// Middleware for CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, './public')));

// API endpoint for process handler
app.post('/process', (req, res) => {
    processHandler(req, res);
});

// Serve specific HTML pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public', 'index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, './public', 'about.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, './public', 'contact.html'));
});

// Error-handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Handle 404 errors
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, './public', 'index.html'));
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});