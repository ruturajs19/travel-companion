import { PipeTransform, BadRequestException } from '@nestjs/common';
import { ZodType } from 'zod';

export class ZodValidationPipe<T> implements PipeTransform<unknown, T> {
    constructor(private readonly schema: ZodType<T>) { }

    transform(value: unknown): T {
        const result = this.schema.safeParse(value);

        if (!result.success) {
            const messages = result.error.issues.map((issue) => {
                const path = issue.path.join('.');
                return path ? `${path}: ${issue.message}` : issue.message;
            });
            throw new BadRequestException(messages);
        }

        return result.data;
    }
}