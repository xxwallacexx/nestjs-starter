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

  async getGitHubRelease(): Promise<GitHubRelease> {
    try {
      const response = await fetch('https://api.github.com/repos/immich-app/immich/releases/latest');

      if (!response.ok) {
        throw new Error(`GitHub API request failed with status ${response.status}: ${await response.text()}`);
      }

      return response.json();
    } catch (error) {
      throw new Error(`Failed to fetch GitHub release: ${error}`);
    }
  }

  async getBuildVersions(): Promise<ServerBuildVersions> {
    const { nodeVersion } = this.configRepository.getEnv();

    const nodejsOutput = await maybeFirstLine('node --version');

    return {
      nodejs: nodejsOutput || nodeVersion || '',
    };
  }
}
