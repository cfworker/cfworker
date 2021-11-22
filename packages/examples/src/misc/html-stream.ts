import { htmlEncode } from '@cfworker/web';

export function html(
  strings: TemplateStringsArray,
  ...values: any[]
): ReadableStream {
  let cancelled = false;
  const { readable, writable } = new TransformStream();
  (async () => {
    const writer = writable.getWriter();
    const encoder = new TextEncoder();
    const cancellationToken = {
      get cancelled() {
        return cancelled;
      }
    };

    let i = 0;
    for (; i < values.length && !cancelled; i++) {
      await writer.write(encoder.encode(strings[i]));
      await pushValue(values[i], writer, encoder, cancellationToken);
    }
    if (!cancelled) {
      await writer.write(encoder.encode(strings[i]));
    }
    await writer.close();
  })();

  return readable;
}

interface CancellationToken {
  readonly cancelled: boolean;
}

type Writer = WritableStreamDefaultWriter;

async function pushValue(
  value: any,
  writer: Writer,
  encoder: TextEncoder,
  cancellationToken: CancellationToken
): Promise<void> {
  if (value === null || value === undefined || cancellationToken.cancelled) {
    return;
  }

  if (value instanceof Promise) {
    return pushValue(await value, writer, encoder, cancellationToken);
  }

  if (value instanceof ReadableStream) {
    return pushStream(value, writer, cancellationToken);
  }

  if (Array.isArray(value)) {
    return pushArray(value, writer, encoder, cancellationToken);
  }

  await writer.write(encoder.encode(htmlEncode(value.toString())));
}

async function pushStream(
  stream: ReadableStream,
  writer: Writer,
  cancellationToken: CancellationToken
) {
  const reader = stream.getReader();
  do {
    const { value, done } = await reader.read();
    if (done || cancellationToken.cancelled) {
      reader.releaseLock();
      return;
    }
    writer.write(value!);
  } while (true);
}

async function pushArray(
  value: any[],
  writer: Writer,
  encoder: TextEncoder,
  cancellationToken: CancellationToken
) {
  for (let i = 0; i < value.length && !cancellationToken.cancelled; i++) {
    await pushValue(value[i], writer, encoder, cancellationToken);
  }
}

/*
export function html(strings: TemplateStringsArray, ...values: any[]): ReadableStream<Uint8Array> {
  let cancelled = false;
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      const cancellationToken = { get cancelled() { return cancelled; } };
      let i = 0;
      for (; i < values.length && !cancelled; i++) {
        controller.enqueue(encoder.encode(strings[i]));
        await pushValue(values[i], controller, encoder, cancellationToken);
      }
      if (!cancelled) {
        controller.enqueue(encoder.encode(strings[i]));
        controller.close();
      }
    },
    cancel() {
      cancelled = true;
    }
  });
}

interface CancellationToken {
  readonly cancelled: boolean;
}

type StreamController = Pick<ReadableStreamDefaultController<Uint8Array>, 'enqueue'>;

async function pushValue(value: any, controller: StreamController, encoder: TextEncoder, cancellationToken: CancellationToken): Promise<void> {
  if (value === null || value === undefined || cancellationToken.cancelled) {
    return;
  }
  if (value instanceof Promise) {
    return pushValue(await value, controller, encoder, cancellationToken);
  }

  if (value instanceof ReadableStream) {
    return pushStream(value, controller, cancellationToken);
  }

  if (Array.isArray(value)) {
    return pushArray(value, controller, encoder, cancellationToken);
  }

  controller.enqueue(encoder.encode(htmlEncode(value.toString())));
}

async function pushStream(stream: ReadableStream<Uint8Array>, controller: StreamController, cancellationToken: CancellationToken) {
  const reader = stream.getReader();
  do {
    const { value, done } = await reader.read();
    if (done || cancellationToken.cancelled) {
      reader.releaseLock();
      return;
    }
    controller.enqueue(value);
  } while (true);
}

async function pushArray(value: any[], controller: StreamController, encoder: TextEncoder, cancellationToken: CancellationToken) {
  for (let i = 0; i < value.length && !cancellationToken.cancelled; i++) {
    await pushValue(value[i], controller, encoder, cancellationToken);
  }
}
*/
