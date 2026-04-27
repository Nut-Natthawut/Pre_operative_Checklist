import { eq } from 'drizzle-orm';
import { users } from '../db/schema';
import { generateId, hashPassword } from '../lib/password';
import type { AppDb, AppUser } from '../types/app';
import { AppError } from './errors';

export const listUsers = async (db: AppDb) => {
  const allUsers = await db
    .select({
      id: users.id,
      username: users.username,
      role: users.role,
      fullName: users.fullName,
      createdAt: users.createdAt
    })
    .from(users)
    .all();

  return {
    users: allUsers,
    count: allUsers.length
  };
};

export const createUser = async (
  db: AppDb,
  currentUser: AppUser | null,
  payload: { username: string; password: string; fullName: string; role?: string }
) => {
  const { username, password, fullName, role = 'user' } = payload;

  if (!username || !password || !fullName) {
    throw new AppError(400, 'กรุณากรอกข้อมูลให้ครบถ้วน', 'Username, password, and fullName are required');
  }

  if (role !== 'admin' && role !== 'user') {
    throw new AppError(400, 'Role ต้องเป็น admin หรือ user เท่านั้น', 'Role must be either "admin" or "user"');
  }

  const existing = await db.select().from(users).where(eq(users.username, username)).get();
  if (existing) {
    throw new AppError(400, 'ชื่อผู้ใช้นี้มีอยู่แล้ว', 'Username already exists');
  }

  const now = new Date().toISOString();
  const userId = generateId();
  const passwordHash = await hashPassword(password);

  await db.insert(users).values({
    id: userId,
    username,
    passwordHash,
    role,
    fullName,
    createdAt: now,
    createdBy: currentUser?.id || null
  });

  return {
    user: {
      id: userId,
      username,
      role,
      fullName,
      createdAt: now
    }
  };
};

export const deleteUser = async (db: AppDb, currentUser: AppUser | null, userId: string) => {
  if (currentUser?.id === userId) {
    throw new AppError(400, 'ไม่สามารถลบบัญชีตัวเองได้', 'Cannot delete your own account');
  }

  const user = await db.select().from(users).where(eq(users.id, userId)).get();
  if (!user) {
    throw new AppError(404, 'ไม่พบผู้ใช้', 'User not found');
  }

  await db.delete(users).where(eq(users.id, userId));
  return {
    deletedUserId: userId,
    deletedUsername: user.username
  };
};
