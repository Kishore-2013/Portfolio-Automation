import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '@/shared/database';
import { ConflictError, UnauthorizedError, RateLimitError } from '@/shared/shared-utils';
import { RegisterInput, LoginInput } from '@/shared/validation';
import { AuthTokens, UserDTO } from '@/shared/types';
import { v4 as uuidv4 } from 'uuid';
import { RedisService } from './redis.service';

export class AuthService {
  private static readonly ACCESS_TOKEN_EXPIRY = '1h';
  private static readonly REFRESH_TOKEN_EXPIRY = '7d';

  static async register(input: RegisterInput): Promise<{ user: UserDTO; tokens: AuthTokens }> {
    const { email, password, name } = input;

    // 1. Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    // 2. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 3. Create user
    const { data: user, error: createError } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        name,
      })
      .select()
      .single();

    if (createError || !user) {
      throw new ConflictError('Could not create user: ' + createError?.message);
    }

    // 4. Generate tokens
    const tokens = this.generateTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: new Date(user.created_at),
      },
      tokens,
    };
  }

  static async login(input: LoginInput, ip: string): Promise<{ user: UserDTO; tokens: AuthTokens }> {
    const { email, password } = input;

    // 1. Check fail counter in Redis
    const failCount = await RedisService.getLoginFailCount(ip);
    if (failCount >= 5) {
      throw new RateLimitError('Too many failed attempts. Please try again in 15 minutes.');
    }

    // 2. Find user
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    // 3. Verify password
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      await RedisService.incrementLoginFail(ip);
      throw new UnauthorizedError('Invalid credentials');
    }

    // 4. Generate tokens
    const tokens = this.generateTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: new Date(user.created_at),
      },
      tokens,
    };
  }

  static generateTokens(userId: number | string, email: string): AuthTokens {
    const accessToken = jwt.sign(
      { userId, email, jti: uuidv4() },
      process.env.JWT_SECRET!,
      { expiresIn: this.ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { userId, email, jti: uuidv4() },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: this.REFRESH_TOKEN_EXPIRY }
    );

    return { accessToken, refreshToken };
  }


  static async logout(jti: string, exp: number): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    const remainingSeconds = exp - now;

    if (remainingSeconds > 0) {
      await RedisService.blacklistToken(jti, remainingSeconds);
    }
  }

  static async refresh(token: string): Promise<{ accessToken: string }> {
    try {
      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as any;

      // Check if blacklisted
      const isBlacklisted = await RedisService.isTokenBlacklisted(payload.jti);
      if (isBlacklisted) {
        throw new UnauthorizedError('Token blacklisted');
      }

      // Generate new access token
      const accessToken = jwt.sign(
        { userId: payload.userId, email: payload.email, jti: uuidv4() },
        process.env.JWT_SECRET!,
        { expiresIn: this.ACCESS_TOKEN_EXPIRY }
      );

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }
}
