// ---
// Minimal, dependency-free ZIP writer (store / no compression).
//
// We only ever bundle a handful of already-compressed images, a few short
// sounds and a text snippet, so compression buys nothing — storing the bytes
// verbatim keeps this tiny and avoids pulling in a zip library. Produces a
// standard archive that macOS Archive Utility, Windows Explorer and `unzip`
// all read.
// ---

export interface ZipEntry {
  // Path inside the archive, e.g. "public/images/my-theme/cat.png".
  path: string;
  data: Uint8Array;
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

const crc32 = (bytes: Uint8Array): number => {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

// Fixed 1980-01-01 00:00 timestamp so archives are deterministic.
const DOS_TIME = 0;
const DOS_DATE = 0x21;

// UTF-8 filename flag (general purpose bit 11) so åäö in slugs survive.
const FLAG_UTF8 = 0x0800;

export const createZip = (entries: ZipEntry[]): Blob => {
  const encoder = new TextEncoder();
  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const name = encoder.encode(entry.path);
    const crc = crc32(entry.data);
    const size = entry.data.length;

    const local = new Uint8Array(30 + name.length);
    const lv = new DataView(local.buffer);
    lv.setUint32(0, 0x04034b50, true); // local file header signature
    lv.setUint16(4, 20, true); // version needed to extract
    lv.setUint16(6, FLAG_UTF8, true);
    lv.setUint16(8, 0, true); // method: store
    lv.setUint16(10, DOS_TIME, true);
    lv.setUint16(12, DOS_DATE, true);
    lv.setUint32(14, crc, true);
    lv.setUint32(18, size, true); // compressed size
    lv.setUint32(22, size, true); // uncompressed size
    lv.setUint16(26, name.length, true);
    lv.setUint16(28, 0, true); // extra field length
    local.set(name, 30);
    parts.push(local, entry.data);

    const cd = new Uint8Array(46 + name.length);
    const cv = new DataView(cd.buffer);
    cv.setUint32(0, 0x02014b50, true); // central directory header signature
    cv.setUint16(4, 20, true); // version made by
    cv.setUint16(6, 20, true); // version needed
    cv.setUint16(8, FLAG_UTF8, true);
    cv.setUint16(10, 0, true); // method: store
    cv.setUint16(12, DOS_TIME, true);
    cv.setUint16(14, DOS_DATE, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, size, true);
    cv.setUint32(24, size, true);
    cv.setUint16(28, name.length, true);
    cv.setUint16(30, 0, true); // extra
    cv.setUint16(32, 0, true); // comment
    cv.setUint16(34, 0, true); // disk number start
    cv.setUint16(36, 0, true); // internal attrs
    cv.setUint32(38, 0, true); // external attrs
    cv.setUint32(42, offset, true); // offset of local header
    cd.set(name, 46);
    central.push(cd);

    offset += local.length + entry.data.length;
  }

  const centralSize = central.reduce((n, c) => n + c.length, 0);

  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true); // end of central directory signature
  ev.setUint16(8, entries.length, true); // entries on this disk
  ev.setUint16(10, entries.length, true); // total entries
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true); // central directory offset

  return new Blob([...parts, ...central, end], { type: "application/zip" });
};

// ---
// Reader — the inverse of createZip, so an exported theme can be opened
// again later. Walks the central directory (the authoritative index) and
// slices each file out of its local header. Our own archives are stored
// uncompressed, but if someone re-zips the unpacked folder with Finder or
// Explorer the entries come back deflated, so that case is handled via the
// browser's built-in DecompressionStream.
// ---

const findEndOfCentralDirectory = (view: DataView): number => {
  // The EOCD record is 22 bytes + an optional comment (max 65535 bytes).
  const min = Math.max(0, view.byteLength - 22 - 0xffff);
  for (let i = view.byteLength - 22; i >= min; i--) {
    if (view.getUint32(i, true) === 0x06054b50) return i;
  }
  throw new Error("Inte en giltig zip-fil");
};

// TypeScript 4.6's DOM lib predates DecompressionStream (Chrome 103+,
// Safari 16.4+, Firefox 113+); declare the bit we use and feature-detect.
type DecompressionStreamCtor = new (format: string) => {
  readable: ReadableStream;
  writable: WritableStream;
};

const inflateRaw = async (bytes: Uint8Array): Promise<Uint8Array> => {
  const Ctor = (globalThis as { DecompressionStream?: DecompressionStreamCtor })
    .DecompressionStream;
  if (!Ctor)
    throw new Error("Webbläsaren kan inte packa upp komprimerade zip-filer");
  const ds = new Ctor("deflate-raw");
  const body = new Blob([bytes]).stream() as unknown as {
    pipeThrough: (t: {
      readable: ReadableStream;
      writable: WritableStream;
    }) => ReadableStream;
  };
  return new Uint8Array(await new Response(body.pipeThrough(ds)).arrayBuffer());
};

export const readZip = async (data: ArrayBuffer): Promise<ZipEntry[]> => {
  const bytes = new Uint8Array(data);
  const view = new DataView(data);
  const decoder = new TextDecoder();
  const eocd = findEndOfCentralDirectory(view);
  const count = view.getUint16(eocd + 10, true);
  let pos = view.getUint32(eocd + 16, true);

  const entries: ZipEntry[] = [];
  for (let n = 0; n < count; n++) {
    if (view.getUint32(pos, true) !== 0x02014b50)
      throw new Error("Trasig zip-fil (central directory)");
    const method = view.getUint16(pos + 10, true);
    const compressedSize = view.getUint32(pos + 20, true);
    const nameLength = view.getUint16(pos + 28, true);
    const extraLength = view.getUint16(pos + 30, true);
    const commentLength = view.getUint16(pos + 32, true);
    const localOffset = view.getUint32(pos + 42, true);
    const path = decoder.decode(
      bytes.subarray(pos + 46, pos + 46 + nameLength)
    );
    pos += 46 + nameLength + extraLength + commentLength;

    if (path.endsWith("/")) continue; // directory placeholder

    if (view.getUint32(localOffset, true) !== 0x04034b50)
      throw new Error("Trasig zip-fil (local header)");
    const localNameLength = view.getUint16(localOffset + 26, true);
    const localExtraLength = view.getUint16(localOffset + 28, true);
    const start = localOffset + 30 + localNameLength + localExtraLength;
    const raw = bytes.slice(start, start + compressedSize);

    let content: Uint8Array;
    if (method === 0) content = raw;
    else if (method === 8) content = await inflateRaw(raw);
    else
      throw new Error(
        `Zip-filen använder en komprimering som inte stöds (${method})`
      );

    entries.push({ path, data: content });
  }
  return entries;
};
