import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../config/configuration.js';
import type { UploadSignature } from '@travel-companion/contracts';
import { createHash } from 'node:crypto';

@Injectable()
export class MediaService {
  constructor(private readonly config: ConfigService<AppConfig, true>) {}

  createUploadSignature(): UploadSignature {
    const cloudinary = this.config.get('cloudinary', { infer: true });
    if (!cloudinary) {
      throw new NotFoundException('Image uploads are not enabled');
    }
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = 'travel-companion/posts';
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = createHash('sha1')
      .update(`${paramsToSign}${cloudinary.apiSecret}`)
      .digest('hex');

    return {
      cloudName: cloudinary.cloudName,
      apiKey: cloudinary.apiKey,
      timestamp,
      folder,
      signature,
    };
  }
}
