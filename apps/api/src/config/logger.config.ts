import type { Params } from 'nestjs-pino';

export function buildLoggerConfig(nodeEnv: string): Params {
  const isProduction = nodeEnv === 'production';
  return {
    pinoHttp: {
      level: isProduction ? 'info' : 'debug',
      transport: isProduction
        ? undefined
        : {
            target: 'pino-pretty',
            options: {
              singleLine: true,
              colorize: true,
              translateTime: 'SYS:HH:MM:ss',
              ignore: 'pid,hostname',
            },
          },
      autoLogging: true,
      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          'res.headers["set-cookie"]',
        ],
        remove: true,
      },
      customProps: () => ({ context: 'HTTP' }),
    },
  };
}
