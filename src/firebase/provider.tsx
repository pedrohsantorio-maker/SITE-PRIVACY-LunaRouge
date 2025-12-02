'use client';

import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';
import type { DependencyList, ReactNode } from 'react';
import { type FirebaseApp } from 'firebase/app';
import { type Firestore, doc, serverTimestamp, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { type Auth, type User, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

export interface FirebaseServices {
  firebaseApp: FirebaseApp;
  firestore: Firestore;
  auth: Auth;
}

interface FirebaseProviderProps extends FirebaseServices {
  children: ReactNode;
}

// Internal state for user authentication
interface UserAuthState {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Combined state for the Firebase context
export interface FirebaseContextState extends FirebaseServices {
  areServicesAvailable: boolean; // True if core services (app, firestore, auth instance) are provided
  // User authentication state
  user: User | null;
  isUserLoading: boolean; // True during initial auth check
  userError: Error | null; // Error from auth listener
}

// Return type for useFirebase()
export interface FirebaseServicesAndUser extends FirebaseServices {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Return type for useUser() - specific to user auth state
export interface UserHookResult { // Renamed from UserAuthHookResult for consistency if desired, or keep as UserAuthHookResult
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// React Context
export const FirebaseContext = createContext<FirebaseContextState | undefined>(undefined);

/**
 * FirebaseProvider manages and provides Firebase services and user authentication state.
 */
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  firestore,
  auth,
}) => {
  const [userAuthState, setUserAuthState] = useState<UserAuthState>({
    user: null,
    isUserLoading: true, // Start loading until first auth event
    userError: null,
  });

  // Effect to subscribe to Firebase auth state changes and create user document
  useEffect(() => {
    if (!auth || !firestore) { // If no Auth service instance, cannot determine user state
      setUserAuthState({ user: null, isUserLoading: false, userError: new Error("Auth or Firestore service not provided.") });
      return;
    }

    const handleUser = async (firebaseUser: User | null) => {
       if (firebaseUser) {
           // User is signed in.
           const userRef = doc(firestore, 'users', firebaseUser.uid);
           const userDoc = await getDoc(userRef);

           if (!userDoc.exists()) {
               // User document doesn't exist, create it.
               const newUserData = {
                   name: 'Visitante',
                   email: firebaseUser.isAnonymous ? `${firebaseUser.uid}@anon.com` : (firebaseUser.email || `${firebaseUser.uid}@anon.com`),
                   subscriptionId: 'null',
                   status: 'not_paid',
                   createdAt: serverTimestamp(),
                   lastActive: serverTimestamp(),
                   hasClickedSubscription: false,
               };
               try {
                   await setDoc(userRef, newUserData);
               } catch (e) {
                   console.error("FirebaseProvider: Error creating user document:", e);
               }
           }
           setUserAuthState({ user: firebaseUser, isUserLoading: false, userError: null });
       } else {
           // No user signed in, attempt anonymous sign-in
           try {
               await signInAnonymously(auth);
               // onAuthStateChanged will be re-triggered with the new user
           } catch (error) {
               console.error("FirebaseProvider: Anonymous sign-in failed:", error);
               setUserAuthState({ user: null, isUserLoading: false, userError: error as Error });
           }
       }
    };

    const unsubscribe = onAuthStateChanged(auth, handleUser, (error) => {
        console.error("FirebaseProvider: onAuthStateChanged error:", error);
        setUserAuthState({ user: null, isUserLoading: false, userError: error });
    });

    return () => unsubscribe();
  }, [auth, firestore]);


  // Effect to update user's lastActive timestamp
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const updateUserActivity = async () => {
      if (userAuthState.user && firestore) {
        const userRef = doc(firestore, 'users', userAuthState.user.uid);
        try {
          // Use serverTimestamp for consistency
          await updateDoc(userRef, { lastActive: serverTimestamp() });
        } catch (error) {
          // Don't log this error as it's not critical and can be noisy
          // console.error("Failed to update lastActive timestamp:", error);
        }
      }
    };
    
    // Set up an interval to update activity every 30 seconds
    if (userAuthState.user && firestore) {
        // Run it once immediately
        updateUserActivity();
        intervalId = setInterval(updateUserActivity, 30000); // 30 seconds
    }

    // Clean up interval on component unmount or when user logs out
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [userAuthState.user, firestore]);


  // Memoize the context value
  const contextValue = useMemo((): FirebaseContextState => {
    const servicesAvailable = !!(firebaseApp && firestore && auth);
    return {
      areServicesAvailable: servicesAvailable,
      firebaseApp: firebaseApp,
      firestore: firestore,
      auth: auth,
      user: userAuthState.user,
      isUserLoading: userAuthState.isUserLoading,
      userError: userAuthState.userError,
    };
  }, [firebaseApp, firestore, auth, userAuthState]);

  return (
    <FirebaseContext.Provider value={contextValue}>
      <FirebaseErrorListener />
      {children}
    </FirebaseContext.Provider>
  );
};

/**
 * Hook to access core Firebase services and user authentication state.
 * Throws error if core services are not available or used outside provider.
 */
export const useFirebase = (): FirebaseServicesAndUser => {
  const context = useContext(FirebaseContext);

  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider.');
  }

  if (!context.areServicesAvailable || !context.firebaseApp || !context.firestore || !context.auth) {
    throw new Error('Firebase core services not available. Check FirebaseProvider props.');
  }

  return {
    firebaseApp: context.firebaseApp,
    firestore: context.firestore,
    auth: context.auth,
    user: context.user,
    isUserLoading: context.isUserLoading,
    userError: context.userError,
  };
};

/** Hook to access Firebase Auth instance. */
export const useAuth = (): Auth => {
  const { auth } = useFirebase();
  return auth;
};

/** Hook to access Firestore instance. */
export const useFirestore = (): Firestore => {
  const { firestore } = useFirebase();
  return firestore;
};

/** Hook to access Firebase App instance. */
export const useFirebaseApp = (): FirebaseApp => {
  const { firebaseApp } = useFirebase();
  return firebaseApp;
};

type MemoFirebase <T> = T & {__memo?: boolean};

export function useMemoFirebase<T>(factory: () => T, deps: DependencyList): T | (MemoFirebase<T>) {
  const memoized = useMemo(factory, deps);
  
  if(typeof memoized !== 'object' || memoized === null) return memoized;
  (memoized as MemoFirebase<T>).__memo = true;
  
  return memoized;
}

/**
 * Hook specifically for accessing the authenticated user's state.
 * This provides the User object, loading status, and any auth errors.
 * @returns {UserHookResult} Object with user, isUserLoading, userError.
 */
export const useUser = (): UserHookResult => { // Renamed from useAuthUser
  const { user, isUserLoading, userError } = useFirebase(); // Leverages the main hook
  return { user, isUserLoading, userError };
};
