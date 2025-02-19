export interface User {
  id: string;
  email: string;
  isPremium: boolean;
  premiumUntil?: string;
  stripeCustomerId?: string;
}

export interface Bill {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  paid: boolean;
  groupId?: string;
  notified?: {
    threeDays?: boolean;
    oneDay?: boolean;
  };
}

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
  bills: Bill[];
}

export interface UserProfile {
  id: string;
  email: string;
  isPremium: boolean;
  premiumUntil?: string;
  stripeCustomerId?: string;
  createdAt: string;
}

export interface PremiumFeature {
  title: string;
  description: string;
  included: boolean;
}

export const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    title: "Statistiche Base",
    description: "Tracciamento base delle vendite e spese",
    included: true
  },
  {
    title: "Statistiche Avanzate",
    description: "Analisi dettagliate, grafici e previsioni",
    included: false
  },
  {
    title: "Gestione Menu",
    description: "Creazione e gestione menu base",
    included: true
  },
  {
    title: "Menu QR Code",
    description: "QR code personalizzati e analytics",
    included: false
  },
  {
    title: "Promemoria",
    description: "Promemoria base per le fatture",
    included: true
  },
  {
    title: "Automazioni",
    description: "Automazioni avanzate e notifiche personalizzate",
    included: false
  }
]; 