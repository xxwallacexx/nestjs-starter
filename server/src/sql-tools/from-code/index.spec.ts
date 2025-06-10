import { reset, schemaFromCode } from 'src/sql-tools/from-code';
import { describe, expect, it } from 'vitest';

describe(schemaFromCode.name, () => {
  beforeEach(() => {
    reset();
  });

  it('should work', () => {
    expect(schemaFromCode()).toEqual({
      name: 'postgres',
      schemaName: 'public',
      functions: [],
      enums: [],
      extensions: [],
      parameters: [],
      tables: [],
      warnings: [],
    });
  });
});
