import { createTestHarness } from 'wrangler';

const server = createTestHarness({
  workers: [
    {
      config: {
        name: 'cfworker-tests',
        main: 'dist-test/test.js',
        compatibility_date: '2026-10-29',
        no_bundle: true
      }
    }
  ]
});

try {
  await server.listen();
  const response = await server.fetch('/');
  if (!response.ok) {
    throw new Error(
      `Test worker responded with ${response.status}: ${response.statusText}\n${await response.text()}`
    );
  }
  const failures = await response.json();
  if (!Number.isInteger(failures) || failures < 0) {
    throw new TypeError(`Test worker returned an invalid failure count: ${failures}`);
  }
  if (failures > 0) {
    server.debug();
  }
  process.exitCode = failures;
} catch (err) {
  console.error(err);
  server.debug();
  process.exitCode = 1;
} finally {
  await server.close();
}
