"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { loginWithGoogle, loginWithEmail, registerWithEmail } from "@/lib/firebase";

export default function LoginPage() {
  const { user, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center">{isRegister ? "Creează un cont" : "Autentificare"}</h2>
        
        {user ? (
          <div className="text-center">
            <p>Bun venit, {user.email}</p>
            <button onClick={logout} className="bg-red-500 text-white w-full mt-4 py-2 rounded">Logout</button>
          </div>
        ) : (
          <>
            <button onClick={handleGoogleLogin} className="bg-blue-500 text-white w-full mt-4 py-2 rounded">
              Autentificare cu Google
            </button>

            <div className="mt-4">
              <input
                type="email"
                placeholder="Email"
                className="w-full p-2 border rounded mb-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Parolă"
                className="w-full p-2 border rounded"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button onClick={handleEmailAuth} className="bg-green-500 text-white w-full mt-4 py-2 rounded">
                {isRegister ? "Creează cont" : "Autentificare"}
              </button>
              <p className="text-center text-sm mt-2">
                {isRegister ? "Ai deja cont?" : "Nu ai cont?"}{" "}
                <span onClick={() => setIsRegister(!isRegister)} className="text-blue-500 cursor-pointer">
                  {isRegister ? "Autentifică-te" : "Înregistrează-te"}
                </span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
