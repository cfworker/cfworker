import './_mocha-setup.js';
import './accepts.spec.js';
import './application.spec.js';
import './context.spec.js';
import './cookies.spec.js';
import './normalize-pathname.spec.js';
import './req.spec.js';
import './response-builder.spec.js';
import './validate.spec.js';

let running = false;

export default {
  async fetch() {
    if (running) {
      return new Response('Already running', { status: 400 });
    }
    running = true;

    const result = await new Promise(resolve => mocha.run(resolve));
    return new Response(JSON.stringify(result, null, 2), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    });
  }
};
