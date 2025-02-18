import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const addIncome = async (userId: string, amount: number, type: string) => {
  try {
    await addDoc(collection(db, "users", userId, "incomes"), {
      amount,
      type,
      date: serverTimestamp(), // 🔥 Folosim timestamp Firebase pentru eficiență
    });
  } catch (error) {
    console.error("Eroare la salvarea venitului:", error);
  }
};