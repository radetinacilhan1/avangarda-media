"use strict";

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  return value;
}

function createPublicReadCoalescer() {
  const pending = new Map();
  return function coalesce(uid, query, read) {
    const key = JSON.stringify([uid, canonical(query)]);
    let operation = pending.get(key);
    if (!operation) {
      operation = Promise.resolve().then(read).finally(() => {
        if (pending.get(key) === operation) pending.delete(key);
      });
      pending.set(key, operation);
    }
    // Concurrent identical public reads share the query result. It is never
    // mutated here or retained after completion; the next read sees fresh data.
    return operation;
  };
}

const coalescePublicRead = createPublicReadCoalescer();
module.exports = { createPublicReadCoalescer, coalescePublicRead };
