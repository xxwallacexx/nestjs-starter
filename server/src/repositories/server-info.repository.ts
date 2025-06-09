import { Injectable } from '@nestjs/common';
import { exec as execCallback } from 'node:child_process';
import { promisify } from 'node:util';
import { ConfigRepository } from 'src/repositories/config.repository';
import { LoggingRepository } from 'src/repositories/logging.repository';

export interface GitHubRelease {
  id: number;
  url: string;
  tag_name: string;
  name: string;
  created_at: string;
  published_at: string;
  body: string;
}

export interface ServerBuildVersions {
  nodejs: string;
}

const exec = promisify(execCallback);
const maybeFirstLine = async (command: string): Promise<string> => {
  try {
    const { stdout } = await exec(command);
    return stdout.trim().split('\n')[0] || '';
  } catch {
    return '';
  }
};

@Injectable()
export class ServerInfoRepository {
  constructor(
    private configRepository: ConfigRepository,
    private logger: LoggingRepository,
  ) {
    this.logger.setContext(ServerInfoRepository.name);
  }

  async getBuildVersions(): Promise<ServerBuildVersions> {
    const { nodeVersion } = this.configRepository.getEnv();

    const nodejsOutput = await maybeFirstLine('node --version');

    return {
      nodejs: nodejsOutput || nodeVersion || '',
    };
  }
}
