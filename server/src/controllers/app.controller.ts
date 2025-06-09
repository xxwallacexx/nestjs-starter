import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { SystemConfigService } from 'src/services/system-config.service';

@Controller()
export class AppController {
  constructor(private service: SystemConfigService) {}

  @ApiExcludeEndpoint()
  @Get('.well-known/fat')
  getWellKnown() {
    return {
      api: {
        endpoint: '/api',
      },
    };
  }
}
