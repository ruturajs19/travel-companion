import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service.js';
import type {
  CollaboratorRole,
  Trip,
  TripCollaborator,
} from '@travel-companion/contracts';
import { assertOwnsTrip } from './trip-access.js';

@Injectable()
export class CollaboratorsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, tripId: string): Promise<TripCollaborator[]> {
    const trip = await this.prisma.trip.findUnique({
      where: { id: tripId },
      select: {
        ownerId: true,
        collaborators: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    const isOwner = trip.ownerId === userId;
    const isCollaborator = trip.collaborators.some((c) => c.userId === userId);

    if (!isOwner && !isCollaborator) {
      throw new ForbiddenException('You do not have access to this trip');
    }

    return trip.collaborators.map((c) => ({
      userId: c.userId,
      name: c.user.name,
      email: c.user.email,
      role: c.role,
    }));
  }

  async invite(
    ownerId: string,
    tripId: string,
    email: string,
    role: CollaboratorRole,
  ): Promise<TripCollaborator> {
    await assertOwnsTrip(this.prisma, ownerId, tripId);
    const invitee = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, name: true, email: true },
    });
    if (!invitee) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    if (invitee.id === ownerId) {
      throw new BadRequestException('You already own this trip');
    }

    await this.prisma.tripCollaborator.upsert({
      where: { tripId_userId: { tripId, userId: invitee.id } },
      create: {
        tripId,
        userId: invitee.id,
        role,
      },
      update: {
        role,
      },
    });
    return {
      userId: invitee.id,
      name: invitee.name,
      email: invitee.email,
      role,
    };
  }

  async remove(ownerId: string, tripId: string, userId: string) {
    await assertOwnsTrip(this.prisma, ownerId, tripId);
    await this.prisma.tripCollaborator
      .delete({
        where: { tripId_userId: { tripId, userId } },
      })
      .catch(() => undefined);
  }
}
