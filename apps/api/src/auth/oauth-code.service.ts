import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AuthTokens } from '@travel-companion/contracts';
import { randomBytes } from 'node:crypto';

const CODE_TTL_SECONDS = 60; // codes expire after 60 seconds

@Injectable()
export class OAuthCodeService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Store tokens behind a one-time code. Returns the opaque code string.
   * The code expires after CODE_TTL_SECONDS and can only be redeemed once.
   */
  async issueCode(tokens: AuthTokens): Promise<string> {
    const code = randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + CODE_TTL_SECONDS * 1000);
    await this.prisma.oAuthCode.create({
      data: {
        code,
        payload: tokens as object,
        expiresAt,
      },
    });
    return code;
  }

  /**
   * Redeem a code, returning the stored tokens and deleting the record.
   * Throws NotFoundException if the code is missing or expired.
   */
  async redeemCode(code: string): Promise<AuthTokens> {
    const record = await this.prisma.oAuthCode.findUnique({ where: { code } });
    if (!record || record.expiresAt <= new Date()) {
      // Delete if expired but present
      if (record) {
        await this.prisma.oAuthCode.delete({ where: { code } }).catch(() => undefined);
      }
      throw new NotFoundException('Invalid or expired OAuth code');
    }
    await this.prisma.oAuthCode.delete({ where: { code } });
    return record.payload as unknown as AuthTokens;
  }
}
