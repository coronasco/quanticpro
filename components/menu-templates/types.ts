export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  items: MenuItem[];
} 