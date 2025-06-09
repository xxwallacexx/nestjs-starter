import { AppController } from 'src/controllers/app.controller';
import { AuthController } from 'src/controllers/auth.controller';
import { HealthController } from 'src/controllers/health.controller';
import { UserAdminController } from 'src/controllers/user-admin.controller';

export const controllers = [AppController, AuthController, HealthController, UserAdminController];
