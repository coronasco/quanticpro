import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Income, Expense } from "@/types/transactions";

export const getMonthKey = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

export const getTransactionsForMonth = async (userId: string, month: string) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return null;

  const data = userSnap.data();
  return {
    incomes: data.incomes?.[month] || [],
    expenses: data.expenses?.[month] || []
  };
};

export const getTransactionsForPeriod = async (
  userId: string, 
  startDate: Date, 
  endDate: Date
) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return null;

  const data = userSnap.data();
  const transactions = {
    incomes: [] as Income[],
    expenses: [] as Expense[]
  };

  // Generăm toate cheile de luni între startDate și endDate
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const monthKey = getMonthKey(currentDate);
    
    if (data.incomes?.[monthKey]) {
      transactions.incomes.push(...data.incomes[monthKey]);
    }
    if (data.expenses?.[monthKey]) {
      transactions.expenses.push(...data.expenses[monthKey]);
    }

    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return transactions;
}; 