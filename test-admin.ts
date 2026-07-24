import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from './firebase-applet-config.json';

async function run() {
  try {
    const app = initializeApp();
    const dbId = (firebaseConfig as any).firestoreDatabaseId || (firebaseConfig as any).databaseId;
    const db = dbId ? getFirestore(app, dbId) : getFirestore(app);
    await db.collection('test').doc('connection').set({ timestamp: Date.now() });
    const doc = await db.collection('test').doc('connection').get();
    console.log('Success:', doc.data());
  } catch (e) {
    console.error('Error:', e);
  }
}
run();
