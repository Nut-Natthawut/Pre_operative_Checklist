import { Context, Next } from 'hono';
import { verifyToken } from '../lib/password';
import type { Env, Variables } from '../index';

type AuthContext = Context<{ Bindings: Env; Variables: Variables }>;

// JWT verification middleware
export async function authMiddleware(c: AuthContext, next: Next) {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ 
      success: false, 
      message: 'กรุณาเข้าสู่ระบบ',
      error: 'Unauthorized - No token provided' 
    }, 401);
  }
  
  const token = authHeader.substring(7);
  const secret = c.env.JWT_SECRET || 'default-secret-change-in-production';
  
  const payload = await verifyToken(token, secret);
  
  if (!payload) {
    return c.json({ 
      success: false, 
      message: 'Token หมดอายุหรือไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่',
      error: 'Unauthorized - Invalid token' 
    }, 401);
  }
  
  c.set('user', payload as { id: string; username: string; role: string });
  await next();
}

// Admin only middleware
export async function adminMiddleware(c: AuthContext, next: Next) {
  const user = c.get('user');
  
  if (!user || user.role !== 'admin') {
    return c.json({ 
      success: false, 
      message: 'คุณไม่มีสิทธิ์เข้าถึง (ต้องเป็น Admin)',
      error: 'Forbidden - Admin access required' 
    }, 403);
  }
  
  await next();
}
