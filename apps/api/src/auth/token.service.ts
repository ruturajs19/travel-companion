import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../config/configuration.js';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomBytes } from 'node:crypto';
import { AuthTokens } from '@travel-companion/contracts';

export interface AccessTokenPayload {
  sub: string;
  email: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService<AppConfig, true>,
    private readonly prisma: PrismaService,
  ) {}

  private get authConfig() {
    return this.config.get('auth', { infer: true });
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  async signAsAccessToken(payload: AccessTokenPayload): Promise<string> {
    const { accessTokenSecret, accessTokenTtl } = this.authConfig;

    return this.jwt.signAsync(payload, {
      secret: accessTokenSecret,
      expiresIn: accessTokenTtl,
    });
  }

  async issueTokens(user: { id: string; email: string }): Promise<AuthTokens> {
    const { refreshTokenTtl, accessTokenTtl } = this.authConfig;
    const accessToken = await this.signAsAccessToken({
      sub: user.id,
      email: user.email,
    });

    const refreshToken = randomBytes(48).toString('base64url');

    const expiresAt = new Date(Date.now() + refreshTokenTtl * 1000);

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: this.hashToken(refreshToken),
        expiresAt,
        userId: user.id,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: accessTokenTtl,
    };
  }

  async rotateRefreshToken(refreshToken: string): Promise<AuthTokens> {
    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash },
      include: {
        user: true,
      },
    });
    if (
      !stored ||
      stored.revokedAt ||
      stored.expiresAt.getTime() <= Date.now()
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens({ id: stored.user.id, email: stored.user.email });
  }

  async revokeRefreshToken(refreshToken: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
