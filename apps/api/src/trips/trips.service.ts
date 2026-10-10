import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { AiService } from '../ai/ai.service.js';
import type {
  Trip,
  GenerateItineraryRequest,
  TripSummary,
} from '@travel-companion/contracts';

type TripWithGraph = Prisma.TripGetPayload<{
  include: {
    days: { include: { activities: true } };
  };
}>;

@Injectable()
export class TripsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  private toTrip(trip: TripWithGraph): Trip {
    return {
      id: trip.id,
      ownerId: trip.ownerId,
      title: trip.title,
      destination: trip.destination,
      startDate: trip.startDate?.toISOString() ?? null,
      endDate: trip.endDate?.toISOString() ?? null,
      budgetLevel: trip.budgetLevel,
      interests: trip.interests,
      visibility: trip.visibility,
      sourceTripId: trip.sourceTripId,
      createdAt: trip.createdAt.toISOString(),
      updatedAt: trip.updatedAt.toISOString(),
      days: [...trip.days]
        .sort((a, b) => a.dayNumber - b.dayNumber)
        .map((day) => ({
          id: day.id,
          dayNumber: day.dayNumber,
          date: day.date?.toISOString() ?? null,
          summary: day.summary,
          activities: [...day.activities]
            .sort((a, b) => a.order - b.order)
            .map((act) => ({
              id: act.id,
              title: act.title,
              order: act.order,
              timeSlot: act.timeSlot,
              locationName: act.locationName,
              lat: act.lat,
              lng: act.lng,
              notes: act.notes,
              estimatedCost: act.estimatedCost,
            })),
        })),
    };
  }

  async generateAndSave(
    ownerId: string,
    input: GenerateItineraryRequest,
  ): Promise<Trip> {
    const generated = await this.ai.generateItinerary({
      destination: input.destination,
      durationDays: input.durationDays,
      interests: input.interests,
      budgetLevel: input.budgetLevel,
      notes: input.notes,
    });

    const created = await this.prisma.trip.create({
      data: {
        ownerId,
        destination: generated.destination,
        title: generated.title,
        budgetLevel: input.budgetLevel,
        interests: input.interests,
        days: {
          create: generated.days.map((day) => ({
            dayNumber: day.dayNumber,
            summary: day.summary ?? null,
            activities: {
              create: day.activities.map((act, index) => ({
                title: act.title,
                order: index,
                timeSlot: act.timeSlot ?? null,
                locationName: act.locationName ?? null,
                notes: act.notes,
                estimatedCost: act.estimatedCost ?? null,
              })),
            },
          })),
        },
      },
      include: { days: { include: { activities: true } } },
    });

    return this.toTrip(created);
  }

  async getTrip(userId: string, tripId: string): Promise<Trip> {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: { days: { include: { activities: true } } },
    });
    if (!trip) throw new NotFoundException('Trip not found');
    const isOwner = trip.ownerId === userId;
    if (!isOwner && trip.visibility === 'PRIVATE') {
      throw new NotFoundException('Trip not found');
    }
    return this.toTrip(trip);
  }

  async listMyTrips(ownerId: string): Promise<TripSummary[]> {
    const trips = await this.prisma.trip.findMany({
      where: { ownerId },
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { days: true } } },
    });
    return trips.map((trip) => ({
      id: trip.id,
      title: trip.title,
      destination: trip.destination,
      startDate: trip.startDate?.toISOString() ?? null,
      endDate: trip.endDate?.toISOString() ?? null,
      visibility: trip.visibility,
      dayCount: trip._count.days,
      updatedAt: trip.updatedAt.toISOString(),
    }));
  }

  async remixTrip(userId: string, tripId: string): Promise<Trip> {
    const source = await this.prisma.trip.findUnique({
      where: { id: tripId },
      include: { days: { include: { activities: true } } },
    });
    if (!source) throw new NotFoundException('Trip not found');

    const isOwner = source.ownerId === userId;
    if (!isOwner && source.visibility === 'PRIVATE') {
      throw new NotFoundException('Trip not found');
    }

    const orderedDays = [...source.days].sort(
      (a, b) => a.dayNumber - b.dayNumber,
    );
    const created = await this.prisma.trip.create({
      data: {
        ownerId: userId,
        destination: source.destination,
        title: `${source.title} (remix)`,
        budgetLevel: source.budgetLevel,
        interests: source.interests,
        visibility: 'PRIVATE',
        sourceTripId: source.id,
        days: {
          create: orderedDays.map((day) => ({
            dayNumber: day.dayNumber,
            summary: day.summary,
            activities: {
              create: [...day.activities]
                .sort((a, b) => a.order - b.order)
                .map((act) => ({
                  title: act.title,
                  order: act.order,
                  timeSlot: act.timeSlot,
                  locationName: act.locationName,
                  lat: act.lat,
                  lng: act.lng,
                  notes: act.notes,
                  estimatedCost: act.estimatedCost ?? null,
                })),
            },
          })),
        },
      },
      include: { days: { include: { activities: true } } },
    });
    return this.toTrip(created);
  }

  async deleteTrip(userId: string, tripId: string): Promise<void> {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
    });
    if (!trip) throw new NotFoundException('Trip not found');
    if (trip.ownerId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this trip',
      );
    }
    await this.prisma.trip.delete({
      where: { id: tripId },
    });
  }
}
