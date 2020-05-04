import { dereference } from './dereference';
import { Schema, SchemaDraft } from './types';
import { validate } from './validate';

export class Validator {
  private readonly lookup: ReturnType<typeof dereference>;

  constructor(
    private readonly schema: Schema | boolean,
    private readonly draft: SchemaDraft = '2019-09'
  ) {
    this.lookup = dereference(schema);
  }

  public validate(instance: any) {
    return validate(instance, this.schema, this.draft, this.lookup);
  }

  public addSchema(schema: Schema) {
    dereference(schema, this.lookup);
  }
}
