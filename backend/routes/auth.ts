import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { getCurrentUserProfile, initializeAdmin, loginUser, refreshAccessToken } from '../services/authService';
import type { Env, Variables } from '../types/app';

const auth = new Hono<{ Bindings: Env; Variables: Variables }>();

// POST /api/auth/login
auth.post('/login', async (c) => {
  const body = await c.req.json();
  const data = await loginUser(c.get('db'), c.env, body.username, body.password);
  return c.json({
    success: true,
    message: 'เข้าสู่ระบบสำเร็จ',
    data
  });
});

// GET /api/auth/me
auth.get('/me', authMiddleware, async (c) => {
  const data = await getCurrentUserProfile(c.get('db'), c.get('user'));
  return c.json({
    success: true,
    message: 'ดึงข้อมูลผู้ใช้สำเร็จ',
    data
  });
});

// POST /api/auth/refresh - Get new access token using refresh token
auth.post('/refresh', async (c) => {
  const body = await c.req.json();
  const data = await refreshAccessToken(c.get('db'), c.env, body.refreshToken);
  return c.json({
    success: true,
    message: 'ต่ออายุ token สำเร็จ',
    data
  });
});

// POST /api/auth/init - Initialize first admin user (only if no users exist)
auth.post('/init', async (c) => {
  const data = await initializeAdmin(c.get('db'));
  return c.json({
    success: true,
    message: 'สร้าง Admin สำเร็จ',
    data
  });
});

export default auth;
