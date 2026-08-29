// Multi-device sync via Firebase Auth + Firestore. Kept as its own module (rather than
// folded into app.js) because it needs ES module imports; app.js stays a classic script
// and talks to this file only through the small window.__* surface defined at the bottom.
import { initializeApp } from './firebase-app.js';
import {
  getAuth, onAuthStateChanged,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut
} from './firebase-auth.js';
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager,
  doc, setDoc, deleteDoc, getDoc, getDocs, collection, onSnapshot
} from './firebase-firestore.js';

// safe to expose client-side - security comes from the Firestore rules below, not from
// hiding this config. Rules restrict every path to request.auth.uid == userId:
//   match /users/{userId}/{document=**} { allow read, write: if request.auth != null && request.auth.uid == userId; }
const firebaseConfig = {
  apiKey: "AIzaSyACaxESzpO11NOqTPBpsBkEqz9LCNkpMhI",
  authDomain: "flight-data-4999f.firebaseapp.com",
  projectId: "flight-data-4999f",
  storageBucket: "flight-data-4999f.firebasestorage.app",
  messagingSenderId: "874722682836",
  appId: "1:874722682836:web:26d620aa7911c538ff1841"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// persistent (IndexedDB-backed) offline cache, with multi-tab support - this app is
// built to work with no connectivity, so Firestore reads/writes need to keep working
// (queued and synced later) the same way the rest of the app already does via localStorage
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});

let currentUser = null;
// id -> JSON-serialized entry, as last known to be in Firestore. Entries are now editable
// in place (not just created/deleted), so a plain set of ids isn't enough to detect a
// change - this also catches "same id, different content" and re-writes it.
let syncedEntries = new Map();
let unsubEntries = null;
let unsubSettings = null;

window.__syncEntries = async (list) => {
  if (!currentUser) return;
  const entriesCol = collection(db, 'users', currentUser.uid, 'entries');
  const currentIds = new Set(list.map((e) => e.id));
  const toWrite = list.filter((e) => syncedEntries.get(e.id) !== JSON.stringify(e));
  const toRemove = [...syncedEntries.keys()].filter((id) => !currentIds.has(id));
  try {
    await Promise.all([
      ...toWrite.map((e) => setDoc(doc(entriesCol, e.id), e)),
      ...toRemove.map((id) => deleteDoc(doc(entriesCol, id)))
    ]);
    syncedEntries = new Map(list.map((e) => [e.id, JSON.stringify(e)]));
  } catch (e) {
    console.warn('sync: could not push entries', e);
  }
};

window.__syncSettings = async (s) => {
  if (!currentUser) return;
  try {
    await setDoc(doc(db, 'users', currentUser.uid, 'settings', 'main'), s);
  } catch (e) {
    console.warn('sync: could not push settings', e);
  }
};

async function mergeAndSubscribe(user) {
  currentUser = user;
  const entriesCol = collection(db, 'users', user.uid, 'entries');
  const settingsDocRef = doc(db, 'users', user.uid, 'settings', 'main');

  const [entriesSnap, settingsSnap] = await Promise.all([getDocs(entriesCol), getDoc(settingsDocRef)]);
  const remoteEntries = entriesSnap.docs.map((d) => d.data());
  const remoteIds = new Set(remoteEntries.map((e) => e.id));

  // anything only on this device (first-ever sign in on this device, or entries added
  // while offline) gets pushed up rather than discarded
  const local = window.__getLocalEntries();
  const localOnly = local.filter((e) => !remoteIds.has(e.id));
  await Promise.all(localOnly.map((e) => setDoc(doc(entriesCol, e.id), e)));

  const merged = [...remoteEntries, ...localOnly];
  syncedEntries = new Map(merged.map((e) => [e.id, JSON.stringify(e)]));
  window.__applyRemoteEntries(merged);

  if (settingsSnap.exists()) {
    window.__applyRemoteSettings(settingsSnap.data());
  } else {
    await setDoc(settingsDocRef, window.__getLocalSettings());
  }

  // live updates so other signed-in devices reflect changes without a manual refresh
  unsubEntries = onSnapshot(entriesCol, (snap) => {
    const list = snap.docs.map((d) => d.data());
    syncedEntries = new Map(list.map((e) => [e.id, JSON.stringify(e)]));
    window.__applyRemoteEntries(list);
  });
  unsubSettings = onSnapshot(settingsDocRef, (snap) => {
    if (snap.exists()) window.__applyRemoteSettings(snap.data());
  });
}

function teardownSync() {
  if (unsubEntries) { unsubEntries(); unsubEntries = null; }
  if (unsubSettings) { unsubSettings(); unsubSettings = null; }
  currentUser = null;
  syncedEntries = new Map();
}

// ---------- Auth screen wiring ----------
const authScreen = document.getElementById('authScreen');
const authTitle = document.getElementById('authTitle');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const authError = document.getElementById('authError');
const authSubmitBtn = document.getElementById('authSubmitBtn');
const authToggleBtn = document.getElementById('authToggleBtn');
const accountStatus = document.getElementById('accountStatus');

let authMode = 'signin'; // or 'signup'

function setAuthMode(mode) {
  authMode = mode;
  authTitle.textContent = mode === 'signin' ? 'Sign in' : 'Create account';
  authSubmitBtn.textContent = mode === 'signin' ? 'Sign in' : 'Create account';
  authToggleBtn.textContent = mode === 'signin' ? "Need an account? Create one" : 'Already have an account? Sign in';
  authError.textContent = '';
}

authToggleBtn.addEventListener('click', () => setAuthMode(authMode === 'signin' ? 'signup' : 'signin'));

function withTimeout(promise, ms, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject({ code: 'auth/network-request-failed', message }), ms))
  ]);
}

authSubmitBtn.addEventListener('click', async () => {
  const email = authEmail.value.trim();
  const password = authPassword.value;
  if (!email || !password) { authError.textContent = 'Enter your email and password.'; return; }
  authSubmitBtn.disabled = true;
  authError.textContent = '';
  try {
    const call = authMode === 'signin'
      ? signInWithEmailAndPassword(auth, email, password)
      : createUserWithEmailAndPassword(auth, email, password);
    await withTimeout(call, 15000, 'Timed out reaching the server.');
  } catch (e) {
    authError.textContent = friendlyAuthError(e.code);
  } finally {
    authSubmitBtn.disabled = false;
  }
});

function friendlyAuthError(code) {
  const map = {
    'auth/invalid-email': 'That email address doesn’t look right.',
    'auth/user-not-found': 'No account with that email - create one instead?',
    'auth/wrong-password': 'Wrong password.',
    'auth/invalid-credential': 'Wrong email or password.',
    'auth/email-already-in-use': 'An account already exists with that email - sign in instead.',
    'auth/weak-password': 'Password needs to be at least 6 characters.',
    'auth/network-request-failed': 'Could not reach the server - check your connection.'
  };
  return map[code] || 'Something went wrong signing in. Try again.';
}

document.getElementById('signOutBtn').addEventListener('click', () => signOut(auth));

onAuthStateChanged(auth, async (user) => {
  if (user) {
    document.body.classList.remove('auth-pending');
    accountStatus.textContent = `Signed in as ${user.email}`;
    authEmail.value = '';
    authPassword.value = '';
    try {
      await mergeAndSubscribe(user);
    } catch (e) {
      console.warn('sync: initial sync failed', e);
    }
  } else {
    document.body.classList.add('auth-pending');
    accountStatus.textContent = 'Not signed in.';
    teardownSync();
    setAuthMode('signin');
  }
});
