const admin = require('firebase-admin');

let db;

const initializeFirebase = async () => {
  try {
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`
    });

    db = admin.firestore();
    console.log('Firebase Admin SDK initialized');
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Firebase not initialized');
  }
  return db;
};

// Database schema helpers
const collections = {
  users: 'users',
  shops: 'shops',
  inventory: 'inventory',
  sales: 'sales',
  reports: 'reports',
  alerts: 'alerts',
  weatherData: 'weatherData'
};

// User schema
const createUser = async (userData) => {
  const userRef = db.collection(collections.users).doc();
  const user = {
    id: userRef.id,
    ...userData,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
  
  await userRef.set(user);
  return user;
};

// Shop schema
const createShop = async (shopData) => {
  const shopRef = db.collection(collections.shops).doc();
  const shop = {
    id: shopRef.id,
    ...shopData,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
  
  await shopRef.set(shop);
  return shop;
};

// Inventory schema
const createInventoryItem = async (itemData) => {
  const itemRef = db.collection(collections.inventory).doc();
  const item = {
    id: itemRef.id,
    ...itemData,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
  
  await itemRef.set(item);
  return item;
};

// Sales schema
const createSale = async (saleData) => {
  const saleRef = db.collection(collections.sales).doc();
  const sale = {
    id: saleRef.id,
    ...saleData,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
  
  await saleRef.set(sale);
  return sale;
};

// Report schema
const createReport = async (reportData) => {
  const reportRef = db.collection(collections.reports).doc();
  const report = {
    id: reportRef.id,
    ...reportData,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
  
  await reportRef.set(report);
  return report;
};

// Alert schema
const createAlert = async (alertData) => {
  const alertRef = db.collection(collections.alerts).doc();
  const alert = {
    id: alertRef.id,
    ...alertData,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
  
  await alertRef.set(alert);
  return alert;
};

// Weather data schema
const createWeatherData = async (weatherData) => {
  const weatherRef = db.collection(collections.weatherData).doc();
  const weather = {
    id: weatherRef.id,
    ...weatherData,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  };
  
  await weatherRef.set(weather);
  return weather;
};

// Query helpers
const getCollection = (collectionName) => {
  return db.collection(collections[collectionName]);
};

const getDocument = async (collectionName, docId) => {
  const doc = await db.collection(collections[collectionName]).doc(docId).get();
  if (!doc.exists) {
    return null;
  }
  return { id: doc.id, ...doc.data() };
};

const updateDocument = async (collectionName, docId, data) => {
  const docRef = db.collection(collections[collectionName]).doc(docId);
  await docRef.update({
    ...data,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });
  return docRef.get().then(doc => ({ id: doc.id, ...doc.data() }));
};

const deleteDocument = async (collectionName, docId) => {
  await db.collection(collections[collectionName]).doc(docId).delete();
  return true;
};

// Batch operations
const batchWrite = async (operations) => {
  const batch = db.batch();
  
  operations.forEach(operation => {
    const { type, collection, docId, data } = operation;
    const docRef = db.collection(collections[collection]).doc(docId);
    
    switch (type) {
      case 'set':
        batch.set(docRef, data);
        break;
      case 'update':
        batch.update(docRef, data);
        break;
      case 'delete':
        batch.delete(docRef);
        break;
    }
  });
  
  await batch.commit();
};

module.exports = {
  initializeFirebase,
  getDB,
  collections,
  createUser,
  createShop,
  createInventoryItem,
  createSale,
  createReport,
  createAlert,
  createWeatherData,
  getCollection,
  getDocument,
  updateDocument,
  deleteDocument,
  batchWrite
};