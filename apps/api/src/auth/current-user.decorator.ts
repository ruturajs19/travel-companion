import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthenticatedUser } from './jwt.strategy.js';
import type { Request } from 'express';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    return ctx
      .switchToHttp()
      .getRequest<Request & { user: AuthenticatedUser }>().user;
  },
);
