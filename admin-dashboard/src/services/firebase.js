// =============================================
// Firebase Configuration — Mashhor Hub Admin
// Replace the firebaseConfig values below with
// your actual Firebase project credentials from:
// https://console.firebase.google.com
// =============================================

import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
// 🔒 Storage disabled — requires Firebase Blaze plan
// Uncomment below when you upgrade:
// import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject, listAll } from 'firebase/storage';

const firebaseConfig = {
  apiKey:            "AIzaSyC_xOzP3YqDw4L6GSsib2yKOWrmIHilBe8",
  authDomain:        "mashhour-hub.firebaseapp.com",
  projectId:         "mashhour-hub",
  storageBucket:     "mashhour-hub.firebasestorage.app",
  messagingSenderId: "827072090619",
  appId:             "1:827072090619:web:78acdacabf8438bf337b5e",
  measurementId:     "G-SN1MXE4D0X",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Exports
export const auth    = getAuth(app);
export const db      = getFirestore(app);
// export const storage = getStorage(app); // Disabled — upgrade to Blaze plan to enable

// ─── Auth Helpers ────────────────────────────────────────────────────────────
export const loginWithEmail = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const logoutUser = () => signOut(auth);

export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);

// ─── Firestore Helpers ───────────────────────────────────────────────────────
export const getCollection = async (collectionName) => {
  const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getDocument = async (collectionName, docId) => {
  const snap = await getDoc(doc(db, collectionName, docId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const addDocument = (collectionName, data) =>
  addDoc(collection(db, collectionName), { ...data, createdAt: serverTimestamp() });

export const updateDocument = (collectionName, docId, data) =>
  updateDoc(doc(db, collectionName, docId), { ...data, updatedAt: serverTimestamp() });

export const deleteDocument = (collectionName, docId) =>
  deleteDoc(doc(db, collectionName, docId));

// ─── Storage Helpers (Disabled — Firebase Blaze plan required) ───────────────
// These are stub functions that show a friendly message until you upgrade.
export const uploadFile = () => Promise.reject(new Error('Storage requires Firebase Blaze plan. Upgrade at console.firebase.google.com'));
export const deleteFile = () => Promise.reject(new Error('Storage requires Firebase Blaze plan.'));
export const listFiles  = () => Promise.resolve([]);
