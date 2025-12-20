import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { User, DietRecord, HealthMeasurement } from '../types';

interface KetoDB extends DBSchema {
  users: {
    key: string; // email is primary key
    value: User;
  };
  records: {
    key: string; // uuid
    value: DietRecord;
    indexes: { 'by-user': string }; // Index to query by userEmail
  };
  measurements: {
    key: string; // uuid
    value: HealthMeasurement;
    indexes: { 'by-user': string };
  };
}

const DB_NAME = 'keto-companion-db';
const DB_VERSION = 2; // Incremented version to trigger upgrade

// Initialize Database
const getDB = async (): Promise<IDBPDatabase<KetoDB>> => {
  return openDB<KetoDB>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      // Create Users Store
      if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'email' });
      }
      
      // Create Records Store
      if (!db.objectStoreNames.contains('records')) {
        const store = db.createObjectStore('records', { keyPath: 'id' });
        store.createIndex('by-user', 'userEmail');
      }

      // Create Measurements Store (New in v2)
      if (!db.objectStoreNames.contains('measurements')) {
        const store = db.createObjectStore('measurements', { keyPath: 'id' });
        store.createIndex('by-user', 'userEmail');
      }
    },
  });
};

export const dbService = {
  // --- USER OPERATIONS ---
  
  async createUser(user: User): Promise<void> {
    const db = await getDB();
    await db.put('users', user);
  },

  async getUser(email: string): Promise<User | undefined> {
    const db = await getDB();
    return db.get('users', email);
  },

  async updateUser(user: User): Promise<void> {
    const db = await getDB();
    await db.put('users', user);
  },

  // --- RECORD OPERATIONS (DIET) ---

  async addRecord(record: DietRecord): Promise<void> {
    const db = await getDB();
    await db.add('records', record);
  },

  async updateRecord(record: DietRecord): Promise<void> {
    const db = await getDB();
    await db.put('records', record);
  },

  async getRecordsByUser(email: string): Promise<DietRecord[]> {
    const db = await getDB();
    return db.getAllFromIndex('records', 'by-user', email);
  },

  async deleteRecord(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('records', id);
  },

  // --- MEASUREMENT OPERATIONS (HEALTH) ---

  async addMeasurement(measurement: HealthMeasurement): Promise<void> {
    const db = await getDB();
    await db.add('measurements', measurement);
  },

  async getMeasurementsByUser(email: string): Promise<HealthMeasurement[]> {
    const db = await getDB();
    return db.getAllFromIndex('measurements', 'by-user', email);
  },

  async deleteMeasurement(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('measurements', id);
  },
  
  // Migration helper (optional, can be called once to migrate localStorage to IndexedDB)
  async migrateFromLocalStorage(userEmail: string) {
     const db = await getDB();
     const legacyKey = `keto-companion-data-${userEmail}`;
     const rawData = localStorage.getItem(legacyKey);
     if (rawData) {
         try {
             const records = JSON.parse(rawData);
             const tx = db.transaction('records', 'readwrite');
             const promises = records.map((r: any) => {
                 // Ensure legacy records have the userEmail
                 const recordWithUser: DietRecord = { ...r, userEmail };
                 return tx.store.put(recordWithUser);
             });
             await Promise.all([...promises, tx.done]);
             console.log("Migration successful");
             localStorage.removeItem(legacyKey); // Cleanup
         } catch (e) {
             console.error("Migration failed", e);
         }
     }
  }
};