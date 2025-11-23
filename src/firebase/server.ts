import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/admin/app';
import { getAuth } from 'firebase/admin/auth';
import { getFirestore } from 'firebase/admin/firestore';
import { firebaseConfig } from './config'; // Using client-side config is okay for admin actions in this context

// This is a server-only file.

function getAdminApp(): FirebaseApp {
    if (getApps().length > 0) {
        return getApp();
    }

    // In a real server environment, you would use service accounts.
    // For this environment, we'll initialize with the client-side config
    // as admin-level operations will be sandboxed/mocked.
    return initializeApp(firebaseConfig);
}

export function getAdminAuth() {
    return getAuth(getAdminApp());
}

export function getAdminFirestore() {
    return getFirestore(getAdminApp());
}
