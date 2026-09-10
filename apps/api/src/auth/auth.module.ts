import { Module, Provider } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from '../prisma/prisma.module.js';
import { PasswordService } from './password.service.js';
import { TokenService } from './token.service.js';
import { AuthService } from './auth.service.js';
import { JwtStrategy } from './jwt.strategy.js';
import { GithubStrategy } from './github.strategy.js';
import { GoogleStrategy } from './google.strategy.js';
import { AuthController } from './auth.controller.js';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../config/configuration.js';

function oauthStrategyProviders(): Provider[] {
  const githubProvider: Provider = {
    provide: GithubStrategy,
    inject: [ConfigService, AuthService],
    useFactory: (
      config: ConfigService<AppConfig, true>,
      authService: AuthService,
    ) => {
      const enabled = Boolean(config.get('auth', { infer: true }).oauth.github);
      return enabled ? new GithubStrategy(config, authService) : null;
    },
  };
  const googleProvider: Provider = {
    provide: GoogleStrategy,
    inject: [ConfigService, AuthService],
    useFactory: (
      config: ConfigService<AppConfig, true>,
      authService: AuthService,
    ) => {
      const enabled = Boolean(config.get('auth', { infer: true }).oauth.google);
      return enabled ? new GoogleStrategy(config, authService) : null;
    },
  };
  return [githubProvider, googleProvider];
}

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    PasswordService,
    TokenService,
    AuthService,
    JwtStrategy,
    ...oauthStrategyProviders(),
  ],
  exports: [AuthService, TokenService],
})
export class AuthModule {}
