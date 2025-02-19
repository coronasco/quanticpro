// components/ProtectedRoute.tsx
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loading from "@/components/Loading";
import { usePremium } from "@/hooks/use-premium";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requirePremium?: boolean;
}

export default function ProtectedRoute({ children, requirePremium = false }: ProtectedRouteProps) {
  const { user, loading, } = useAuth();
  const  isPremium  = usePremium();
  const premiumLoading = usePremium();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth");
    } else if (!loading && !premiumLoading && requirePremium && !isPremium) {
      router.push("/premium");
    }
  }, [user, loading, isPremium, premiumLoading, requirePremium, router]);

  if (loading || (requirePremium && premiumLoading)) {
    return <Loading />;
  }

  if (!user || (requirePremium && !isPremium)) {
    return null;
  }

  return children;
}
