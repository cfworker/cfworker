import { unstable_dev } from 'wrangler';

try {
  const worker = await unstable_dev(process.cwd() + '/dist-test/index.js', {
    local: true,
    logLevel: 'info',
    experimental: { disableExperimentalWarning: true }
  });
  const response = await worker.fetch();
  if (!response.ok) {
    throw new Error(
      `Test worker responded with ${response.status}: ${response.statusText}\n${await response.text()}`
    );
  }
  const failures = await response.json();
  await worker.stop();
  process.exit(failures);
} catch (err) {
  console.error(err);
  process.exit(1);
}
