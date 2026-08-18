// Process-wide serialization for PGlite.
//
// PGlite is single-connection WASM: two queries running at once (an SSR page
// render + a client /api fetch in the same tick) abort it permanently with
// `RuntimeError: Aborted()`. All DB access therefore goes through this mutex so
// queries are applied one-at-a-time, no matter which route/request fires them.
let queue: Promise<unknown> = Promise.resolve();

export function serial<T>(fn: () => Promise<T> | T): Promise<T> {
  const run = queue.then(fn, fn);
  // Keep the chain alive even if a query rejects.
  queue = run.then(
    () => undefined,
    () => undefined
  );
  return run;
}
