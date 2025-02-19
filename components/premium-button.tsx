import { Button } from "./ui/button";
import { Crown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export function PremiumButton() {
  const { isPremium, loading } = useAuth();

  if (loading || isPremium) return null;

  return (
    <Button variant="outline" className="gap-2" asChild>
      <Link href="/dashboard/premium">
        <Crown className="h-4 w-4" />
        Passa a Premium
      </Link>
    </Button>
  );
} 