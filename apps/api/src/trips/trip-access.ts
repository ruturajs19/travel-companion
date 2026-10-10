import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service.js';

export async function assertCanEditTrip(
  prisma: PrismaService,
  userId: string,
  tripId: string,
): Promise<{ ownerId: string }> {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: {
      ownerId: true,
      collaborators: { where: { userId }, select: { role: true } },
    },
  });

  if (!trip) {
    throw new NotFoundException('Trip not found');
  }

  const isOwner = trip.ownerId === userId;
  const isEditor = trip.collaborators.some((c) => c.role === 'EDITOR');

  if (!isOwner && !isEditor) {
    throw new ForbiddenException(
      'You do not have permission to edit this trip',
    );
  }

  return { ownerId: trip.ownerId };
}

export async function assertOwnsTrip(
  prisma: PrismaService,
  userId: string,
  tripId: string,
): Promise<void> {
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: { ownerId: true },
  });

  if (!trip) {
    throw new NotFoundException('Trip not found');
  }

  if (trip.ownerId !== userId) {
    throw new ForbiddenException('Only the trip owner can perform this action');
  }
}
