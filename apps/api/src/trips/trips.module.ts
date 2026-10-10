import { Module } from '@nestjs/common';
import { TripsController } from './trips.controller.js';
import { TripsService } from './trips.service.js';
import { PassportModule } from '@nestjs/passport';
import { AiModule } from '../ai/ai.module.js';
import { CollaboratorsController } from './collaborators.controller.js';
import { CollaboratorsService } from './collaborators.service.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), AiModule],
  controllers: [TripsController, CollaboratorsController],
  providers: [TripsService, CollaboratorsService],
  exports: [TripsService, CollaboratorsService],
})
export class TripsModule {}
