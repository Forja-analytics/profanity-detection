// Simple in-memory mock for tests
type Store = Map<string, any>;

const stores = new Map<string, Store>();

export function getStore(name: string) {
  if (!stores.has(name)) stores.set(name, new Map());
  const store = stores.get(name)!;

  return {
    async setJSON(key: string, value: any) {
      store.set(key, value);
    },
    async get(key: string, _opts?: { type?: 'json' | 'text' }) {
      return store.get(key);
    },
    async list({ prefix }: { prefix?: string } = {}) {
      const blobs = Array.from(store.keys())
        .filter((k) => (prefix ? k.startsWith(prefix) : true))
        .map((k) => ({ key: k }));
      return { blobs };
    },
  };
}
