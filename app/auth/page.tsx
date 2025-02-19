"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { loginWithGoogle, loginWithEmail, registerWithEmail } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const { user, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  const handleGoogleLogin = async () => {
    await loginWithGoogle();
  };

  const handleEmailAuth = async () => {
    if (isRegister) {
      await registerWithEmail(email, password);
    } else {
      await loginWithEmail(email, password);
    }
  };

  useEffect(() => {
    if (user) {
      router.push(callbackUrl || '/dashboard');
    }
  }, [user, router, callbackUrl]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <Card className="w-[350px] sm:w-[400px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isRegister ? "Crea un Account" : "Accedi"}
          </CardTitle>
          <CardDescription className="text-center">
            {isRegister 
              ? "Inserisci i tuoi dati per creare un account"
              : "Inserisci le tue credenziali per accedere"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Benvenuto, {user.email}
              </p>
              <Button 
                variant="destructive" 
                className="w-full" 
                onClick={logout}
              >
                Esci
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={handleGoogleLogin}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continua con Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    O continua con
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nome@esempio.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button className="w-full" onClick={handleEmailAuth}>
                  {isRegister ? "Registrati" : "Accedi"}
                </Button>
              </div>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">
                  {isRegister ? "Hai già un account? " : "Non hai un account? "}
                </span>
                <button
                  className="text-primary hover:underline"
                  onClick={() => setIsRegister(!isRegister)}
                >
                  {isRegister ? "Accedi" : "Registrati"}
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
