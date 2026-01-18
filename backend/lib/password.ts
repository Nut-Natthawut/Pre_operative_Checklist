// Simple password hashing using Web Crypto API (available in Cloudflare Workers)

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password);
  return passwordHash === hash;
}

// Token expiry constants
const ACCESS_TOKEN_EXPIRY = 2 * 60 * 60; // 2 hours in seconds
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 days in seconds

// Simple JWT implementation for Cloudflare Workers
export async function createToken(payload: object, secret: string, expirySeconds: number = ACCESS_TOKEN_EXPIRY): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = { ...payload, iat: now, exp: now + expirySeconds };
  
  const base64Header = btoa(JSON.stringify(header));
  const base64Payload = btoa(JSON.stringify(tokenPayload));
  
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(`${base64Header}.${base64Payload}`)
  );
  
  const base64Signature = btoa(String.fromCharCode(...new Uint8Array(signature)));
  
  return `${base64Header}.${base64Payload}.${base64Signature}`;
}

// Create refresh token (longer expiry, includes type marker)
export async function createRefreshToken(payload: object, secret: string): Promise<string> {
  const refreshPayload = { ...payload, type: 'refresh' };
  return createToken(refreshPayload, secret, REFRESH_TOKEN_EXPIRY);
}

export async function verifyToken(token: string, secret: string): Promise<object | null> {
  try {
    const [base64Header, base64Payload, base64Signature] = token.split('.');
    
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    
    const signatureBytes = Uint8Array.from(atob(base64Signature), c => c.charCodeAt(0));
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      encoder.encode(`${base64Header}.${base64Payload}`)
    );
    
    if (!isValid) return null;
    
    const payload = JSON.parse(atob(base64Payload));
    
    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    
    return payload;
  } catch {
    return null;
  }
}

export function generateId(): string {
  return crypto.randomUUID();
}
