export interface Income {
  cash: number;
  pos: number;
  total: number;
  date: Date;
}

export interface Expense {
  name: string;
  amount: number;
  category: 'Food & Beverage' | 'Utilita' | 'Affitto' | 'Bollete' | 'Altro';
  date: Date;
} 