import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { users } from '../db/schema';
import { hashPassword, verifyPassword, createToken, generateId } from '../lib/password';
import { authMiddleware } from '../middleware/auth';
import type { Env, Variables } from '../index';

const auth = new Hono<{ Bindings: Env; Variables: Variables }>();

// POST /api/auth/login
auth.post('/login', async (c) => {
  try {
    const body = await c.req.json();
    const { username, password } = body;
    
    if (!username || !password) {
      return c.json({ 
        success: false, 
        message: 'กรุณากรอก username และ password',
        error: 'Username and password are required' 
      }, 400);
    }
    
    const db = c.get('db');
    const user = await db.select().from(users).where(eq(users.username, username)).get();
    
    if (!user) {
      return c.json({ 
        success: false, 
        message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
        error: 'Invalid username or password' 
      }, 401);
    }
    
    const isValid = await verifyPassword(password, user.passwordHash);
    
    if (!isValid) {
      return c.json({ 
        success: false, 
        message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
        error: 'Invalid username or password' 
      }, 401);
    }
    
    const secret = c.env.JWT_SECRET || 'default-secret-change-in-production';
    const token = await createToken(
      { id: user.id, username: user.username, role: user.role },
      secret
    );
    
    return c.json({
      success: true,
      message: 'เข้าสู่ระบบสำเร็จ',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          fullName: user.fullName,
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในระบบ',
      error: 'Internal server error' 
    }, 500);
  }
});

// GET /api/auth/me
auth.get('/me', authMiddleware, async (c) => {
  try {
    const currentUser = c.get('user');
    
    if (!currentUser) {
      return c.json({ 
        success: false, 
        message: 'กรุณาเข้าสู่ระบบ',
        error: 'Not authenticated' 
      }, 401);
    }
    
    const db = c.get('db');
    const user = await db.select().from(users).where(eq(users.id, currentUser.id)).get();
    
    if (!user) {
      return c.json({ 
        success: false, 
        message: 'ไม่พบผู้ใช้',
        error: 'User not found' 
      }, 404);
    }
    
    return c.json({
      success: true,
      message: 'ดึงข้อมูลผู้ใช้สำเร็จ',
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    return c.json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในระบบ',
      error: 'Internal server error' 
    }, 500);
  }
});

// POST /api/auth/init - Initialize first admin user (only if no users exist)
auth.post('/init', async (c) => {
  try {
    const db = c.get('db');
    
    // Check if any users exist
    const existingUsers = await db.select().from(users).limit(1).all();
    
    if (existingUsers.length > 0) {
      return c.json({ 
        success: false, 
        message: 'มี Admin อยู่แล้ว กรุณาเข้าสู่ระบบ',
        error: 'Admin user already exists' 
      }, 400);
    }
    
    // Create default admin
    const passwordHash = await hashPassword('admin123');
    const now = new Date().toISOString();
    
    await db.insert(users).values({
      id: generateId(),
      username: 'admin',
      passwordHash,
      role: 'admin',
      fullName: 'System Administrator',
      createdAt: now,
      createdBy: null,
    });
    
    return c.json({
      success: true,
      message: 'สร้าง Admin สำเร็จ',
      data: {
        username: 'admin',
        password: 'admin123',
        note: 'กรุณาเปลี่ยนรหัสผ่านหลังเข้าสู่ระบบ'
      }
    });
  } catch (error) {
    console.error('Init error:', error);
    return c.json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในระบบ',
      error: 'Internal server error' 
    }, 500);
  }
});

export default auth;
