import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  
  ListCheck,
  Coffee,
  Settings,
  HelpCircle,
  QrCode,
} from "lucide-react";

export const NAV_ITEMS = [
  { 
    href: "/dashboard", 
    label: "Dashboard", 
    icon: <LayoutDashboard className="w-5 h-5" /> 
  },
  { 
    href: "/dashboard/menugenerator", 
    label: "Menu Generator", 
    icon: <QrCode className="w-5 h-5" /> 
  },
];

export const FINANCE_ITEMS = [
  { 
    href: "/dashboard/income", 
    label: "Incassi", 
    icon: <Wallet className="w-5 h-5" /> 
  },
  { 
    href: "/dashboard/expense", 
    label: "Spese", 
    icon: <CreditCard className="w-5 h-5" /> 
  },
];

export const LIST_SUBITEMS = [
  { 
    href: "/dashboard/list", 
    label: "Lista Spese", 
    icon: <ListCheck className="w-5 h-5" /> 
  },
  { 
    href: "/dashboard/products", 
    label: "Prodotti", 
    icon: <Coffee className="w-5 h-5" /> 
  },
];

export const SUPPORT_ITEMS = [
  { 
    href: "/dashboard/helpcenter", 
    label: "Assistenza", 
    icon: <HelpCircle className="w-5 h-5" /> 
  },
  { 
    href: "/dashboard/settings", 
    label: "Impostazioni", 
    icon: <Settings className="w-5 h-5" /> 
  },
]; 