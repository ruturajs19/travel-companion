import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AuthTokens,
  UserProfile,
  RegisterRequest,
  LoginRequest,
} from '@travel-companion/contracts';
import type { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { PasswordService } from './password.service.js';
import { TokenService } from './token.service.js';

export interface AuthResult {
  user: UserProfile;
  tokens: AuthTokens;
}

export interface OAuthProfile {
  provider: 'github' | 'google';
  providerAccountId: string;
  email: string;
  name?: string | null;
  image?: string | null;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
    private readonly tokens: TokenService,
  ) {}

  private toProfile(user: User): UserProfile {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      bio: user.bio,
      homeLocation: user.homeLocation,
      createdAt: user.createdAt.toISOString(),
    };
  }

  async register(input: RegisterRequest): Promise<AuthResult> {
    const email = input.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existing) {
      throw new ConflictException('An Account with this email already exists');
    }
    const passwordHash = await this.passwords.hash(input.password);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        name: input.name ?? null,
      },
    });
    const tokens = await this.tokens.issueTokens({
      id: user.id,
      email: user.email,
    });
    return { user: this.toProfile(user), tokens };
  }

  async login(input: LoginRequest): Promise<AuthResult> {
    const email = input.email.toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await this.passwords.verify(
      user.passwordHash,
      input.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const tokens = await this.tokens.issueTokens({
      id: user.id,
      email: user.email,
    });
    return { user: this.toProfile(user), tokens };
  }

  async validateOAuthLogin(profile: OAuthProfile): Promise<AuthResult> {
    const email = profile.email.toLowerCase();
    const linked = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: profile.provider,
          providerAccountId: profile.providerAccountId,
        },
      },
      include: {
        user: true,
      },
    });
    if (linked) {
      const tokens = await this.tokens.issueTokens({
        id: linked.user.id,
        email: linked.user.email,
      });
      return { user: this.toProfile(linked.user), tokens };
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      await this.prisma.oAuthAccount.create({
        data: {
          userId: existingUser.id,
          provider: profile.provider,
          providerAccountId: profile.providerAccountId,
        },
      });
      const tokens = await this.tokens.issueTokens({
        id: existingUser.id,
        email: existingUser.email,
      });
      return { user: this.toProfile(existingUser), tokens };
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        name: profile.name ?? null,
        image: profile.image ?? null,
        emailVerified: new Date(),
        oauthAccounts: {
          create: {
            provider: profile.provider,
            providerAccountId: profile.providerAccountId,
          },
        },
      },
    });
    const tokens = await this.tokens.issueTokens({
      id: user.id,
      email: user.email,
    });
    return { user: this.toProfile(user), tokens };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    return this.tokens.rotateRefreshToken(refreshToken);
  }

  async logout(refreshToken: string): Promise<void> {
    await this.tokens.revokeRefreshToken(refreshToken);
  }
}
