import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "@/hooks/use-toast";

export const LEVEL_THRESHOLD = 500;

export const calculateLevel = (exp: number): number => {
  return Math.floor(exp / LEVEL_THRESHOLD) + 1;
};

export const calculateProgress = (exp: number): number => {
  const currentLevelExp = exp % LEVEL_THRESHOLD;
  return (currentLevelExp / LEVEL_THRESHOLD) * 100;
};

export const getBadgeForLevel = (level: number): string => {
  if (level >= 20) return "Legend";
  if (level >= 15) return "Master";
  if (level >= 10) return "Senior";
  if (level >= 5) return "Junior";
  return "Novice";
};

export const updateUserProgress = async (userId: string, newExp: number) => {
  const newLevel = calculateLevel(newExp);
  const updates = {
    exp: newExp,
    level: newLevel,
    badge: getBadgeForLevel(newLevel)
  };
  
  // Aici vom actualiza în Firestore
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, updates);
  
  return updates;
};

export const addExperience = async (userId: string, xpAmount: number) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return;

  const userData = userSnap.data();
  const newExp = userData.exp + xpAmount;
  const newLevel = calculateLevel(newExp);
  const newBadge = getBadgeForLevel(newLevel);

  await updateDoc(userRef, {
    exp: newExp,
    level: newLevel,
    badge: newBadge
  });

  // Notificare pentru XP câștigat
  toast({
    title: "XP Guadagnato!",
    description: `+${xpAmount}XP per questa azione`,
    variant: "success",
  });

  // Notificare pentru level up dacă e cazul
  if (newLevel > userData.level) {
    toast({
      title: "Level Up!",
      description: `Sei salito al livello ${newLevel}!`,
      variant: "success",
    });
  }
}; 