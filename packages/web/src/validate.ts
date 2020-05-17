import {
  dereference,
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
      const result = schemaValidate(req.params, $params, draft, lookup);
      if (!result.valid) {
        throw new HttpError(400, 'params are invalid');
      }
    }
    if ($headers) {
      const headers = toObject(req.headers);
      const result = schemaValidate(headers, $headers, draft, lookup);
      if (!result.valid) {
        throw new HttpError(400, 'headers are invalid');
      }
    }
    if ($search) {
      const search = toObject(req.url.searchParams);
      const result = schemaValidate(search, $search, draft, lookup);
      if (!result.valid) {
        throw new HttpError(400, 'search is invalid');
      }
    }
    if ($body && hasBody[req.method]) {
      const body = await req.body.json();
      const result = schemaValidate(body, $body, draft, lookup);
      if (!result.valid) {
        throw new HttpError(400, 'body is invalid');
      }
    }
    next();
  };
}

export const validate = middlewareFactory;
