"use client";

import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu, List, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS, FINANCE_ITEMS, LIST_SUBITEMS, SUPPORT_ITEMS } from "@/components/navigation/LeftNavigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import AddTransactionModal from "./AddTransactionModal";
import Notification from "./Notification";
import { useState, useEffect } from "react";
import { UserBadge } from "./UserBadge";

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Rezolvă eroarea de hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  if (!mounted) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border rounded-md lg:px-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-2">
        <div className="text-sm font-semibold px-2">
          Quantic
        </div>
        <div className="flex items-center gap-4 w-full">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0">
              <SheetHeader className="px-6 py-4 border-b">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex h-full flex-col">
                <div className="p-6 border-b">
                  <UserBadge />
                </div>
                <nav className="flex-1 space-y-4 p-4">
                  <div>
                    <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
                      Menu
                    </h2>
                    <div className="space-y-1">
                      {NAV_ITEMS.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={handleLinkClick}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                            pathname === item.href ? "bg-accent" : "transparent"
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
                          onClick={handleLinkClick}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                            pathname === item.href ? "bg-accent" : "transparent"
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
                        className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <List className="h-5 w-5" />
                          Lista
                        </div>
                        {isListOpen ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                      {isListOpen && (
                        <div className="ml-4 space-y-1">
                          {LIST_SUBITEMS.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={handleLinkClick}
                              className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
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
                          onClick={handleLinkClick}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                            pathname === item.href ? "bg-accent" : "transparent"
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
            </SheetContent>
          </Sheet>

          <div className="flex w-full items-center justify-between gap-4 ml-auto">
            <div className="lg:px-4">
              <AddTransactionModal />
            </div>
            <div className="px-2 cursor-pointer">
              <Notification />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}