import { Module } from '@nestjs/common';
import { TripsController } from './trips.controller.js';
import { TripsService } from './trips.service.js';
import { PassportModule } from '@nestjs/passport';
import { AiModule } from '../ai/ai.module.js';
import { CollaboratorsController } from './collaborators.controller.js';
import { CollaboratorsService } from './collaborators.service.js';
import { ItineraryController } from './itinerary.controller.js';
import { ItineraryService } from './itinerary.service.js';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), AiModule],
  controllers: [TripsController, CollaboratorsController, ItineraryController],
  providers: [TripsService, CollaboratorsService, ItineraryService],
  exports: [TripsService, CollaboratorsService, ItineraryService],
})
export class TripsModule {}
