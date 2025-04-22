import { Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { InjectKysely } from 'nestjs-kysely';
import { readFile } from 'node:fs/promises';
import { DB } from 'src/db';

@Injectable()
export class SystemMetadataRepository {
  constructor(@InjectKysely() private db: Kysely<DB>) {}

  readFile(filename: string): Promise<string> {
    console.log(filename);
    return readFile(filename, { encoding: 'utf8' });
  }
}
