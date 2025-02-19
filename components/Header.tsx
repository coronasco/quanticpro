"use client";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import AddTransactionModal from "./AddTransactionModal";
import Notification from "./Notification";
import LeftNavigation from "./navigation/LeftNavigation";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="h-16 bg-white border-b z-50 lg:pl-[310px]">
      <div className="h-full px-4 lg:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[310px]">
              <SheetHeader>
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              </SheetHeader>
              <LeftNavigation mobile onClose={() => setIsMobileMenuOpen(false)} />
            </SheetContent>
          </Sheet>

          <h1 className="text-xl font-semibold bg-gradient-to-r from-lime-500 to-lime-600 bg-clip-text text-transparent">
            QuanticPro
          </h1>
        </div>

        <div className="flex items-center gap-4">
          <AddTransactionModal />
          <Notification />
        </div>
      </div>
    </header>
  );
}