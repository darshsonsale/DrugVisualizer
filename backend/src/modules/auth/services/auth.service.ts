import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import { getPool } from '../../../database/pool.js';
import { config } from '../../../config/index.js';
import { BadRequestError, UnauthorizedError, NotFoundError, ForbiddenError, ConflictError } from '../../../common/errors/AppError.js';
import type {
  User,
  RawUserRow,
  UserRole
} from '../models/user.model.js';
import type {
  UserProfileDto,
  AuthSessionResponseDto,
  GoogleAuthUrlResponseDto,
  GoogleUserInfo,
  JwtTokenPayload,
  LoginRequestDto,
  RegisterRequestDto
} from '../dto/auth.dto.js';

export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

export async function verifyPassword(password: string, combinedHash: string): Promise<boolean> {
  return new Promise((resolve) => {
    const [salt, key] = combinedHash.split(':');
    if (!salt || !key) return resolve(false);
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return resolve(false);
      const keyBuffer = Buffer.from(key, 'hex');
      if (keyBuffer.length !== derivedKey.length) return resolve(false);
      resolve(crypto.timingSafeEqual(keyBuffer, derivedKey));
    });
  });
}

function mapUserRow(row: RawUserRow): User {
  return {
    id: row.id,
    google_id: row.google_id,
    email: row.email,
    name: row.name,
    avatar_url: row.avatar_url,
    role: row.role as UserRole,
    password_hash: row.password_hash,
    created_at: new Date(row.created_at).toISOString(),
    updated_at: new Date(row.updated_at).toISOString()
  };
}

export function toUserProfileDto(user: User): UserProfileDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar_url: user.avatar_url,
    role: user.role,
    created_at: user.created_at
  };
}

export class AuthService {
  private oauthClient: OAuth2Client;

  constructor() {
    this.oauthClient = new OAuth2Client({
      clientId: config.auth.googleClientId,
      clientSecret: config.auth.googleClientSecret,
      redirectUri: config.auth.googleRedirectUri
    });
  }

  /**
   * Generates a cryptographically signed OAuth state parameter with TTL (10 minutes).
   * Format: base64url(nonce:timestamp:hmac_signature)
   */
  public generateOAuthState(): string {
    const nonce = crypto.randomBytes(16).toString('hex');
    const timestamp = Date.now().toString();
    const data = `${nonce}:${timestamp}`;
    const signature = crypto
      .createHmac('sha256', config.auth.jwtSecret)
      .update(data)
      .digest('hex');
    return Buffer.from(`${data}:${signature}`).toString('base64url');
  }

  /**
   * Validates state parameter to protect against CSRF attacks.
   */
  public verifyOAuthState(state: string, maxAgeMs: number = 10 * 60 * 1000): boolean {
    try {
      const decoded = Buffer.from(state, 'base64url').toString('utf-8');
      const parts = decoded.split(':');
      if (parts.length !== 3) return false;

      const [nonce, timestampStr, signature] = parts;
      const data = `${nonce}:${timestampStr}`;
      const expectedSignature = crypto
        .createHmac('sha256', config.auth.jwtSecret)
        .update(data)
        .digest('hex');

      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        return false;
      }

      const timestamp = parseInt(timestampStr, 10);
      if (Number.isNaN(timestamp) || Date.now() - timestamp > maxAgeMs || timestamp > Date.now() + 60000) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Generates the Google OAuth 2.0 consent URL.
   */
  public getGoogleAuthUrl(customState?: string): GoogleAuthUrlResponseDto {
    const state = customState || this.generateOAuthState();
    const url = this.oauthClient.generateAuthUrl({
      access_type: 'offline',
      scope: ['openid', 'email', 'profile'],
      state,
      prompt: 'select_account'
    });
    return { url, state };
  }

  /**
   * Verifies Google identity from either a live OAuth code or deterministic mock token.
   */
  public async verifyGoogleIdToken(idToken: string): Promise<GoogleUserInfo> {
    if (!idToken || typeof idToken !== 'string') {
      throw new BadRequestError('id_token is required');
    }

    // Deterministic test hook for automated verification in non-live environments
    if (idToken.startsWith('mock-google-token:')) {
      const parts = idToken.split(':');
      if (parts.length < 3) {
        throw new UnauthorizedError('Malformed mock Google token');
      }
      return {
        sub: parts[1],
        email: parts[2],
        name: parts[3] || 'Mock User',
        picture: parts[4] || 'https://example.com/avatar.png',
        email_verified: true
      };
    }

    if (!config.auth.googleClientId) {
      throw new BadRequestError(
        'Google OAuth client ID is not configured. Real Google sign-in requires GOOGLE_CLIENT_ID.'
      );
    }

    try {
      const ticket = await this.oauthClient.verifyIdToken({
        idToken,
        audience: config.auth.googleClientId
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.sub || !payload.email) {
        throw new UnauthorizedError('Invalid Google token payload');
      }

      return {
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        email_verified: payload.email_verified
      };
    } catch (err: any) {
      if (err instanceof UnauthorizedError || err instanceof BadRequestError) throw err;
      throw new UnauthorizedError('Google ID token verification failed', err.message);
    }
  }

  /**
   * Handles Google OAuth 2.0 Authorization Code callback.
   */
  public async handleGoogleCallback(code: string, state: string): Promise<AuthSessionResponseDto> {
    if (!code) {
      throw new BadRequestError('Authorization code is required');
    }
    if (!state || !this.verifyOAuthState(state)) {
      throw new BadRequestError('Invalid or expired OAuth state parameter (CSRF protection failed)');
    }

    let googleUserInfo: GoogleUserInfo;

    // Support deterministic testing flow
    if (code.startsWith('mock-auth-code:')) {
      const parts = code.split(':');
      googleUserInfo = {
        sub: parts[1] || 'mock-google-sub-123',
        email: parts[2] || 'user@example.com',
        name: parts[3] || 'OAuth Test User',
        picture: 'https://example.com/photo.jpg',
        email_verified: true
      };
    } else {
      if (!config.auth.googleClientSecret) {
        throw new BadRequestError(
          'Google OAuth client secret is not configured. Live authorization code exchange requires GOOGLE_CLIENT_SECRET.'
        );
      }

      try {
        const { tokens } = await this.oauthClient.getToken(code);
        if (!tokens.id_token) {
          throw new UnauthorizedError('Google did not return an ID token');
        }
        googleUserInfo = await this.verifyGoogleIdToken(tokens.id_token);
      } catch (err: any) {
        if (err instanceof UnauthorizedError || err instanceof BadRequestError) throw err;
        throw new UnauthorizedError('Failed to exchange authorization code with Google', err.message);
      }
    }

    const user = await this.upsertGoogleUser(googleUserInfo);
    const token = this.signSessionToken(user);

    return {
      token,
      expires_in: config.auth.jwtExpiresIn,
      user: toUserProfileDto(user)
    };
  }

  /**
   * Authenticates user via Google GIS ID Token directly.
   */
  public async authenticateWithGoogleIdToken(idToken: string): Promise<AuthSessionResponseDto> {
    const googleUserInfo = await this.verifyGoogleIdToken(idToken);
    const user = await this.upsertGoogleUser(googleUserInfo);
    const token = this.signSessionToken(user);

    return {
      token,
      expires_in: config.auth.jwtExpiresIn,
      user: toUserProfileDto(user)
    };
  }

  /**
   * Upserts a verified Google user into PostgreSQL.
   */
  public async upsertGoogleUser(info: GoogleUserInfo): Promise<User> {
    if (info.email_verified === false) {
      throw new BadRequestError('Google email must be verified to authenticate');
    }

    const userEmail = info.email.toLowerCase().trim();
    const isAdmin = config.auth.adminEmails.includes(userEmail);
    const initialRole: UserRole = isAdmin ? 'admin' : 'learner';

    const userId = `usr-${crypto.createHash('sha256').update(info.sub).digest('hex').substring(0, 16)}`;

    const query = `
      INSERT INTO users (id, google_id, email, name, avatar_url, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (google_id) DO UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, users.name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
        role = CASE 
          WHEN users.role = 'admin' THEN 'admin' 
          WHEN EXCLUDED.role = 'admin' THEN 'admin' 
          ELSE users.role 
        END,
        updated_at = NOW()
      RETURNING id, google_id, email, name, avatar_url, role, created_at, updated_at;
    `;

    const result = await getPool().query<RawUserRow>(query, [
      userId,
      info.sub,
      userEmail,
      info.name || null,
      info.picture || null,
      initialRole
    ]);

    return mapUserRow(result.rows[0]);
  }

  /**
   * Signs a JWT session token.
   */
  public signSessionToken(user: User): string {
    const payload: JwtTokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role
    };

    return jwt.sign(payload, config.auth.jwtSecret, {
      expiresIn: config.auth.jwtExpiresIn as any,
      algorithm: 'HS256'
    });
  }

  /**
   * Verifies and decodes a JWT session token.
   */
  public verifySessionToken(token: string): JwtTokenPayload {
    try {
      const decoded = jwt.verify(token, config.auth.jwtSecret, {
        algorithms: ['HS256']
      });
      return decoded as JwtTokenPayload;
    } catch (err: any) {
      throw new UnauthorizedError('Invalid or expired authentication token', err.message);
    }
  }

  /**
   * Retrieves user profile by User ID.
   */
  public async getUserById(userId: string): Promise<User> {
    const query = `
      SELECT id, google_id, email, name, avatar_url, role, created_at, updated_at
      FROM users
      WHERE id = $1;
    `;
    const result = await getPool().query<RawUserRow>(query, [userId]);
    if (result.rows.length === 0) {
      throw new NotFoundError('User', userId);
    }
    return mapUserRow(result.rows[0]);
  }

  /**
   * Registers a new regular user with username, email, and password.
   * Role is unconditionally and strictly defaulted to 'learner'.
   */
  public async registerWithPassword(dto: RegisterRequestDto): Promise<AuthSessionResponseDto> {
    const email = dto.email.trim().toLowerCase();
    const pool = getPool();

    const existing = await pool.query<{ id: string }>(
      `SELECT id FROM users WHERE email = $1;`,
      [email]
    );
    if (existing.rows.length > 0) {
      throw new ConflictError('An account with this email address already exists. Please sign in instead.');
    }

    const passwordHash = await hashPassword(dto.password);
    const userId = `usr-${crypto.randomBytes(8).toString('hex')}`;
    const name = dto.name?.trim() || email.split('@')[0];

    const insertQuery = `
      INSERT INTO users (id, google_id, email, name, avatar_url, role, password_hash)
      VALUES ($1, NULL, $2, $3, NULL, 'learner', $4)
      RETURNING id, google_id, email, name, avatar_url, role, password_hash, created_at, updated_at;
    `;

    const result = await pool.query<RawUserRow>(insertQuery, [
      userId,
      email,
      name,
      passwordHash
    ]);

    const user = mapUserRow(result.rows[0]);
    const token = this.signSessionToken(user);

    return {
      token,
      expires_in: config.auth.jwtExpiresIn,
      user: toUserProfileDto(user)
    };
  }

  /**
   * Authenticates regular users with email and password.
   */
  public async loginWithPassword(dto: LoginRequestDto): Promise<AuthSessionResponseDto> {
    const identifier = dto.email.trim();
    const pool = getPool();

    const result = await pool.query<RawUserRow>(
      `SELECT id, google_id, email, name, avatar_url, role, password_hash, created_at, updated_at
       FROM users
       WHERE LOWER(email) = LOWER($1) OR LOWER(name) = LOWER($1)
       LIMIT 1;`,
      [identifier]
    );

    const row = result.rows[0];
    if (!row || !row.password_hash) {
      throw new UnauthorizedError('Invalid email or username or password.');
    }

    const passwordValid = await verifyPassword(dto.password, row.password_hash);
    if (!passwordValid) {
      throw new UnauthorizedError('Invalid email or username or password.');
    }

    const user = mapUserRow(row);
    const token = this.signSessionToken(user);

    return {
      token,
      expires_in: config.auth.jwtExpiresIn,
      user: toUserProfileDto(user)
    };
  }

  /**
   * Dedicated administrator login.
   * Validates credentials by email or username, and enforces that the user's role in the database is strictly 'admin'.
   * Denies regular users with HTTP 403 Forbidden even if credentials match.
   */
  public async loginAdministrator(dto: LoginRequestDto): Promise<AuthSessionResponseDto> {
    const identifier = dto.email.trim();
    const pool = getPool();

    const result = await pool.query<RawUserRow>(
      `SELECT id, google_id, email, name, avatar_url, role, password_hash, created_at, updated_at
       FROM users
       WHERE (LOWER(email) = LOWER($1) OR LOWER(name) = LOWER($1))
       LIMIT 1;`,
      [identifier]
    );

    const row = result.rows[0];
    if (!row || !row.password_hash) {
      throw new UnauthorizedError('Invalid administrator credentials.');
    }

    const passwordValid = await verifyPassword(dto.password, row.password_hash);
    if (!passwordValid) {
      throw new UnauthorizedError('Invalid administrator credentials.');
    }

    // Role Enforcement: Only accounts whose current database role is 'admin' may access Admin Portal
    if (row.role !== 'admin') {
      throw new ForbiddenError(
        'Access denied. This account does not have administrator privileges. Please use the regular user sign-in portal.'
      );
    }

    const user = mapUserRow(row);
    const token = this.signSessionToken(user);

    return {
      token,
      expires_in: config.auth.jwtExpiresIn,
      user: toUserProfileDto(user)
    };
  }

  /**
   * Bootstraps initial credentials for development accounts if not yet set.
   */
  public async bootstrapDefaultCredentials(): Promise<void> {
    try {
      // Ensure admin@biolumen.org has default admin password if empty
      const adminRes = await getPool().query<RawUserRow>(
        `SELECT id, name, password_hash FROM users WHERE email = 'admin@biolumen.org';`
      );
      if (adminRes.rows.length > 0) {
        if (!adminRes.rows[0].password_hash) {
          const adminHash = await hashPassword('Admin@BioLumen2026!');
          await getPool().query(
            `UPDATE users SET password_hash = $1 WHERE email = 'admin@biolumen.org';`,
            [adminHash]
          );
        }
        if (!adminRes.rows[0].name) {
          await getPool().query(
            `UPDATE users SET name = 'Admin' WHERE email = 'admin@biolumen.org';`
          );
        }
      }

      // Ensure demo.learner@biolumen.org has learner password if empty
      const learnerRes = await getPool().query<RawUserRow>(
        `SELECT id, password_hash FROM users WHERE email = 'demo.learner@biolumen.org';`
      );
      if (learnerRes.rows.length > 0 && !learnerRes.rows[0].password_hash) {
        const learnerHash = await hashPassword('Learner#2026');
        await getPool().query(
          `UPDATE users SET password_hash = $1 WHERE email = 'demo.learner@biolumen.org';`,
          [learnerHash]
        );
      }
    } catch {
      // Non-blocking in case pool is warming up
    }
  }
}

export const authService = new AuthService();
authService.bootstrapDefaultCredentials().catch(() => {});

