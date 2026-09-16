import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service.js';
import { VectorService } from './vector.service.js';

@Global()
@Module({
  providers: [PrismaService, VectorService],
  exports: [PrismaService, VectorService],
})
export class PrismaModule {}
