import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'AI-Powered Repository Dockerization Agent';
  }
}

