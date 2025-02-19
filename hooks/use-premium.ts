
'use client'
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

export const usePremium = () => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    if (!user) return;

    const checkPremiumStatus = async () => {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setIsPremium(userSnap.data().isPremium || false);
      }
    };

    checkPremiumStatus();
  }, [user]);

  return isPremium;
};