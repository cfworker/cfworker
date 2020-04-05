import { EventEmitter } from 'events';
import { logger } from './logger.js';
import { WorkerHost } from './worker-host.js';

export class TestHost extends EventEmitter {
  mochaGlobals = [
    'afterEach',
    'after',
    'beforeEach',
    'before',
    'describe',
    'it',
    'xit'
  ];
  testsRan = false;

  /**
   * @param {number} port
   * @param {boolean} inspect
   */
  constructor(port, inspect) {
    super();
    this.inspect = inspect;
    this.workerHost = new WorkerHost(port, inspect);
  }

  start() {
    return this.workerHost.start();
  }

  dispose() {
    this.workerHost.dispose();
  }

  /**
   * @param {string} code
   */
  async runTests(code) {
    this.emit('test-start');
    const startTime = Date.now();
    const testsRan = this.testsRan;
    this.testsRan = true;
    logger.progress('Waiting for worker host...');
    const page = await this.workerHost.pageReady;
    if (testsRan) {
      logger.progress('Reloading worker host...');
      await this.workerHost.reloadPage(); // reset so that tests can be rerun.
    }
    this.testsRan = true;
    logger.progress('Loading mocha and chai...');
    await this.loadMocha(page, this.workerHost.server.pathPrefix);
    const globals = ['mocha', 'chai', ...this.mochaGlobals];
    await this.workerHost.setWorkerCode(code, '/test.js', globals);
    /** @type {number} */
    logger.progress('Running tests...');
    const failures = await page.evaluate(
      () => new Promise(resolve => mocha.run(resolve))
    );
    if (failures) {
      logger.error('Failed');
    } else {
      logger.success('Passed', Date.now() - startTime);
    }
    this.emit('test-end', failures);
    return failures;
  }

  /**
   * @param {import('puppeteer').Page} page
   * @param {string} pathnamePrefix
   */
  async loadMocha(page, pathnamePrefix) {
    await page.evaluate(() => (document.body.id = 'mocha'));
    await page.addStyleTag({
      url: `${pathnamePrefix}/node_modules/mocha/mocha.css`
    });
    await page.addScriptTag({
      url: `${pathnamePrefix}/node_modules/chai/chai.js`
    });
    await page.addScriptTag({
      url: `${pathnamePrefix}/node_modules/mocha/mocha.js`
    });
    await page.evaluate(
      (inspect, mochaGlobals) => {
        mocha.setup({
          ui: 'bdd',
          reporter: inspect ? 'html' : 'spec',
          useColors: !this.inspect
        });

        mocha.checkLeaks();

        // Expose mocha globals on the mocha object, to enable `import { describe } from 'mocha';`
        // in the browser version of mocha.
        // https://github.com/mochajs/mocha/issues/2765
        for (const name of mochaGlobals) {
          // @ts-ignore
          mocha[name] = self[name];
        }

        // mocha doesn't catch unhandledrejections yet.
        // https://github.com/mochajs/mocha/issues/2640
        addEventListener('unhandledrejection', event => event.reason);
      },
      this.inspect,
      this.mochaGlobals
    );
  }
}
