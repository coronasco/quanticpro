import { db } from "./firebase";
import { collection, query, orderBy, limit, getDocs, startAfter, DocumentSnapshot } from "firebase/firestore";

export const getRecentIncomes = async (userId: string, lastVisible: DocumentSnapshot | null = null) => {
  let q = query(
    collection(db, "users", userId, "incomes"),
    orderBy("date", "desc"),
    limit(10)
  );

  if (lastVisible) {
    q = query(q, startAfter(lastVisible));
  }

  const querySnapshot = await getDocs(q);
  return {
    data: querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
    lastVisible: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
  };
};
