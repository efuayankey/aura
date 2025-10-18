import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  User
} from "firebase/auth";
import { auth } from "./firebase";

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();

// Request access to Google Calendar
googleProvider.addScope('https://www.googleapis.com/auth/calendar.readonly');
googleProvider.addScope('email');
googleProvider.addScope('profile');

// Set custom parameters
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

/**
 * Sign in with Google using Firebase Authentication
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    
    // This gives you a Google Access Token. You can use it to access the Google API.
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    
    // The signed-in user info.
    const user = result.user;
    
    return { user, token, error: null };
  } catch (error: any) {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData?.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    
    console.error("Error signing in with Google:", errorCode, errorMessage);
    return { user: null, token: null, error: errorMessage };
  }
};

/**
 * Sign in with email and password using Firebase Authentication
 */
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return { user: credential.user, error: null };
  } catch (error: any) {
    console.error("Error signing in with email:", error?.message || error);
    return { user: null, error: error?.message || "Failed to sign in" };
  }
};

/**
 * Register with email and password using Firebase Authentication
 */
export const registerWithEmail = async (
  email: string,
  password: string,
  displayName?: string
) => {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      try {
        await updateProfile(credential.user, { displayName });
      } catch (profileError) {
        console.warn("Profile update failed:", profileError);
      }
    }
    return { user: credential.user, error: null };
  } catch (error: any) {
    console.error("Error registering with email:", error?.message || error);
    return { user: null, error: error?.message || "Failed to register" };
  }
};

/**
 * Send password reset email
 */
export const sendResetEmail = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error: any) {
    console.error("Error sending reset email:", error?.message || error);
    return { error: error?.message || "Failed to send reset email" };
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
