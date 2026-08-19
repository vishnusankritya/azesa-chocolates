// Process-wide serialization for PGlite.
//
// PGlite is single-connection WASM: two queries running at once (an SSR page
// render + a client /api fetch in the same tick) abort it permanently with
// `RuntimeError: Aborted()`. All DB access therefore goes through this mutex so
// queries are applied one-at-a-time, no matter which route/request fires them.
// The queue is hoisted on globalThis so every Turbopack route graph shares it
// (otherwise each route builds its own queue and concurrent queries bypass it).

type G = typeof globalThis & { __azesaSerialQueue?: Promise<unknown> };

function getQueue(): Promise<unknown> {
  const g = globalThis as G;
  if (!g.__azesaSerialQueue) g.__azesaSerialQueue = Promise.resolve();
  return g.__azesaSerialQueue;
}

export function serial<T>(fn: () => Promise<T> | T): Promise<T> {
  const g = globalThis as G;
  const q = getQueue();
  const run = q.then(fn, fn);
  // Keep the chain alive even if a query rejects.
  g.__azesaSerialQueue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}
