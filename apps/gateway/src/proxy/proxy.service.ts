import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosError } from 'axios';

@Injectable()
export class ProxyService {
  private readonly contentUrl: string;
  private readonly engagementUrl: string;
  private readonly mediaUrl: string;

  constructor() {
    this.contentUrl = process.env.CONTENT_SERVICE_URL || 'http://localhost:3001';
    this.engagementUrl = process.env.ENGAGEMENT_SERVICE_URL || 'http://localhost:3002';
    this.mediaUrl = process.env.MEDIA_SERVICE_URL || 'http://localhost:3003';
  }

  private async forward(method: string, url: string, body?: any, headers?: Record<string, string>) {
    try {
      const res = await axios({ method, url, data: body, headers });
      return { status: res.status, data: res.data };
    } catch (err) {
      const axiosErr = err as AxiosError;
      if (axiosErr.response) {
        throw new HttpException(axiosErr.response.data, axiosErr.response.status);
      }
      throw new HttpException('Bad Gateway', HttpStatus.BAD_GATEWAY);
    }
  }

  async toContent(method: string, path: string, body?: any, headers?: Record<string, string>) {
    return this.forward(method, `${this.contentUrl}${path}`, body, headers);
  }

  async toEngagement(method: string, path: string, body?: any, headers?: Record<string, string>) {
    return this.forward(method, `${this.engagementUrl}${path}`, body, headers);
  }

  async toMedia(method: string, path: string, body?: any, headers?: Record<string, string>) {
    return this.forward(method, `${this.mediaUrl}${path}`, body, headers);
  }
}
