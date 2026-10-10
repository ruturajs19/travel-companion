import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type {
  Comment,
  CreateCommentRequest,
  FollowStatus,
  LikeStatus,
  PostStats,
} from '@travel-companion/contracts';
import { Prisma } from '@prisma/client';

@Injectable()
export class SocialService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertPostVisible(postId: string): Promise<void> {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: { status: true },
    });

    if (!post || post.status !== 'PUBLISHED')
      throw new NotFoundException('Post not found');
  }

  async likeStatus(userId: string, postId: string): Promise<LikeStatus> {
    await this.assertPostVisible(postId);
    const [liked, count] = await Promise.all([
      this.prisma.like.findUnique({
        where: {
          userId_postId: { userId, postId },
        },
      }),
      this.prisma.like.count({ where: { postId } }),
    ]);

    return {
      liked: liked !== null,
      count,
    };
  }

  async toggleLike(userId: string, postId: string): Promise<LikeStatus> {
    await this.assertPostVisible(postId);

    const existing = await this.prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      await this.prisma.like
        .delete({
          where: { userId_postId: { userId, postId } },
        })
        .catch((error: unknown) => {
          if (!(
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025'
          )) {
            throw error;
          }
        });
    } else {
      await this.prisma.like
        .create({
          data: { userId, postId },
        })
        .catch((error: unknown) => {
          if (!(
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
          )) {
            throw error;
          }
        });
    }
    const [liked, count] = await Promise.all([
      this.prisma.like.findUnique({
        where: {
          userId_postId: { userId, postId },
        },
      }),
      this.prisma.like.count({ where: { postId } }),
    ]);

    return {
      liked: liked !== null,
      count,
    };
  }

  async postStats(postId: string): Promise<PostStats> {
    await this.assertPostVisible(postId);
    const [likeCount, commentCount] = await Promise.all([
      this.prisma.like.count({ where: { postId } }),
      this.prisma.comment.count({ where: { postId } }),
    ]);

    return {
      likeCount,
      commentCount,
    };
  }

  async addComment(
    userId: string,
    postId: string,
    input: CreateCommentRequest,
  ): Promise<Comment> {
    await this.assertPostVisible(postId);
    const comment = await this.prisma.comment.create({
      data: { postId, authorId: userId, body: input.body },
      include: { author: { select: { name: true } } },
    });
    return {
      id: comment.id,
      postId: comment.postId,
      authorId: comment.authorId,
      authorName: comment.author.name,
      body: comment.body,
      createdAt: comment.createdAt.toISOString(),
    };
  }

  async listComments(postId: string): Promise<Comment[]> {
    await this.assertPostVisible(postId);
    const comments = await this.prisma.comment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      include: { author: { select: { name: true } } },
    });
    return comments.map((c) => ({
      id: c.id,
      postId: c.postId,
      authorId: c.authorId,
      authorName: c.author.name,
      body: c.body,
      createdAt: c.createdAt.toISOString(),
    }));
  }

  private async followCounts(userId: string): Promise<{
    followerCount: number;
    followingCount: number;
  }> {
    const [followerCount, followingCount] = await Promise.all([
      this.prisma.follow.count({ where: { followingId: userId } }),
      this.prisma.follow.count({ where: { followerId: userId } }),
    ]);

    return {
      followerCount,
      followingCount,
    };
  }

  async followStatus(
    followerId: string,
    targetId: string,
  ): Promise<FollowStatus> {
    const target = await this.prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true },
    });

    if (!target) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId: targetId } },
    });
    const counts = await this.followCounts(targetId);

    return { following: existing !== null, ...counts };
  }

  async toggleFollow(
    followerId: string,
    targetId: string,
  ): Promise<FollowStatus> {
    if (followerId === targetId) {
      throw new BadRequestException('User cannot follow themselves');
    }
    const target = await this.prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true },
    });

    if (!target) {
      throw new NotFoundException('User not found');
    }
    const existing = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId: targetId } },
    });

    if (existing) {
      await this.prisma.follow
        .delete({
          where: {
            followerId_followingId: { followerId, followingId: targetId },
          },
        })
        .catch((error: unknown) => {
          if (!(
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025'
          )) {
            throw error;
          }
        });
    } else {
      await this.prisma.follow
        .create({
          data: { followerId, followingId: targetId },
        })
        .catch((error: unknown) => {
          if (!(
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
          )) {
            throw error;
          }
        });
    }

    const following = await this.prisma.follow.findUnique({
      where: { followerId_followingId: { followerId, followingId: targetId } },
    });
    const counts = await this.followCounts(targetId);
    return { following: following !== null, ...counts };
  }
}
