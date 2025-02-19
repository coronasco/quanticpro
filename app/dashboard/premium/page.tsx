"use client";

import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { PREMIUM_FEATURES } from "@/types/user";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPremiumPage() {
  const { isPremium, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isPremium) {
      router.push("/dashboard");
    }
  }, [isPremium, router]);

  const handleSubscribe = async () => {
    if (!user) {
      console.log("No user found");
      toast({
        title: "Errore",
        description: "Devi essere loggato per continuare"
      });
      return;
    }

    console.log("Attempting checkout with user:", { uid: user.uid, email: user.email });

    try {
      const response = await fetch("/api/checkout", { 
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user.uid,
          email: user.email
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Network response was not ok');
      }

      const data = await response.json();
      console.log("Checkout response:", data);

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il processo di pagamento"
      });
    }
  };

  if (isPremium) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">Passa a Premium</h1>
          <p className="text-muted-foreground">
            Sblocca tutte le funzionalità premium
          </p>
        </div>

        <Card className="p-6 space-y-6 border-2 border-primary">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Premium</h2>
            <p className="text-2xl font-bold">€9.99/mese</p>
          </div>
          
          <div className="space-y-4">
            {PREMIUM_FEATURES.map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">{feature.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Button 
            className="w-full" 
            size="lg"
            onClick={handleSubscribe}
          >
            Passa a Premium
          </Button>
        </Card>
      </div>
    </div>
  );
} 