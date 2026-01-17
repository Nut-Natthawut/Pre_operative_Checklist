import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { drizzle } from 'drizzle-orm/d1';

import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import formRoutes from './routes/forms';

export type Env = {
  DB: D1Database;
  JWT_SECRET: string;
};

export type Variables = {
  db: ReturnType<typeof drizzle>;
  user: { id: string; username: string; role: string } | null;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Middleware
app.use('*', logger());

// CORS - Restrict to allowed origins only
const allowedOrigins = [
  'http://localhost:5173',    // Vite dev server
  'http://localhost:5174',    // Vite alternate port
  'http://localhost:3000',    // Alternative dev port
  'http://127.0.0.1:5173',    // Localhost alternative
  'http://127.0.0.1:5174',    // Localhost alternate port
];

app.use('*', cors({
  origin: (origin) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return undefined;
    
    // Check exact matches
    if (allowedOrigins.includes(origin)) return origin;
    
    // Allow all *.vercel.app subdomains
    if (origin.endsWith('.vercel.app')) return origin;
    
    // Block all other origins
    return null;
  },
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Initialize DB
app.use('*', async (c, next) => {
  const db = drizzle(c.env.DB);
  c.set('db', db);
  await next();
});

// Health check
app.get('/', (c) => {
  return c.json({ 
    success: true,
    message: 'Hospital Form API พร้อมใช้งาน',
    data: {
      name: 'Hospital Form API',
      description: 'รายงานการเตรียมผู้ป่วยก่อนผ่าตัด',
      version: '1.0.0',
      status: 'running'
    }
  });
});

// 404 Handler
app.notFound((c) => {
  return c.json({
    success: false,
    message: 'ไม่พบ API endpoint ที่ร้องขอ',
    error: 'Not Found'
  }, 404);
});

// Error Handler
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({
    success: false,
    message: 'เกิดข้อผิดพลาดในระบบ',
    error: err.message || 'Internal Server Error'
  }, 500);
});

// Routes
app.route('/api/auth', authRoutes);
app.route('/api/users', userRoutes);
app.route('/api/forms', formRoutes);

export default app;
