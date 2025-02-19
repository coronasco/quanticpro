import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Shield, Smartphone, Coffee } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: 'QuanticPro | Gestione Aziendale Intelligente',
  description: 'QuanticPro - La piattaforma all-in-one per la gestione del tuo business. Gestisci menu digitali, finanze e molto altro.',
  keywords: ['gestione aziendale', 'menu digitale', 'qr code menu', 'gestione finanze', 'business management'],
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/95">
      {/* Hero Section */}
      <section className="relative pt-20 lg:pt-32 pb-16">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
                Gestisci il tuo business con
                <span className="bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent"> QuanticPro</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto lg:mx-0">
                La piattaforma all-in-one che ti permette di gestire menu digitali, 
                finanze e molto altro in modo semplice ed efficiente.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" asChild>
                  <Link href="/dashboard">
                    Inizia Ora <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline">
                  Scopri di più
                </Button>
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-lg blur-2xl opacity-30"></div>
                <Image 
                  src="/dashboard-preview.png" 
                  alt="QuanticPro Dashboard"
                  width={800}
                  height={600}
                  className="relative rounded-lg shadow-2xl border border-border/50"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black/5">
        <div className="container px-4 mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12">
            Tutto ciò di cui hai bisogno in un&apos;unica piattaforma
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Coffee />}
              title="Menu Digitale"
              description="Crea e gestisci menu digitali con QR code. Aggiorna i prezzi in tempo reale."
            />
            <FeatureCard 
              icon={<Zap />}
              title="Gestione Veloce"
              description="Interface intuitiva per una gestione rapida ed efficiente del tuo business."
            />
            <FeatureCard 
              icon={<Shield />}
              title="Sicurezza Avanzata"
              description="I tuoi dati sono al sicuro con la nostra tecnologia di crittografia."
            />
            <FeatureCard 
              icon={<Smartphone />}
              title="Mobile First"
              description="Accedi a tutte le funzionalità da qualsiasi dispositivo, ovunque tu sia."
            />
            {/* Add more feature cards as needed */}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container px-4 mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Pronto a trasformare il tuo business?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Unisciti a migliaia di imprenditori che hanno già scelto QuanticPro 
              per la gestione del loro business.
            </p>
            <Button size="lg" asChild>
              <Link href="/dashboard">
                Inizia Gratuitamente <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-violet-500" />
              <span className="font-bold text-xl">QuanticPro</span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Termini di Servizio
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Contatti
              </Link>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 QuanticPro. Tutti i diritti riservati.
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
}) {
  return (
    <div className="group p-6 bg-card rounded-lg border border-border/50 hover:border-violet-500/50 transition-colors">
      <div className="h-12 w-12 rounded-lg bg-violet-500/10 text-violet-500 flex items-center justify-center mb-4 group-hover:bg-violet-500 group-hover:text-white transition-colors">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
