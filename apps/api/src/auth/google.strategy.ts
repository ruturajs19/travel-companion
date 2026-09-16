import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {
  type Profile,
  Strategy,
  type VerifyCallback,
} from 'passport-google-oauth20';
import type { AppConfig } from '../config/configuration.js';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service.js';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    config: ConfigService<AppConfig, true>,
    private readonly authService: AuthService,
  ) {
    const google = config.get('auth', { infer: true }).oauth.google;

    super({
      clientID: google?.clientId ?? 'missing',
      clientSecret: google?.clientSecret ?? 'missing',
      callbackURL: google?.callbackUrl ?? 'missing',
      scope: ['profile', 'email'],
    });
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    const email = profile.emails?.[0]?.value;

    if (!email) {
      done(
        new UnauthorizedException('Google account must have a verified email'),
      );
      return;
    }

    const result = await this.authService.validateOAuthLogin({
      provider: 'google',
      providerAccountId: profile.id,
      email,
      name: profile.displayName ?? null,
      image: profile.photos?.[0]?.value ?? null,
    });
    done(null, result);
  }
}
