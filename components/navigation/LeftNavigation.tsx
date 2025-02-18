"use client";

import { useState } from "react";
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
import { UserBadge } from "@/components/UserBadge";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
  { href: "/dashboard/menugenerator", label: "Menu Generator", icon: <QrCode className="w-5 h-5" /> },
];

export const FINANCE_ITEMS = [
  { href: "/dashboard/income", label: "Incassi", icon: <Wallet className="w-5 h-5" /> },
  { href: "/dashboard/expense", label: "Spese", icon: <CreditCard className="w-5 h-5" /> },
];

export const LIST_SUBITEMS = [
  { href: "/dashboard/list", label: "Lista Spese", icon: <ListCheck className="w-5 h-5" /> },
  { href: "/dashboard/products", label: "Prodotti", icon: <Coffee className="w-5 h-5" /> },
];

export const SUPPORT_ITEMS = [
  { href: "/dashboard/helpcenter", label: "Assistenza", icon: <HelpCircle className="w-5 h-5" /> },
  { href: "/dashboard/settings", label: "Impostazioni", icon: <Settings className="w-5 h-5" /> },
];

export default function LeftNavigation() {
  const [isListOpen, setIsListOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="hidden border-r md:block w-[310px] m-2 border rounded-md bg-slate-50">
      <div className="flex h-full flex-col">
        <div className="p-4">
          <UserBadge />
        </div>
        
        <div className="flex-1 space-y-4 p-4">
          <nav className="grid items-start gap-4">
            <div>
              <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
                Menu
              </h2>
              <div className="space-y-1">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-lime-400 hover:text-accent-foreground transition-colors",
                      pathname === item.href ? "bg-lime-400" : "transparent"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
                Finanze
              </h2>
              <div className="space-y-1">
                {FINANCE_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-lime-400 hover:text-accent-foreground transition-colors",
                      pathname === item.href ? "bg-lime-400" : "transparent"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
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
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-lime-400 hover:text-accent-foreground transition-colors"
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
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-lime-400 hover:text-accent-foreground transition-colors",
                          pathname === item.href ? "bg-accent" : "transparent"
                        )}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
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
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-lime-400 hover:text-accent-foreground transition-colors",
                      pathname === item.href ? "bg-lime-400" : "transparent"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </div>
      </div>
    </div>
  );
}
