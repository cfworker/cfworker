import {
  dereference,
  OutputUnit,
  Schema,
  validate as schemaValidate
} from '@cfworker/json-schema';
import { HttpError } from 'web/src/http-error';
import { Middleware } from './middleware';
import { toObject } from './to-object';

export interface RequestSchemas {
  body?: Schema;
  headers?: Schema;
  params?: Schema;
  search?: Schema;
}

export type RequestPart = keyof RequestSchemas;

const draft = '2019-09';

const hasBody: Record<string, true> = {
  POST: true,
  PUT: true,
  DELETE: true,
  PATCH: true
};

function middlewareFactory(
  schemas: RequestSchemas,
  lookup = Object.create(null)
): Middleware {
  const {
    headers: $headers,
    search: $search,
    params: $params,
    body: $body
  } = schemas;

  if ($headers) {
    dereference($headers, { ...lookup });
  }
  if ($search) {
    dereference($search, { ...lookup });
  }
  if ($params) {
    dereference($params, { ...lookup });
  }
  if ($body) {
    dereference($body, { ...lookup });
  }

  return async ({ req }, next) => {
    if ($params) {
      validateRequestPart('params', req.params, $params, lookup);
    }
    if ($headers) {
      const headers = toObject(req.headers);
      validateRequestPart('headers', headers, $headers, lookup);
    }
    if ($search) {
      const search = toObject(req.url.searchParams);
      validateRequestPart('search', search, $search, lookup);
    }
    if ($body && hasBody[req.method]) {
      const body = await req.body.json();
      validateRequestPart('body', body, $body, lookup);
    }
    next();
  };
}

export const messages: Record<RequestPart, string> = {
  params: 'Parameters in request path are invalid.',
  headers: 'Headers are invalid.',
  search: 'Query string parameters are invalid.',
  body: 'Body is invalid.'
};

export interface RequestValidationErrorBody {
  status: 400;
  part: RequestPart;
  message: string;
  errors: OutputUnit[];
  schema: Schema;
}

function validateRequestPart(
  part: RequestPart,
  instance: any,
  schema: Schema,
  lookup: Record<string, boolean | Schema>
) {
  const result = schemaValidate(instance, schema, draft, lookup);
  if (result.valid) {
    return;
  }
  const errorBody: RequestValidationErrorBody = {
    status: 400,
    part,
    message: messages[part],
    errors: result.errors,
    schema
  };
  throw new HttpError(400, errorBody);
}

export const validate = middlewareFactory;
