import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AppService {
  @Inject(ConfigService) public configService: ConfigService;
  getHello(): string {
    const mode = this.configService.get('MODE');
    console.log("🚀 ~ file: app.service.ts ~ line 8 ~ AppService ~ getHello ~ mode", mode)
    console.log(`Running on ${mode} mode in port ${this.configService.get('PORT')}`);

    return 'Hello world'
  }
}