import { ApiService } from 'src/services/api.service';
import { AuthService } from 'src/services/auth.service';
import { BackupService } from 'src/services/backup.service';
import { DatabaseService } from 'src/services/database.service';
import { JobService } from 'src/services/job.service';
import { SessionService } from 'src/services/session.service';
import { SystemConfigService } from 'src/services/system-config.service';
import { UserAdminService } from 'src/services/user-admin.service';

export const services = [
  ApiService,
  AuthService,
  BackupService,
  DatabaseService,
  JobService,
  SessionService,
  SystemConfigService,
  UserAdminService,
];
