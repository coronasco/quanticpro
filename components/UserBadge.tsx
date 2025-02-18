"use client"

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogoutButton } from "@/components/LogoutButton";
import useUserData from "@/hooks/useUserData";
import { calculateProgress, LEVEL_THRESHOLD } from "@/lib/levelSystem";
import Loading from "@/components/Loading";
export function UserBadge() {
  const [mounted, setMounted] = useState(false);
  const { userData, loading } = useUserData();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Nu renderizăm nimic pe server
  if (!mounted) return null;

  if (loading) return <Loading />;
  if (!userData) return null;

  const { level, exp, badge, email, isPremium } = userData;
  const firstLetter = email.charAt(0).toUpperCase();
  const xpProgress = calculateProgress(exp);
  
  return (
    <>
        <div className="p-2 bg-white rounded-lg border">
            <div className="border-b pb-2 mb-2 flex items-center justify-between font-semibold text-sm text-lime-800">
                <div className="flex items-center gap-2">
                    <Avatar>
                        <AvatarImage src="" />
                        <AvatarFallback>{firstLetter}</AvatarFallback>
                    </Avatar>
                    <div className="truncate max-w-[150px]">
                        {email}
                    </div>
                </div>
                <LogoutButton />
            </div>

            <div className="flex items-center justify-evenly">
                <div className="w-full">
                    <span className="text-xs font-semibold text-lime-600">Badge</span>
                    <p className="text-md">{badge || 'No Badge'}</p>
                </div>
                <div className="w-full">
                    <span className="text-xs font-semibold text-lime-600">Livello</span>
                    <p className="text-md">{level}</p>
                </div>
                <div className="w-full">
                    <span className="text-xs font-semibold text-lime-600">Piano</span>
                    <p className="text-md">{isPremium ? 'Premium' : 'Basic'}</p>
                </div>
            </div>

            <div className="mt-2 border-t pt-4 pb-2">
                <div className="relative w-full h-3 bg-gray-100 rounded-full">
                    <span 
                        className="absolute top-0 left-0 rounded-full h-3 bg-lime-400" 
                        style={{ width: `${xpProgress}%` }}
                    ></span>
                </div>
                <p className="text-xs text-center text-gray-500 mt-1">
                    {LEVEL_THRESHOLD - (exp % LEVEL_THRESHOLD)} exp per il livello successivo
                </p>
            </div>
        </div>
    </>
    );
}
