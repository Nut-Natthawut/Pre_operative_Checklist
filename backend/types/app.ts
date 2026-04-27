import type { Context } from 'hono';
import { drizzle } from 'drizzle-orm/d1';

export type Env = {
  DB: D1Database;
  JWT_SECRET: string;
};

export type AppUser = {
  id: string;
  username: string;
  role: string;
};

export type Variables = {
  db: ReturnType<typeof drizzle>;
  user: AppUser | null;
};

export type AppContext = Context<{ Bindings: Env; Variables: Variables }>;
export type AppDb = Variables['db'];
