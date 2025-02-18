// components/ProtectedRoute.tsx
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth"); // Redirecționează utilizatorii neautentificați
    }
  }, [user, loading, router]);

  if (loading) return <p>Carico...</p>;

  return user ? children : null;
}
