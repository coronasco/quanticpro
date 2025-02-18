"use client"

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updatePassword, updateProfile } from "firebase/auth";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import Loading from "@/components/Loading";

interface UserSettings {
  displayName: string;
  dailyGoal: number;
  emailNotifications: boolean;
  darkMode: boolean;
  language: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    displayName: "",
    dailyGoal: 600,
    emailNotifications: true,
    darkMode: false,
    language: "it"
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !user) return;

    const fetchSettings = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setSettings(prev => ({
            ...prev,
            ...data.settings,
            displayName: data.displayName || user.email?.split("@")[0] || ""
          }));
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [user, mounted]);

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        displayName: settings.displayName,
        settings: {
          dailyGoal: settings.dailyGoal,
          emailNotifications: settings.emailNotifications,
          darkMode: settings.darkMode,
          language: settings.language
        }
      });

      if (user.email && user.email.includes("@")) {
        await updateProfile(user, {
          displayName: settings.displayName
        });
      }

      toast({
        title: "Successo",
        description: "Profilo aggiornato con successo",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore durante l'aggiornamento del profilo",
        variant: "destructive",
      });
      console.error("Error updating profile:", error);
    }
  };

  const handleUpdatePassword = async () => {
    if (!user || !user.email) return;

    if (passwords.new !== passwords.confirm) {
      toast({
        title: "Errore",
        description: "Le password non corrispondono",
        variant: "destructive",
      });
      return;
    }

    try {
      await updatePassword(user, passwords.new);
      setPasswords({ current: "", new: "", confirm: "" });
      toast({
        title: "Successo",
        description: "Password aggiornata con successo",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore durante l'aggiornamento della password",
        variant: "destructive",
      });
      console.error("Error updating password:", error);
    }
  };

  const handleUpdateSettings = async () => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        settings: {
          dailyGoal: settings.dailyGoal,
          emailNotifications: settings.emailNotifications,
          darkMode: settings.darkMode,
          language: settings.language
        }
      });

      toast({
        title: "Successo",
        description: "Impostazioni aggiornate con successo",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore durante l'aggiornamento delle impostazioni",
        variant: "destructive",
      });
      console.error("Error updating settings:", error);
    }
  };

  if (!mounted) return null;
  if (!user) return null;
  if (loading) return <Loading />;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Impostazioni</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profilo</CardTitle>
          <CardDescription>Gestisci le tue informazioni personali</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Nome Visualizzato</Label>
            <Input
              value={settings.displayName}
              onChange={(e) => setSettings(prev => ({ ...prev, displayName: e.target.value }))}
              placeholder="Il tuo nome"
            />
          </div>
          <Button onClick={handleUpdateProfile}>Aggiorna Profilo</Button>
        </CardContent>
      </Card>

      {user.email && !user.email.includes("google") && (
        <Card>
          <CardHeader>
            <CardTitle>Sicurezza</CardTitle>
            <CardDescription>Modifica la tua password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Password Attuale</Label>
              <Input
                type="password"
                value={passwords.current}
                onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
              />
            </div>
            <div>
              <Label>Nuova Password</Label>
              <Input
                type="password"
                value={passwords.new}
                onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
              />
            </div>
            <div>
              <Label>Conferma Password</Label>
              <Input
                type="password"
                value={passwords.confirm}
                onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
              />
            </div>
            <Button onClick={handleUpdatePassword}>Aggiorna Password</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Preferenze</CardTitle>
          <CardDescription>Personalizza la tua esperienza</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-2">
            <Label>Obiettivo Giornaliero (€)</Label>
            <Input
              type="number"
              value={settings.dailyGoal}
              onChange={(e) => setSettings(prev => ({ ...prev, dailyGoal: Number(e.target.value) }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Notifiche Email</Label>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, emailNotifications: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Modalità Scura</Label>
            <Switch
              checked={settings.darkMode}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, darkMode: checked }))
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Lingua</Label>
            <select
              className="form-select"
              value={settings.language}
              onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
            >
              <option value="it">Italiano</option>
              <option value="en">English</option>
            </select>
          </div>

          <Button onClick={handleUpdateSettings}>Salva Preferenze</Button>
        </CardContent>
      </Card>
    </div>
  );
}