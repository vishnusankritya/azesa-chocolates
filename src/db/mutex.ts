// Compatibility passthrough.
//
// Historically this serialized every DB query through a single process-wide
// queue because PGlite (WASM Postgres) is single-connection — two concurrent
// queries would abort it with `RuntimeError: Aborted()`.
//
// The data layer is now Postgres via the `pg` connection pool, which handles
// concurrency natively. `serial()` therefore just runs the callback directly;
// it is kept as a named export so existing call sites (catalog, admin orders,
// checkout) compile unchanged and stay drop-in compatible if a query ever
// needs to be isolated.

export function serial<T>(fn: () => Promise<T> | T): Promise<T> {
  return Promise.resolve().then(fn);
}
