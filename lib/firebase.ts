// firebase/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { 
    createUserWithEmailAndPassword, 
    getAuth, 
    GoogleAuthProvider, 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    signOut,
    AuthError,
} from "firebase/auth";
import { doc, getDoc, getFirestore, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { toast } from "@/hooks/use-toast"
import { FirebaseUser } from "@/types/user";

// 🔥 Configurația Firebase (folosind variabile de mediu)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// 📌 Inițializăm Firebase doar o singură dată
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// 🔥 Firestore optimizat
const db = getFirestore(app);

// Adăugăm un sistem de subscriptions pentru real-time updates
const subscriptions = new Map<string, () => void>();

export const subscribeToUserData = (userId: string, callback: (data: FirebaseUser) => void) => {
  if (subscriptions.has(userId)) {
    const existingUnsubscribe = subscriptions.get(userId);
    if (existingUnsubscribe) existingUnsubscribe(); // Curățăm subscripția veche
  }

  const unsubscribe = onSnapshot(doc(db, "users", userId), (doc) => {
    if (doc.exists()) {
      callback(doc.data() as FirebaseUser);
    }
  }, (error) => {
    console.error("Error in subscription:", error);
  });

  subscriptions.set(userId, unsubscribe);
  return unsubscribe;
};

const unsubscribeFromUserData = (userId: string) => {
  const unsubscribe = subscriptions.get(userId);
  if (unsubscribe) {
    unsubscribe();
    subscriptions.delete(userId);
  }
};

// 🔥 Funcție de login cu Email/Parolă
export const loginWithEmail = async (email: string, password: string) => {
    try {
        if (!email || !password) {
            throw new Error("Email e password sono obbligatori");
        }
        const result = await signInWithEmailAndPassword(auth, email, password);
        toast({
            title: "Accesso effettuato",
            description: "Benvenuto nel tuo account!",
            variant: "success",
        });
        window.location.href = '/dashboard';
        return { user: result.user, error: null };
    } catch (error: unknown) {
        const authError = error as AuthError;
        toast({
            title: "Errore di accesso",
            description: authError.message || "Errore durante l'autenticazione con email e password",
            variant: "destructive",
        });
        return {
            user: null,
            error: authError.message || "Errore durante l'autenticazione con email e password"
        };
    }
};

// 🔥 Funcție de login cu Google
export const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        await createUserIfNotExists(result.user.uid, result.user.email || "");
        toast({
            title: "Accesso effettuato",
            description: "Benvenuto nel tuo account Google!",
            variant: "success",
        });
        window.location.href = '/dashboard';
        return result.user;
    } catch (error: unknown) {
        const authError = error as AuthError;
        toast({
            title: "Errore di accesso",
            description: authError.message || "Errore durante l'autenticazione con Google",
            variant: "destructive",
        });
        return undefined;
    }
};
  
// 🔥 Funcție de înregistrare cu Email/Parolă
export const registerWithEmail = async (email: string, password: string) => {
    try {
        if (!email || !password) {
            throw new Error("Email e password sono obbligatori");
        }
        if (password.length < 6) {
            throw new Error("La password deve contenere almeno 6 caratteri");
        }
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await createUserIfNotExists(result.user.uid, email);
        toast({
            title: "Registrazione completata",
            description: "Account creato con successo!",
            variant: "success",
        });
        window.location.href = '/dashboard';
        return { user: result.user, error: null };
    } catch (error: unknown) {
        const authError = error as AuthError;
        toast({
            title: "Errore di registrazione",
            description: authError.message || "Errore durante la registrazione",
            variant: "destructive",
        });
        return {
            user: null,
            error: authError.message || "Errore durante la registrazione"
        };
    }
};

// 🔥 Crearea unui document Firestore pentru utilizatorii noi
const createUserIfNotExists = async (userId: string, email: string) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      email,
      isPremium: false,
      exp: 0,
      level: 1,
      badge: "Novice",
      incomes: {},  // Va stoca tranzacții grupate pe luni: { "2024-03": [...] }
      expenses: {}, // Va stoca tranzacții grupate pe luni: { "2024-03": [...] }
      bills: [],
    });
  } else {
    // Actualizăm badge-ul dacă e gol
    const userData = userSnap.data();
    if (!userData.badge) {
      await updateDoc(userRef, {
        badge: "Novice"
      });
    }
  }
};
  
// 🔥 Funcție de Logout
export const logout = async () => {
    try {
        await signOut(auth);
        toast({
            title: "Disconnessione effettuata",
            description: "Hai effettuato il logout con successo",
            variant: "success",
        });
    } catch (error) {
        toast({
            title: "Errore",
            description: "Errore durante il logout",
            variant: "destructive",
        });
        console.error("Errore durante il logout:", error);
    }
};

export const updateExistingUsersBadge = async (userId: string) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists() && !userSnap.data().badge) {
    await updateDoc(userRef, {
      badge: "Novice"
    });
  }
};

export { 
  auth, 
  provider, 
  db, 
  app,
  unsubscribeFromUserData 
};
