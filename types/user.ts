export interface FirebaseUser {
  email: string;
  level: number;
  exp: number;
  badge: string;
  isPremium: boolean;
  incomes: {
    [key: string]: Array<{
      cash: number;
      pos: number;
      total: number;
      date: string;
    }>;
  };
  expenses: {
    [key: string]: Array<{
      name: string;
      amount: number;
      category: string;
      date: string;
    }>;
  };
  bills: any[]; // Vom defini mai târziu structura pentru bills
} 