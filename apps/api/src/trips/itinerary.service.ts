import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { AiService } from '../ai/ai.service.js';
import type {
  ActivityInput,
  DayInput,
  UpdateActivityRequest,
} from '@travel-companion/contracts';
import { assertCanEditTrip } from './trip-access.js';

@Injectable()
export class ItineraryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  private touchTrip(tripId: string) {
    return this.prisma.trip.update({
      where: { id: tripId },
      data: { updatedAt: new Date() },
    });
  }

  private async tripIdForDay(dayId: string): Promise<string> {
    const day = await this.prisma.itineraryDay.findUniqueOrThrow({
      where: { id: dayId },
      select: { tripId: true },
    });
    return day.tripId;
  }

  private async tripIdForActivity(activityId: string): Promise<string> {
    const activity = await this.prisma.activity.findUnique({
      where: { id: activityId },
      select: { day: { select: { tripId: true } } },
    });
    if (!activity || !activity.day) {
      throw new NotFoundException('Activity not found');
    }
    return activity.day.tripId;
  }

  async addDay(
    userId: string,
    tripId: string,
    input: DayInput,
  ): Promise<{ id: string }> {
    await assertCanEditTrip(this.prisma, userId, tripId);

    const max = await this.prisma.itineraryDay.aggregate({
      where: { tripId },
      _max: { dayNumber: true },
    });
    const dayNumber = (max._max.dayNumber ?? 0) + 1;
    const day = await this.prisma.itineraryDay.create({
      data: {
        tripId,
        dayNumber,
        summary: input.summary ?? null,
      },
      select: {
        id: true,
      },
    });
    await this.touchTrip(tripId);
    return day;
  }

  async updateDay(
    userId: string,
    dayId: string,
    input: DayInput,
  ): Promise<void> {
    const tripId = await this.tripIdForDay(dayId);
    await assertCanEditTrip(this.prisma, userId, tripId);

    await this.prisma.itineraryDay.update({
      where: { id: dayId },
      data: {
        summary: input.summary ?? null,
      },
    });
    await this.touchTrip(tripId);
  }

  async deleteDay(userId: string, dayId: string): Promise<void> {
    const tripId = await this.tripIdForDay(dayId);
    await assertCanEditTrip(this.prisma, userId, tripId);

    await this.prisma.itineraryDay.delete({
      where: { id: dayId },
    });
    await this.touchTrip(tripId);
  }

  async reorderDays(
    userId: string,
    tripId: string,
    orderedIds: string[],
  ): Promise<void> {
    await assertCanEditTrip(this.prisma, userId, tripId);

    const days = await this.prisma.itineraryDay.findMany({
      where: { tripId },
      select: { id: true },
    });

    const existing = new Set(days.map((d) => d.id));
    if (
      orderedIds.length !== existing.size ||
      !orderedIds.every((id) => existing.has(id))
    ) {
      throw new BadRequestException(
        'orderedIds must list exactly the trip days',
      );
    }

    await this.prisma.$transaction([
      ...orderedIds.map((id, index) =>
        this.prisma.itineraryDay.update({
          where: { id },
          data: { dayNumber: index + 1 },
        }),
      ),
      this.touchTrip(tripId),
    ]);
  }

  async refineDay(
    userId: string,
    dayId: string,
    instruction: string,
  ): Promise<void> {
    const day = await this.prisma.itineraryDay.findUnique({
      where: { id: dayId },
      select: {
        tripId: true,
        dayNumber: true,
        trip: { select: { destination: true } },
        activities: {
          select: {
            timeSlot: true,
            title: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!day) throw new NotFoundException('Day not found');
    await assertCanEditTrip(this.prisma, userId, day.tripId);

    const refined = await this.ai.refineItineraryPart({
      destination: day.trip.destination,
      dayNumber: day.dayNumber,
      currentActivities: day.activities.map((a) => ({
        timeSlot: a.timeSlot,
        title: a.title,
      })),
      instruction,
    });
    await this.prisma.$transaction([
      this.prisma.activity.deleteMany({
        where: { dayId },
      }),
      this.prisma.itineraryDay.update({
        where: { id: dayId },
        data: {
          summary: refined.summary ?? null,
          activities: {
            create: refined.activities.map((act, index) => ({
              order: index,
              timeSlot: act.timeSlot ?? null,
              title: act.title,
              locationName: act.locationName ?? null,
              notes: act.notes ?? null,
              estimatedCost: act.estimatedCost ?? null,
            })),
          },
        },
      }),
      this.touchTrip(day.tripId),
    ]);
  }

  async addActivity(
    userId: string,
    dayId: string,
    input: ActivityInput,
  ): Promise<{ id: string }> {
    const tripId = await this.tripIdForDay(dayId);
    await assertCanEditTrip(this.prisma, userId, tripId);
    const max = await this.prisma.activity.aggregate({
      where: { dayId },
      _max: { order: true },
    });
    const order = (max._max.order ?? -1) + 1;
    const activity = await this.prisma.activity.create({
      data: {
        dayId,
        order,
        timeSlot: input.timeSlot ?? null,
        title: input.title,
        locationName: input.locationName ?? null,
        notes: input.notes ?? null,
        estimatedCost: input.estimatedCost ?? null,
      },
      select: {
        id: true,
      },
    });
    await this.touchTrip(tripId);
    return activity;
  }

  async updateActivity(
    userId: string,
    activityId: string,
    input: UpdateActivityRequest,
  ): Promise<void> {
    const tripId = await this.tripIdForActivity(activityId);
    await assertCanEditTrip(this.prisma, userId, tripId);
    await this.prisma.activity.update({
      where: { id: activityId },
      data: {
        ...(input.timeSlot !== undefined ? { timeSlot: input.timeSlot } : {}),
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.locationName !== undefined
          ? { locationName: input.locationName }
          : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        ...(input.estimatedCost !== undefined
          ? { estimatedCost: input.estimatedCost }
          : {}),
      },
    });
    await this.touchTrip(tripId);
  }

  async deleteActivity(userId: string, activityId: string): Promise<void> {
    const tripId = await this.tripIdForActivity(activityId);
    await assertCanEditTrip(this.prisma, userId, tripId);
    await this.prisma.activity.delete({
      where: { id: activityId },
    });
    await this.touchTrip(tripId);
  }

  async reorderActivities(
    userId: string,
    dayId: string,
    orderedIds: string[],
  ): Promise<void> {
    const tripId = await this.tripIdForDay(dayId);
    await assertCanEditTrip(this.prisma, userId, tripId);
    const activities = await this.prisma.activity.findMany({
      where: { dayId },
      select: { id: true },
    });
    const existing = new Set(activities.map((a) => a.id));
    if (
      orderedIds.length !== existing.size ||
      !orderedIds.every((id) => existing.has(id))
    ) {
      throw new BadRequestException(
        'orderedIds must list exactly the day activities',
      );
    }
    await this.prisma.$transaction([
      ...orderedIds.map((id, index) =>
        this.prisma.activity.update({
          where: { id },
          data: { order: index },
        }),
      ),
      this.touchTrip(tripId),
    ]);
  }
}
