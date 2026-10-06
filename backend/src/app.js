import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import vendorRoutes from './routes/vendors.js';
import processRoutes from './routes/process.js';
import emailRoutes from './routes/email.js';
import invoiceRoutes from './routes/invoices.js';
import sheetsRoutes from './routes/sheets.js';
import userRoutes from './routes/user.js';

import { errorHandler, notFound } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

app.use(helmet());

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    // Current frontend on Vercel — remove once you move to Render
    'https://pdf2sheet.vercel.app',
    // Future frontend on Render
    'https://pdf2sheet-frontend.onrender.com',
    'https://pdf2sheet-z3ll.onrender.com',
    // FRONTEND_URL env var lets you override without redeploying
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(null, false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'PDF2Sheet API is running',
        timestamp: new Date().toISOString()
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/process', processRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/sheets', sheetsRoutes);
app.use('/api/user', userRoutes);

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(notFound);

app.use(errorHandler);

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../frontend/dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../../frontend/dist', 'index.html'));
    });
}

export default app;
