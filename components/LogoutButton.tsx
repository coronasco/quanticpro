import { useAuth } from "@/context/AuthContext";
import { LogOut } from "lucide-react";

export function LogoutButton() {
    const { logout } = useAuth();
    return <button onClick={logout}><LogOut className="w-4 h-4"/></button>;
}