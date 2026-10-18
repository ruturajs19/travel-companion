import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  loginRequestSchema,
  type RefreshRequest,
  registerRequestSchema,
  refreshRequestSchema,
  type LoginRequest,
  type RegisterRequest,
  AuthTokens,
} from '@travel-companion/contracts';
import { ConfigService } from '@nestjs/config';
import { AuthService, type AuthResult } from './auth.service.js';
import { AppConfig } from '../config/configuration.js';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe.js';
import type { AuthenticatedUser } from './jwt.strategy.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { CurrentUser } from './current-user.decorator.js';
import { GoogleAuthGuard } from './oauth.guards.js';
import { OAuthCodeService } from './oauth-code.service.js';

@Controller({ version: '1', path: 'auth' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService<AppConfig, true>,
    private readonly oauthCodes: OAuthCodeService,
  ) {}

  private async redirectWithTokens(res: Response, req: Request): Promise<void> {
    const { successRedirect, failureRedirect } = this.config.get('auth', {
      infer: true,
    }).oauth;
    const result = req.user as AuthResult | undefined;
    if (!result) {
      res.redirect(failureRedirect);
      return;
    }
    // Issue a short-lived one-time code instead of putting tokens in the URL.
    // The web /auth/callback page exchanges this code for tokens via GET /auth/exchange/:code.
    const code = await this.oauthCodes.issueCode(result.tokens);
    res.redirect(`${successRedirect}?code=${encodeURIComponent(code)}`);
  }

  @Get('exchange/:code')
  async exchangeCode(
    @Param('code') code: string,
  ): Promise<AuthTokens> {
    return this.oauthCodes.redeemCode(code);
  }

  @Post('register')
  register(
    @Body(new ZodValidationPipe(registerRequestSchema)) body: RegisterRequest,
  ): Promise<AuthResult> {
    return this.authService.register(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(
    @Body(new ZodValidationPipe(loginRequestSchema)) body: LoginRequest,
  ): Promise<AuthResult> {
    return this.authService.login(body);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(
    @Body(new ZodValidationPipe(refreshRequestSchema)) body: RefreshRequest,
  ): Promise<AuthTokens> {
    return this.authService.refresh(body.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(
    @Body(new ZodValidationPipe(refreshRequestSchema)) body: RefreshRequest,
  ): Promise<void> {
    return this.authService.logout(body.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthenticatedUser): { id: string; email: string } {
    return { id: user.id, email: user.email };
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  googleStart(): void {}

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  googleCallback(@Req() req: Request, @Res() res: Response): void {
    this.redirectWithTokens(res, req);
  }
}
