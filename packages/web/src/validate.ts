import {
  dereference,
  OutputUnit,
  Schema,
  validate as schemaValidate
} from '@cfworker/json-schema';
import { HttpError } from './http-error.js';
import { Middleware } from './middleware.js';
import { toObject } from './to-object.js';

export interface RequestSchemas {
  body?: Schema;
  headers?: Schema;
  params?: Schema;
  search?: Schema;
}

export type RequestPart = keyof RequestSchemas;

export type RequestParser = (data: URLSearchParams | FormData) => any;

const draft = '2019-09';

const hasBody: Record<string, true> = {
  POST: true,
  PUT: true,
  DELETE: true,
  PATCH: true
};

function middlewareFactory(
  schemas: RequestSchemas,
  parser: RequestParser = toObject,
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
      const search = parser(req.url.searchParams);
      validateRequestPart('search', search, $search, lookup);
    }
    if ($body && hasBody[req.method]) {
      let body: any;
      const contentType = req.headers.get('content-type') || '';
      if (
        contentType === 'application/x-www-form-urlencoded' ||
        contentType.startsWith('application/x-www-form-urlencoded;') ||
        contentType.startsWith('multipart/form-data;')
      ) {
        const form = await req.body.formData();
        body = parser(form);
      } else {
        body = await req.body.json();
      }
      validateRequestPart('body', body, $body, lookup);
    }
    await next();
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
