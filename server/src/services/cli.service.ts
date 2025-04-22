import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/services/base.service';

@Injectable()
export class CliService extends BaseService {
  cleanup() {
    return this.databaseRepository.shutdown();
  }
}
