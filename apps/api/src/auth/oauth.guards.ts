import {
  type ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { AppConfig } from '../config/configuration.js';
import { Observable } from 'rxjs';

@Injectable()
export class GithubAuthGuard extends AuthGuard('github') {
  constructor(private readonly config: ConfigService<AppConfig, true>) {
    super();
  }

  override canActivate(context: ExecutionContext) {
    if (!this.config.get('auth', { infer: true }).oauth.github) {
      throw new NotFoundException('Github sign in is disabled.');
    }
    return super.canActivate(context);
  }
}

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  constructor(private readonly config: ConfigService<AppConfig, true>) {
    super();
  }

  override canActivate(context: ExecutionContext) {
    if (!this.config.get('auth', { infer: true }).oauth.google) {
      throw new NotFoundException('Google sign in is disabled.');
    }
    return super.canActivate(context);
  }
}
