"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Wallet,
  CreditCard,
  List,
  ListCheck,
  Coffee,
  Settings,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  QrCode,
} from "lucide-react";
import UserBadge from "@/components/UserBadge";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface Props {
  mobile?: boolean;
  onClose?: () => void;
}

export default function LeftNavigation({ mobile, onClose }: Props) {
  const [isListOpen, setIsListOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const NAV_ITEMS = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    { href: "/dashboard/menugenerator", label: "Menu Generator", icon: <QrCode className="w-5 h-5" /> },
  ];

  const FINANCE_ITEMS = [
    { href: "/dashboard/income", label: "Incassi", icon: <Wallet className="w-5 h-5" /> },
    { href: "/dashboard/expense", label: "Spese", icon: <CreditCard className="w-5 h-5" /> },
  ];

  const LIST_SUBITEMS = [
    { href: "/dashboard/list", label: "Lista Spese", icon: <ListCheck className="w-5 h-5" /> },
    { href: "/dashboard/products", label: "Prodotti", icon: <Coffee className="w-5 h-5" /> },
  ];

  const SUPPORT_ITEMS = [
    { href: "/dashboard/helpcenter", label: "Assistenza", icon: <HelpCircle className="w-5 h-5" /> },
    { href: "/dashboard/settings", label: "Impostazioni", icon: <Settings className="w-5 h-5" /> },
  ];

  const NavLink = ({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) => (
    <Link
      href={href}
      onClick={onClose}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-lime-400/20 transition-colors",
        pathname === href ? "bg-lime-400 text-gray-900" : "text-gray-600 hover:text-gray-900"
      )}
    >
      {icon}
      {label}
    </Link>
  );

  return (
    <div className={cn(
      "h-screen bg-white border-r",
      mobile && "h-[100dvh] overflow-hidden"
    )}>
      <div className="flex flex-col h-full">
        <div className="p-4 flex-shrink-0">
          <UserBadge />
        </div>
        
        <div className="flex-1 space-y-4 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
          <nav className="grid items-start gap-4">
            <div>
              <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
                Menu
              </h2>
              <div className="space-y-1">
                {NAV_ITEMS.map((item) => (
                  <NavLink key={item.href} {...item} />
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
                Finanze
              </h2>
              <div className="space-y-1">
                {FINANCE_ITEMS.map((item) => (
                  <NavLink key={item.href} {...item} />
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
                Liste
              </h2>
              <div className="space-y-1">
                <button
                  onClick={() => setIsListOpen(!isListOpen)}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-lime-400/20 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <List className="w-5 h-5" />
                    Lista
                  </div>
                  {isListOpen ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {isListOpen && (
                  <div className="ml-4 space-y-1">
                    {LIST_SUBITEMS.map((item) => (
                      <NavLink key={item.href} {...item} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
                Supporto
              </h2>
              <div className="space-y-1">
                {SUPPORT_ITEMS.map((item) => (
                  <NavLink key={item.href} {...item} />
                ))}
              </div>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
