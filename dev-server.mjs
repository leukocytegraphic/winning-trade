import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import polygonHandler from './api/polygon.js';
import telegramHandler from './api/telegram.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());



// Route proxy for the serverless functions
app.all('/api/polygon', async (req, res) => {
    try {
        await polygonHandler(req, res);
    } catch (e) {
        if (!res.headersSent) res.status(500).json({ error: e.message });
        console.error('Polygon Dev Error:', e);
    }
});

app.all('/api/telegram', async (req, res) => {
    try {
        await telegramHandler(req, res);
    } catch (e) {
        if (!res.headersSent) res.status(500).json({ error: e.message });
        console.error('Telegram Dev Error:', e);
    }
});

// Serve the frontend static files
app.use(express.static('.'));

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`\n\x1b[36m🚀 WINNING TRADE LOCAL SERVER RAN SUCCESSFULLY\x1b[0m`);
  console.log(`\x1b[32mThe frontend and proxy backend is running at: http://localhost:${PORT}\x1b[0m\n`);
});
