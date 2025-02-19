"use client"

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogoutButton } from "@/components/LogoutButton";
import useUserData from "@/hooks/useUserData";
import { calculateProgress, LEVEL_THRESHOLD } from "@/lib/levelSystem";
import Loading from "@/components/Loading";
import { cn } from "@/lib/utils";

export default function UserBadge() {
  const [mounted, setMounted] = useState(false);
  const { userData, loading } = useUserData();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  if (loading) return <Loading />;
  if (!userData) return null;

  const { level, exp, badge, email, isPremium } = userData;
  const firstLetter = email.charAt(0).toUpperCase();
  const xpProgress = calculateProgress(exp);

  return (
    <div className="p-4 bg-white rounded-lg border shadow-sm hover:border-lime-400/30 transition-all">
      <div className="border-b pb-3 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-10 w-10 flex-shrink-0 border-2 border-lime-400">
            <AvatarImage src="" />
            <AvatarFallback className="bg-lime-50 text-lime-600 font-medium flex-shrink-0">
              {firstLetter}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="font-medium text-gray-900 truncate">{email}</div>
            <div className={cn(
              "text-xs px-2 py-0.5 rounded-full inline-flex",
              isPremium 
                ? "bg-lime-100 text-lime-700" 
                : "bg-gray-100 text-gray-600"
            )}>
              {isPremium ? 'Premium' : 'Basic'}
            </div>
          </div>
        </div>
        <LogoutButton />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <span className="text-xs font-medium text-lime-600">Badge</span>
          <p className="text-sm font-medium text-gray-900">{badge || 'No Badge'}</p>
        </div>
        <div>
          <span className="text-xs font-medium text-lime-600">Livello</span>
          <p className="text-sm font-medium text-gray-900">{level}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="absolute top-0 left-0 h-full bg-lime-400 transition-all duration-300" 
            style={{ width: `${xpProgress}%` }}
          />
        </div>
        <p className="text-xs text-center text-gray-500">
          {LEVEL_THRESHOLD - (exp % LEVEL_THRESHOLD)} exp per il livello successivo
        </p>
      </div>
    </div>
  );
}
