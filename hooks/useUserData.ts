import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { subscribeToUserData } from "@/lib/firebase";
import { FirebaseUser } from "@/types/user";

/**
 * Custom hook to fetch and cache user data.
 * @returns {Object} - User data and loading state.
 */
export default function useUserData() {
  const [userData, setUserData] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setUserData(null);
      setLoading(false);
      return;
    }

    try {
      const unsubscribe = subscribeToUserData(user.uid, (data) => {
        setUserData(data);
        setLoading(false);
      });

      return () => {
        if (unsubscribe) unsubscribe();
      };
    } catch (error) {
      console.error("Error in useUserData:", error);
      setLoading(false);
    }
  }, [user]);

  return { userData, loading };
}