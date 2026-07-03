import { initializeApp } from 'firebase/app';
import { initializeFirestore, doc, setDoc, deleteDoc, onSnapshot, collection } from 'firebase/firestore';
import { RevenueRecord, ProductionRecord, PSTerjualRecord, TransmissionRecord } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyAQoMkeEV78n5Z6ahtQvbfiGIo3lRrZ_uo",
  authDomain: "metal-guard-vtxfk.firebaseapp.com",
  projectId: "metal-guard-vtxfk",
  storageBucket: "metal-guard-vtxfk.firebasestorage.app",
  messagingSenderId: "555650229341",
  appId: "1:555650229341:web:ea019e878abdfcac5059b4"
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {}, "ai-studio-revenuedashboard-7c1c199e-373f-4a2d-b187-baf2d393403a");

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {}, // No Firebase Authentication configured for this app
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Helper to save or update any document in a given collection
export async function saveDocument<T extends { id: string }>(collectionName: string, item: T) {
  const path = `${collectionName}/${item.id}`;
  try {
    const docRef = doc(db, collectionName, item.id);
    await setDoc(docRef, item);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Helper to delete any document in a given collection
export async function removeDocument(collectionName: string, id: string) {
  const path = `${collectionName}/${id}`;
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Real-time synchronization helper
export function syncCollection<T extends { id: string }>(
  collectionName: string,
  onUpdate: (items: T[]) => void,
  initialMockData?: T[]
) {
  const colRef = collection(db, collectionName);
  
  return onSnapshot(colRef, async (snapshot) => {
    if (snapshot.empty && initialMockData && initialMockData.length > 0) {
      console.log(`Seeding collection "${collectionName}" with initial data...`);
      for (const item of initialMockData) {
        const docRef = doc(db, collectionName, item.id);
        try {
          await setDoc(docRef, item);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `${collectionName}/${item.id}`);
        }
      }
      return;
    }

    const items: T[] = [];
    snapshot.forEach((docSnap) => {
      items.push({ ...docSnap.data() } as T);
    });
    
    onUpdate(items);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, collectionName);
  });
}

// Sync categories document
export function syncCategories(
  onUpdate: (categories: string[]) => void,
  defaultCategories: string[]
) {
  const docRef = doc(db, 'settings', 'categories');
  const path = 'settings/categories';
  
  return onSnapshot(docRef, async (docSnap) => {
    if (!docSnap.exists()) {
      console.log('Seeding categories into settings...');
      try {
        await setDoc(docRef, { id: 'categories', list: defaultCategories });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, path);
      }
      return;
    }
    
    const data = docSnap.data();
    if (data && Array.isArray(data.list)) {
      onUpdate(data.list);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
}

// Save categories document
export async function saveCategories(list: string[]) {
  const path = 'settings/categories';
  try {
    const docRef = doc(db, 'settings', 'categories');
    await setDoc(docRef, { id: 'categories', list });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
