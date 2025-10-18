import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User
} from "firebase/auth";
import { auth } from "./firebase";

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    return { user, error: null };
  } catch (error: any) {
    const errorCode = error.code;
    let errorMessage = error.message;
    
    // Provide user-friendly error messages
    if (errorCode === 'auth/user-not-found') {
      errorMessage = 'No account found with this email.';
    } else if (errorCode === 'auth/wrong-password') {
      errorMessage = 'Incorrect password.';
    } else if (errorCode === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.';
    } else if (errorCode === 'auth/user-disabled') {
      errorMessage = 'This account has been disabled.';
    }
    
    console.error("Error signing in:", errorCode, errorMessage);
    return { user: null, error: errorMessage };
  }
};

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;
    
    // Update display name if provided
    if (displayName) {
      await updateProfile(user, { displayName });
    }
    
    return { user, error: null };
  } catch (error: any) {
    const errorCode = error.code;
    let errorMessage = error.message;
    
    // Provide user-friendly error messages
    if (errorCode === 'auth/email-already-in-use') {
      errorMessage = 'An account with this email already exists.';
    } else if (errorCode === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.';
    } else if (errorCode === 'auth/weak-password') {
      errorMessage = 'Password should be at least 6 characters.';
    }
    
    console.error("Error signing up:", errorCode, errorMessage);
    return { user: null, error: errorMessage };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error: any) {
    console.error("Error signing out:", error.message);
    return { error: error.message };
  }
};

/**
 * Subscribe to auth state changes
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Get the current user
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};
