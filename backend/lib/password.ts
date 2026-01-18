// Secure password hashing using PBKDF2 (Web Crypto API - available in Cloudflare Workers)
// This is the recommended alternative to bcrypt for Workers environment

const PBKDF2_ITERATIONS = 100000; // Industry standard
const SALT_LENGTH = 16; // 128 bits
const HASH_LENGTH = 32; // 256 bits

// Generate random salt
function generateSalt(): string {
  const saltArray = new Uint8Array(SALT_LENGTH);
  crypto.getRandomValues(saltArray);
  return Array.from(saltArray).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Hash password with PBKDF2-SHA256 + salt
export async function hashPassword(password: string): Promise<string> {
  const salt = generateSalt();
  const encoder = new TextEncoder();
  
  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  // Derive key using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    HASH_LENGTH * 8 // bits
  );
  
  const hashArray = Array.from(new Uint8Array(derivedBits));
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Return format: salt$hash
  return `${salt}$${hash}`;
}

// Verify password against stored hash
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  // Check if it's new format (contains $)
  if (!storedHash.includes('$')) {
    // Legacy SHA-256 format - reject for security
    // Users must reset their password
    return false;
  }
  
  const [salt, hash] = storedHash.split('$');
  const encoder = new TextEncoder();
  
  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  
  // Derive key using PBKDF2 with same salt
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256'
    },
    keyMaterial,
    HASH_LENGTH * 8
  );
  
  const hashArray = Array.from(new Uint8Array(derivedBits));
  const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Constant-time comparison to prevent timing attacks
  if (computedHash.length !== hash.length) return false;
  let result = 0;
  for (let i = 0; i < computedHash.length; i++) {
    result |= computedHash.charCodeAt(i) ^ hash.charCodeAt(i);
  }
  return result === 0;
}

// Token expiry constants
const ACCESS_TOKEN_EXPIRY = 8 * 60 * 60; // 8 hours in seconds (shift-based)
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
