import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { PREMIUM_FEATURES } from "@/types/user";
import Link from "next/link";

export default function PrezziPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">I Nostri Prezzi</h1>
          <p className="text-muted-foreground">
            Scegli il piano più adatto alle tue esigenze
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card Base */}
          <Card className="p-6 space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Base</h2>
              <p className="text-2xl font-bold">Gratuito</p>
            </div>
            <div className="space-y-4">
              {PREMIUM_FEATURES.map((feature, index) => (
                <div key={index} className="flex items-start gap-4">
                  {feature.included ? (
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <X className="h-5 w-5 text-red-500 mt-0.5" />
                  )}
                  <div>
                    <p className="font-medium">{feature.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Card Premium */}
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

            <Button asChild className="w-full" size="lg">
              <Link href="/auth">Inizia Ora</Link>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
} 