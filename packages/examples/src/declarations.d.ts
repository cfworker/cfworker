declare var process: {
  env: { [name: string]: string };
};

interface WorkerGlobalScopeEventMap {
  fetch: FetchEvent;
}
