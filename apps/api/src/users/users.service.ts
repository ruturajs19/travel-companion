import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { User } from '@prisma/client';
import { UpdateProfileRequest, UserProfile } from '@travel-companion/contracts';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  private toProfile(user: User): UserProfile {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      createdAt: user.createdAt.toISOString(),
      bio: user.bio,
      homeLocation: user.homeLocation,
    };
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    return this.toProfile(user);
  }

  async updateProfile(
    userId: string,
    input: UpdateProfileRequest,
  ): Promise<UserProfile> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: input.name,
        bio: input.bio,
        image: input.image,
        homeLocation: input.homeLocation,
      },
    });
    return this.toProfile(user);
  }
}
