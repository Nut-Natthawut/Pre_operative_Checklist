import { Hono } from 'hono';
import { eq, ne } from 'drizzle-orm';
import { users } from '../db/schema';
import { hashPassword, generateId } from '../lib/password';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import type { Env, Variables } from '../index';

const userRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// All routes require authentication
userRoutes.use('*', authMiddleware);

// GET /api/users - List all users (admin only)
userRoutes.get('/', adminMiddleware, async (c) => {
  try {
    const db = c.get('db');
    const allUsers = await db
      .select({
        id: users.id,
        username: users.username,
        role: users.role,
        fullName: users.fullName,
        createdAt: users.createdAt,
      })
      .from(users)
      .all();
    
    return c.json({ 
      success: true,
      message: 'ดึงรายชื่อผู้ใช้สำเร็จ',
      data: {
        users: allUsers,
        count: allUsers.length
      }
    });
  } catch (error) {
    console.error('List users error:', error);
    return c.json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในระบบ',
      error: 'Internal server error' 
    }, 500);
  }
});

// POST /api/users - Create new user (admin only)
userRoutes.post('/', adminMiddleware, async (c) => {
  try {
    const body = await c.req.json();
    const { username, password, fullName, role = 'user' } = body;
    
    if (!username || !password || !fullName) {
      return c.json({ 
        success: false, 
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        error: 'Username, password, and fullName are required' 
      }, 400);
    }
    
    if (role !== 'admin' && role !== 'user') {
      return c.json({ 
        success: false, 
        message: 'Role ต้องเป็น admin หรือ user เท่านั้น',
        error: 'Role must be either "admin" or "user"' 
      }, 400);
    }
    
    const db = c.get('db');
    const currentUser = c.get('user');
    
    // Check if username exists
    const existing = await db.select().from(users).where(eq(users.username, username)).get();
    
    if (existing) {
      return c.json({ 
        success: false, 
        message: 'ชื่อผู้ใช้นี้มีอยู่แล้ว',
        error: 'Username already exists' 
      }, 400);
    }
    
    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();
    const userId = generateId();
    
    await db.insert(users).values({
      id: userId,
      username,
      passwordHash,
      role,
      fullName,
      createdAt: now,
      createdBy: currentUser?.id || null,
    });
    
    return c.json({
      success: true,
      message: 'สร้างผู้ใช้สำเร็จ',
      data: {
        user: {
          id: userId,
          username,
          role,
          fullName,
          createdAt: now,
        }
      }
    }, 201);
  } catch (error) {
    console.error('Create user error:', error);
    return c.json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในระบบ',
      error: 'Internal server error' 
    }, 500);
  }
});

// DELETE /api/users/:id - Delete user (admin only)
userRoutes.delete('/:id', adminMiddleware, async (c) => {
  try {
    const userId = c.req.param('id');
    const currentUser = c.get('user');
    
    // Prevent self-deletion
    if (currentUser?.id === userId) {
      return c.json({ 
        success: false, 
        message: 'ไม่สามารถลบบัญชีตัวเองได้',
        error: 'Cannot delete your own account' 
      }, 400);
    }
    
    const db = c.get('db');
    
    // Check if user exists
    const user = await db.select().from(users).where(eq(users.id, userId)).get();
    
    if (!user) {
      return c.json({ 
        success: false, 
        message: 'ไม่พบผู้ใช้',
        error: 'User not found' 
      }, 404);
    }
    
    await db.delete(users).where(eq(users.id, userId));
    
    return c.json({ 
      success: true,
      message: 'ลบผู้ใช้สำเร็จ',
      data: {
        deletedUserId: userId,
        deletedUsername: user.username
      }
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return c.json({ 
      success: false, 
      message: 'เกิดข้อผิดพลาดในระบบ',
      error: 'Internal server error' 
    }, 500);
  }
});

export default userRoutes;
