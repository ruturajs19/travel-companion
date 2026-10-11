import { Module } from '@nestjs/common';
import { SocialService } from './social.service.js';
import { SocialController } from './social.controller.js';
import { PublicSocialController } from './public-social.controller.js';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
  providers: [SocialService],
  controllers: [SocialController, PublicSocialController],
  exports: [SocialService],
})
export class SocialModule {}
