import { eq } from 'drizzle-orm';
import { users } from '../db/schema';
import { createRefreshToken, createToken, generateId, hashPassword, verifyPassword, verifyToken } from '../lib/password';
import type { AppDb, AppUser, Env } from '../types/app';
import { AppError } from './errors';

export async function loginUser(db: AppDb, env: Env, username: string, password: string) {
  if (!username || !password) {
    throw new AppError(400, 'กรุณากรอก username และ password', 'Username and password are required');
  }

  const user = await db.select().from(users).where(eq(users.username, username)).get();
  if (!user) {
    throw new AppError(401, 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'Invalid username or password');
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    throw new AppError(401, 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'Invalid username or password');
  }

  const secret = env.JWT_SECRET || 'default-secret-change-in-production';
  const userPayload = { id: user.id, username: user.username, role: user.role };
  const token = await createToken(userPayload, secret);
  const refreshToken = await createRefreshToken(userPayload, secret);

  return {
    token,
    refreshToken,
    expiresIn: 28800,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      fullName: user.fullName
    }
  };
}

export async function getCurrentUserProfile(db: AppDb, currentUser: AppUser | null) {
  if (!currentUser) {
    throw new AppError(401, 'กรุณาเข้าสู่ระบบ', 'Not authenticated');
  }

  const user = await db.select().from(users).where(eq(users.id, currentUser.id)).get();
  if (!user) {
    throw new AppError(404, 'ไม่พบผู้ใช้', 'User not found');
  }

  return {
    id: user.id,
    username: user.username,
    role: user.role,
    fullName: user.fullName
  };
}

export async function refreshAccessToken(db: AppDb, env: Env, refreshToken: string) {
  if (!refreshToken) {
    throw new AppError(400, 'กรุณาส่ง refresh token', 'Refresh token is required');
  }

  const secret = env.JWT_SECRET || 'default-secret-change-in-production';
  const payload = await verifyToken(refreshToken, secret) as { id: string; username: string; role: string; type?: string } | null;

  if (!payload || payload.type !== 'refresh') {
    throw new AppError(401, 'Refresh token ไม่ถูกต้องหรือหมดอายุ', 'Invalid or expired refresh token');
  }

  const user = await db.select().from(users).where(eq(users.id, payload.id)).get();
  if (!user) {
    throw new AppError(404, 'ไม่พบผู้ใช้', 'User not found');
  }

  const token = await createToken({ id: user.id, username: user.username, role: user.role }, secret);
  return {
    token,
    expiresIn: 7200
  };
}

export async function initializeAdmin(db: AppDb) {
  const existingUsers = await db.select().from(users).limit(1).all();
  if (existingUsers.length > 0) {
    throw new AppError(400, 'มี Admin อยู่แล้ว กรุณาเข้าสู่ระบบ', 'Admin user already exists');
  }

  const passwordHash = await hashPassword('admin123');
  await db.insert(users).values({
    id: generateId(),
    username: 'admin',
    passwordHash,
    role: 'admin',
    fullName: 'System Administrator',
    createdAt: new Date().toISOString(),
    createdBy: null
  });

  return {
    username: 'admin',
    password: 'admin123',
    note: 'กรุณาเปลี่ยนรหัสผ่านหลังเข้าสู่ระบบ'
  };
}
