import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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
import { GithubAuthGuard, GoogleAuthGuard } from './oauth.guards.js';

@Controller({ version: '1', path: 'auth' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  private redirectWithTokens(res: Response, req: Request): void {
    const { successRedirect, failureRedirect } = this.config.get('auth', {
      infer: true,
    }).oauth;
    const result = req.user as AuthResult | undefined;
    if (!result) {
      res.redirect(failureRedirect);
      return;
    }
    const params = new URLSearchParams({
      accessToken: result.tokens.accessToken,
      refreshToken: result.tokens.refreshToken,
      expiresIn: String(result.tokens.expiresIn),
    });
    res.redirect(`${successRedirect}?${params.toString()}`);
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

  @Get('github')
  @UseGuards(GithubAuthGuard)
  githubStart(): void {}

  @Get('github/callback')
  @UseGuards(GithubAuthGuard)
  githubCallback(@Req() req: Request, @Res() res: Response): void {
    this.redirectWithTokens(res, req);
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
