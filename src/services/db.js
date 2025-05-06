import Dexie from 'dexie';

export const db = new Dexie('P2PPlatformDB');

db.version(1).stores({
  profiles: '++id, name, email, bio'
});
