import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  query, 
  orderBy, 
  getDocFromServer 
} from 'firebase/firestore';
import * as fs from 'fs/promises';
import * as path from 'path';
import { Tree, Order, CareUpdate } from './types';
import firebaseConfig from '../firebase-applet-config.json';

const DATA_STORE_PATH = path.join(process.cwd(), 'data_store.json');

interface LocalStoreData {
  trees: Tree[];
  orders: Order[];
}

// Check if Firebase config is a placeholder
const isConfigPlaceholder = 
  !firebaseConfig || 
  firebaseConfig.projectId === 'remixed-project-id' || 
  !firebaseConfig.projectId;

let useFirestore = false;
let db: any = null;

// Initialize Firebase and test connection
async function initFirebaseAndTest() {
  if (isConfigPlaceholder) {
    console.log('Firebase configuration is a placeholder. Falling back to local data_store.json storage.');
    useFirestore = false;
    return;
  }
  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const dbId = (firebaseConfig as any).firestoreDatabaseId || (firebaseConfig as any).databaseId;
    db = dbId ? getFirestore(app, dbId) : getFirestore(app);
    // Test connection with getDocFromServer
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Successfully connected to Firebase Firestore!');
    useFirestore = true;
  } catch (error) {
    console.warn('Failed to connect to Firebase Firestore:', error);
    console.log('Falling back to local data_store.json storage.');
    useFirestore = false;
  }
}

// Call initialization
initFirebaseAndTest();

// Error handling helpers
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
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Helper to read local data_store.json (Fallback)
async function readLocalStore(): Promise<LocalStoreData> {
  try {
    const data = await fs.readFile(DATA_STORE_PATH, 'utf8');
    return JSON.parse(data) as LocalStoreData;
  } catch (err) {
    console.warn('Failed to read local data_store.json, returning empty structure:', err);
    return { trees: [], orders: [] };
  }
}

// Helper to write local data_store.json (Fallback)
async function writeLocalStore(data: LocalStoreData): Promise<void> {
  try {
    await fs.writeFile(DATA_STORE_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to write to local data_store.json:', err);
  }
}

export class LocalDb {
  public static async getTrees(): Promise<Tree[]> {
    if (useFirestore && db) {
      const pathForGet = 'trees';
      try {
        const q = query(collection(db, pathForGet), orderBy('index', 'asc'));
        const snap = await getDocs(q);
        const trees: Tree[] = [];
        snap.forEach(docSnap => {
          trees.push({ id: docSnap.id, ...docSnap.data() } as Tree);
        });
        return trees;
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, pathForGet);
      }
    }

    // Local Fallback
    const localData = await readLocalStore();
    return (localData.trees || []).sort((a, b) => a.index - b.index);
  }

  public static async addTree(tree: Omit<Tree, 'id' | 'index'> & { index?: number }): Promise<Tree> {
    const id = `t-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    let index = tree.index;
    
    // Find first available index starting from 100001 if index not provided
    if (!index) {
      const trees = await this.getTrees();
      const takenIndexes = new Set(trees.map(t => t.index));
      index = 100001;
      while (takenIndexes.has(index)) {
        index++;
      }
    }

    const newTree: Tree = {
      ...tree,
      id,
      index
    };

    if (useFirestore && db) {
      const pathForWrite = `trees/${id}`;
      try {
        await setDoc(doc(db, 'trees', id), newTree);
        return newTree;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, pathForWrite);
      }
    }

    // Local Fallback
    const localData = await readLocalStore();
    localData.trees = localData.trees || [];
    localData.trees.push(newTree);
    await writeLocalStore(localData);

    return newTree;
  }

  public static async updateTree(id: string, updates: Partial<Tree>): Promise<Tree | null> {
    if (useFirestore && db) {
      const pathForWrite = `trees/${id}`;
      try {
        const docRef = doc(db, 'trees', id);
        await updateDoc(docRef, updates);
        const snap = await getDoc(docRef);
        return snap.exists() ? ({ id: snap.id, ...snap.data() } as Tree) : null;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, pathForWrite);
      }
    }

    // Local Fallback
    const localData = await readLocalStore();
    const treeIndex = localData.trees.findIndex(t => t.id === id);
    if (treeIndex !== -1) {
      localData.trees[treeIndex] = {
        ...localData.trees[treeIndex],
        ...updates
      };
      await writeLocalStore(localData);
      return localData.trees[treeIndex];
    }
    return null;
  }

  public static async addCareUpdate(treeId: string, update: CareUpdate): Promise<Tree | null> {
    if (useFirestore && db) {
      const pathForWrite = `trees/${treeId}`;
      try {
        const docRef = doc(db, 'trees', treeId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const tree = snap.data() as Tree;
          const careHistory = [...(tree.careHistory || []), update];
          
          const height = update.height;
          let status = tree.status;
          if (height >= 150) {
            status = 'Mature';
          } else if (height >= 100) {
            status = 'Young Tree';
          } else if (height >= 50) {
            status = 'Growing';
          } else {
            status = 'Seedling';
          }

          const carbonOffset = Number((height * 0.1).toFixed(1));

          const updates = {
            height,
            status,
            carbonOffset,
            careHistory
          };

          await updateDoc(docRef, updates);
          return {
            ...tree,
            ...updates
          };
        }
        return null;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, pathForWrite);
      }
    }

    // Local Fallback
    const localData = await readLocalStore();
    const treeIndex = localData.trees.findIndex(t => t.id === treeId);
    if (treeIndex !== -1) {
      const tree = localData.trees[treeIndex];
      const careHistory = [...(tree.careHistory || []), update];
      
      const height = update.height;
      let status = tree.status;
      if (height >= 150) {
        status = 'Mature';
      } else if (height >= 100) {
        status = 'Young Tree';
      } else if (height >= 50) {
        status = 'Growing';
      } else {
        status = 'Seedling';
      }

      const carbonOffset = Number((height * 0.1).toFixed(1));

      localData.trees[treeIndex] = {
        ...tree,
        height,
        status,
        carbonOffset,
        careHistory
      };

      await writeLocalStore(localData);
      return localData.trees[treeIndex];
    }
    return null;
  }

  public static async getOrders(): Promise<Order[]> {
    if (useFirestore && db) {
      const pathForGet = 'orders';
      try {
        const snap = await getDocs(collection(db, pathForGet));
        const orders: Order[] = [];
        snap.forEach(docSnap => {
          orders.push({ id: docSnap.id, ...docSnap.data() } as Order);
        });
        return orders;
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, pathForGet);
      }
    }

    // Local Fallback
    const localData = await readLocalStore();
    return localData.orders || [];
  }

  public static async getOrder(id: string): Promise<Order | null> {
    if (useFirestore && db) {
      const pathForGet = `orders/${id}`;
      try {
        const docRef = doc(db, 'orders', id);
        const snap = await getDoc(docRef);
        return snap.exists() ? ({ id: snap.id, ...snap.data() } as Order) : null;
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, pathForGet);
      }
    }

    // Local Fallback
    const localData = await readLocalStore();
    const order = localData.orders.find(o => o.id === id);
    return order || null;
  }

  public static async addOrder(order: Omit<Order, 'id' | 'createdAt' | 'status' | 'slipVerified'> & { status?: 'Pending' | 'Paid' | 'Failed'; slipVerified?: boolean }): Promise<Order> {
    const id = `ord-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newOrder: Order = {
      ...order,
      id,
      status: order.status || 'Pending',
      slipVerified: order.slipVerified ?? false,
      createdAt: new Date().toISOString()
    };

    if (useFirestore && db) {
      const pathForWrite = `orders/${id}`;
      try {
        await setDoc(doc(db, 'orders', id), newOrder);
        return newOrder;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, pathForWrite);
      }
    }

    // Local Fallback
    const localData = await readLocalStore();
    localData.orders = localData.orders || [];
    localData.orders.push(newOrder);
    await writeLocalStore(localData);

    return newOrder;
  }

  public static async updateOrder(id: string, updates: Partial<Order>): Promise<Order | null> {
    if (useFirestore && db) {
      const pathForWrite = `orders/${id}`;
      try {
        const docRef = doc(db, 'orders', id);
        await updateDoc(docRef, updates);
        const snap = await getDoc(docRef);
        return snap.exists() ? ({ id: snap.id, ...snap.data() } as Order) : null;
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, pathForWrite);
      }
    }

    // Local Fallback
    const localData = await readLocalStore();
    const orderIndex = localData.orders.findIndex(o => o.id === id);
    if (orderIndex !== -1) {
      localData.orders[orderIndex] = {
        ...localData.orders[orderIndex],
        ...updates
      };
      await writeLocalStore(localData);
      return localData.orders[orderIndex];
    }
    return null;
  }
}
