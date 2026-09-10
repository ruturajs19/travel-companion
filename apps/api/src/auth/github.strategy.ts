import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { type Profile, Strategy } from 'passport-github2';
import type { AppConfig } from '../config/configuration.js';
import { ConfigService } from '@nestjs/config';
import { AuthResult, AuthService } from './auth.service.js';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    config: ConfigService<AppConfig, true>,
    private readonly authService: AuthService,
  ) {
    const github = config.get('auth', { infer: true }).oauth.github;

    super({
      clientID: github?.clientId ?? 'missing',
      clientSecret: github?.clientSecret ?? 'missing',
      callbackURL: github?.callbackUrl ?? 'missing',
      scope: ['user:email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ): Promise<AuthResult> {
    const email = profile.emails?.[0]?.value;

    if (!email) {
      throw new UnauthorizedException(
        'Github account must have a verified email',
      );
    }

    return this.authService.validateOAuthLogin({
      provider: 'github',
      providerAccountId: profile.id,
      email,
      name: profile.displayName ?? profile.username ?? null,
      image: profile.photos?.[0]?.value ?? null,
    });
  }
}
