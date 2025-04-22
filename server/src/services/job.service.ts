import { BadRequestException, Injectable } from '@nestjs/common';
import { snakeCase } from 'lodash';
import { OnEvent } from 'src/decorators';
import { AllJobStatusResponseDto, JobCommandDto, JobCreateDto, JobStatusDto } from 'src/dtos/job.dto';
import { AppWorker, JobCommand, JobName, JobStatus, ManualJobName, QueueCleanType, QueueName } from 'src/enum';
import { ArgOf, ArgsOf } from 'src/repositories/event.repository';
import { BaseService } from 'src/services/base.service';
import { ConcurrentQueueName, JobItem } from 'src/types';

const asJobItem = (dto: JobCreateDto): JobItem => {
  switch (dto.name) {
    case ManualJobName.BACKUP_DATABASE: {
      return { name: JobName.BACKUP_DATABASE };
    }

    default: {
      throw new BadRequestException('Invalid job name');
    }
  }
};

@Injectable()
export class JobService extends BaseService {
  @OnEvent({ name: 'config.init', workers: [AppWorker.MICROSERVICES] })
  onConfigInit({ newConfig: config }: ArgOf<'config.init'>) {
    this.logger.debug(`Updating queue concurrency settings`);
    for (const queueName of Object.values(QueueName)) {
      let concurrency = 1;
      if (this.isConcurrentQueue(queueName)) {
        concurrency = config.job[queueName].concurrency;
      }
      this.logger.debug(`Setting ${queueName} concurrency to ${concurrency}`);
      this.jobRepository.setConcurrency(queueName, concurrency);
    }
  }

  @OnEvent({ name: 'config.update', server: true, workers: [AppWorker.MICROSERVICES] })
  onConfigUpdate({ newConfig: config }: ArgOf<'config.update'>) {
    this.onConfigInit({ newConfig: config });
  }

  async create(dto: JobCreateDto): Promise<void> {
    await this.jobRepository.queue(asJobItem(dto));
  }

  async handleCommand(queueName: QueueName, dto: JobCommandDto): Promise<JobStatusDto> {
    this.logger.debug(`Handling command: queue=${queueName},command=${dto.command},force=${dto.force}`);

    switch (dto.command) {
      case JobCommand.START: {
        await this.start(queueName, dto);
        break;
      }

      case JobCommand.PAUSE: {
        await this.jobRepository.pause(queueName);
        break;
      }

      case JobCommand.RESUME: {
        await this.jobRepository.resume(queueName);
        break;
      }

      case JobCommand.EMPTY: {
        await this.jobRepository.empty(queueName);
        break;
      }

      case JobCommand.CLEAR_FAILED: {
        const failedJobs = await this.jobRepository.clear(queueName, QueueCleanType.FAILED);
        this.logger.debug(`Cleared failed jobs: ${failedJobs}`);
        break;
      }
    }

    return this.getJobStatus(queueName);
  }

  async getJobStatus(queueName: QueueName): Promise<JobStatusDto> {
    const [jobCounts, queueStatus] = await Promise.all([
      this.jobRepository.getJobCounts(queueName),
      this.jobRepository.getQueueStatus(queueName),
    ]);

    return { jobCounts, queueStatus };
  }

  async getAllJobsStatus(): Promise<AllJobStatusResponseDto> {
    const response = new AllJobStatusResponseDto();
    for (const queueName of Object.values(QueueName)) {
      response[queueName] = await this.getJobStatus(queueName);
    }
    return response;
  }

  private async start(name: QueueName, { force }: JobCommandDto): Promise<void> {
    const { isActive } = await this.jobRepository.getQueueStatus(name);
    if (isActive) {
      throw new BadRequestException(`Job is already running`);
    }

    this.telemetryRepository.jobs.addToCounter(`app.queues.${snakeCase(name)}.started`, 1);

    switch (name) {
      case QueueName.BACKUP_DATABASE: {
        return this.jobRepository.queue({ name: JobName.BACKUP_DATABASE, data: { force } });
      }

      default: {
        throw new BadRequestException(`Invalid job name: ${name}`);
      }
    }
  }

  @OnEvent({ name: 'job.start' })
  async onJobStart(...[queueName, job]: ArgsOf<'job.start'>) {
    const queueMetric = `app.queues.${snakeCase(queueName)}.active`;
    this.telemetryRepository.jobs.addToGauge(queueMetric, 1);
    try {
      const status = await this.jobRepository.run(job);
      const jobMetric = `app.jobs.${job.name.replaceAll('-', '_')}.${status}`;
      this.telemetryRepository.jobs.addToCounter(jobMetric, 1);
      if (status === JobStatus.SUCCESS || status == JobStatus.SKIPPED) {
        await this.onDone(job);
      }
    } catch (error: Error | any) {
      this.logger.error(
        `Unable to run job handler (${queueName}/${job.name}): ${error}`,
        error?.stack,
        JSON.stringify(job.data),
      );
    } finally {
      this.telemetryRepository.jobs.addToGauge(queueMetric, -1);
    }
  }

  private isConcurrentQueue(name: QueueName): name is ConcurrentQueueName {
    return ![QueueName.BACKUP_DATABASE].includes(name);
  }

  private async onDone(item: JobItem) {
    console.log(item);
  }
}
