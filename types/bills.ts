export interface Bill {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  paid: boolean;
  groupId?: string;
  createdAt: string;
  updatedAt: string;
  notified?: {
    threeDays?: boolean;
    oneDay?: boolean;
  };
}

export interface BillGroup {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
} 