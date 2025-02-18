import { useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

/**
 * Listens for changes in user data and updates the cache.
 */
const useUserDataListener = () => {
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);

        // Listen for changes in the user document
        const unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            const data = doc.data();

            // Update the cache
            localStorage.setItem(`userData_${user.uid}`, JSON.stringify(data));
            localStorage.setItem(`userData_${user.uid}_timestamp`, Date.now().toString());
          }
        });

        return () => unsubscribeSnapshot();
      }
    });

    return () => unsubscribeAuth();
  }, []);
};

export default useUserDataListener;