import {
  type ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { AppConfig } from '../config/configuration.js';

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
