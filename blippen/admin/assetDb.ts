// Tiny IndexedDB wrapper that mirrors the in-memory asset store so uploaded
// files survive a page reload. Everything stays in the user's own browser —
// nothing is ever sent to a server. All operations swallow errors (private
// browsing, cleared site data, ...) since the builder works fine without
// persistence; uploads just won't survive a reload then.

const DB_NAME = "theme-builder";
const STORE = "assets"; // key: public asset path, value: the uploaded Blob

const openDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE))
        req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

const withStore = async (
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => void
): Promise<void> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    fn(tx.objectStore(STORE));
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
};

export const idbPutAsset = async (path: string, file: Blob): Promise<void> => {
  try {
    await withStore("readwrite", (s) => s.put(file, path));
  } catch {
    /* persistence is best-effort */
  }
};

export const idbDeleteAsset = async (path: string): Promise<void> => {
  try {
    await withStore("readwrite", (s) => s.delete(path));
  } catch {
    /* ignore */
  }
};

export const idbClearAssets = async (): Promise<void> => {
  try {
    await withStore("readwrite", (s) => s.clear());
  } catch {
    /* ignore */
  }
};

export const idbLoadAssets = async (): Promise<Record<string, Blob>> => {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const out: Record<string, Blob> = {};
      const tx = db.transaction(STORE, "readonly");
      const cursorReq = tx.objectStore(STORE).openCursor();
      cursorReq.onsuccess = () => {
        const cursor = cursorReq.result;
        if (cursor) {
          if (cursor.value instanceof Blob)
            out[String(cursor.key)] = cursor.value;
          cursor.continue();
        }
      };
      tx.oncomplete = () => {
        db.close();
        resolve(out);
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  } catch {
    return {};
  }
};
