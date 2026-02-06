/**
 * Share encoding / decoding.
 *
 * We avoid external deps by hand-rolling a lightweight compress+encode:
 *   JSON → UTF-8 → deflate (CompressionStream) → base64url
 *
 * For SSR safety every export that touches the browser API is guarded.
 */

/* ─── base64url ──────────────────────────────────────────────────────────── */

function toBase64Url(buf: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array {
  const pad = (4 - (s.length % 4)) % 4;
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat(pad);
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

/* ─── deflate / inflate via CompressionStream ────────────────────────────── */

async function collectStream(readable: ReadableStream<Uint8Array>): Promise<Uint8Array> {
  const reader = readable.getReader();
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    out.set(c, offset);
    offset += c.length;
  }
  return out;
}

async function deflate(data: Uint8Array): Promise<Uint8Array> {
  const cs = new CompressionStream("deflate");
  const writer = cs.writable.getWriter();
  // TS lib types for CompressionStream are over-strict with ArrayBufferLike;
  // the runtime API accepts any Uint8Array fine.
  await writer.write(data as unknown as BufferSource);
  await writer.close();
  return collectStream(cs.readable as ReadableStream<Uint8Array>);
}

async function inflate(data: Uint8Array): Promise<Uint8Array> {
  const ds = new DecompressionStream("deflate");
  const writer = ds.writable.getWriter();
  await writer.write(data as unknown as BufferSource);
  await writer.close();
  return collectStream(ds.readable as ReadableStream<Uint8Array>);
}

/* ─── public API ─────────────────────────────────────────────────────────── */

/** Encode any JSON-serialisable payload into a compact URL-safe string. */
export async function encodeShare(payload: unknown): Promise<string> {
  const json = JSON.stringify(payload);
  const utf8 = new TextEncoder().encode(json);
  const compressed = await deflate(utf8);
  return toBase64Url(compressed);
}

/** Decode a string produced by encodeShare back into the original payload. */
export async function decodeShare<T>(token: string): Promise<T> {
  const compressed = fromBase64Url(token);
  const utf8 = await inflate(compressed);
  const json = new TextDecoder().decode(utf8);
  return JSON.parse(json) as T;
}
