import { Hono } from 'hono';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { createUser, deleteUser, listUsers } from '../services/userService';
import type { Env, Variables } from '../types/app';

const userRoutes = new Hono<{ Bindings: Env; Variables: Variables }>();

// All routes require authentication
userRoutes.use('*', authMiddleware);

// GET /api/users - List all users (admin only)
userRoutes.get('/', adminMiddleware, async (c) => {
  const data = await listUsers(c.get('db'));
  return c.json({
    success: true,
    message: 'ดึงรายชื่อผู้ใช้สำเร็จ',
    data
  });
});

// POST /api/users - Create new user (admin only)
userRoutes.post('/', adminMiddleware, async (c) => {
  const body = await c.req.json();
  const data = await createUser(c.get('db'), c.get('user'), body);
  return c.json({
    success: true,
    message: 'สร้างผู้ใช้สำเร็จ',
    data
  }, 201);
});

// DELETE /api/users/:id - Delete user (admin only)
userRoutes.delete('/:id', adminMiddleware, async (c) => {
  const data = await deleteUser(c.get('db'), c.get('user'), c.req.param('id'));
  return c.json({
    success: true,
    message: 'ลบผู้ใช้สำเร็จ',
    data
  });
});

export default userRoutes;
