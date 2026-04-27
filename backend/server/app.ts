import { drizzle } from 'drizzle-orm/d1';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import authRoutes from '../routes/auth';
import formRoutes from '../routes/forms';
import userRoutes from '../routes/users';
import { AppError } from '../services/errors';
import type { Env, Variables } from '../types/app';

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];

export function createApp() {
  const app = new Hono<{ Bindings: Env; Variables: Variables }>();

  app.use('*', logger());
  app.use(
    '*',
    cors({
      origin: (origin) => {
        if (!origin) return undefined;
        if (allowedOrigins.includes(origin)) return origin;
        if (origin.endsWith('.vercel.app')) return origin;
        if (origin.endsWith('.pages.dev')) return origin;
        return null;
      },
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    })
  );

  app.use('*', async (c, next) => {
    c.set('db', drizzle(c.env.DB));
    await next();
  });

  app.get('/', (c) =>
    c.json({
      success: true,
      message: 'Hospital Form API พร้อมใช้งาน',
      data: {
        name: 'Hospital Form API',
        description: 'รายงานการเตรียมผู้ป่วยก่อนผ่าตัด',
        version: '1.0.0',
        status: 'running'
      }
    })
  );

  app.route('/api/auth', authRoutes);
  app.route('/api/users', userRoutes);
  app.route('/api/forms', formRoutes);

  app.notFound((c) =>
    c.json(
      {
        success: false,
        message: 'ไม่พบ API endpoint ที่ร้องขอ',
        error: 'Not Found'
      },
      404
    )
  );

  app.onError((err, c) => {
    if (err instanceof AppError) {
      return c.json(
        {
          success: false,
          message: err.message,
          error: err.details || err.message
        },
        err.status as 400 | 401 | 403 | 404 | 500
      );
    }

    console.error('Server error:', err);
    return c.json(
      {
        success: false,
        message: 'เกิดข้อผิดพลาดในระบบ',
        error: err.message || 'Internal Server Error'
      },
      500
    );
  });

  return app;
}
