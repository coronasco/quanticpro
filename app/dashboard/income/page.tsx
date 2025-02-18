"use client"

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MonthSelector } from "@/components/MonthSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loading from "@/components/Loading";
import { Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { addExperience } from "@/lib/levelSystem";

const XP_PER_TRANSACTION = 10;

interface Income {
  cash: number;
  pos: number;
  total: number;
  date: string;
}

interface EditIncomeDialogProps {
  income: Income;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedIncome: Income) => void;
}

function EditIncomeDialog({ income, isOpen, onClose, onSave }: EditIncomeDialogProps) {
  const [cash, setCash] = useState(income.cash.toString());
  const [pos, setPos] = useState(income.pos.toString());

  const handleSave = () => {
    onSave({
      ...income,
      cash: Number(cash),
      pos: Number(pos),
      total: Number(cash) + Number(pos)
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifica Incasso</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Contanti</Label>
            <Input value={cash} onChange={(e) => setCash(e.target.value)} type="number" />
          </div>
          <div>
            <Label>POS</Label>
            <Input value={pos} onChange={(e) => setPos(e.target.value)} type="number" />
          </div>
          <Button onClick={handleSave}>Salva</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function IncomePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [selectedYear, setSelectedYear] = useState(() => {
    return new Date().getFullYear().toString();
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return String(new Date().getMonth() + 1).padStart(2, '0');
  });
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const fetchIncomes = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setIncomes(data.incomes?.[`${selectedYear}-${selectedMonth}`] || []);
        }
      } catch (error) {
        console.error("Error fetching incomes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncomes();
  }, [user, selectedYear, selectedMonth, mounted]);

  if (!mounted) return null;
  if (!user) return null;
  if (loading) return <Loading />;

  const totalCash = incomes.reduce((sum, income) => sum + income.cash, 0);
  const totalPos = incomes.reduce((sum, income) => sum + income.pos, 0);
  const total = totalCash + totalPos;

  // Calculăm media zilnică
  const daysInMonth = new Date(Number(selectedYear), Number(selectedMonth), 0).getDate();
  const dailyAverage = total / daysInMonth;

  const handleDelete = async (income: Income) => {
    if (!user) return;
    
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        [`incomes.${selectedYear}-${selectedMonth}`]: arrayRemove(income)
      });
      
      setIncomes(current => current.filter(i => i !== income));

      // Adăugăm XP pentru tranzacție
      await addExperience(user.uid, XP_PER_TRANSACTION);
      toast({
        title: "Successo",
        description: "Incasso eliminato con successo, hai guadagnato 10 EXP",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore durante l'eliminazione",
        variant: "destructive",
      });
      console.error("Error deleting income:", error);
    }
  };

  const handleEdit = async (updatedIncome: Income) => {
    if (!user) return;
    
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        [`incomes.${selectedYear}-${selectedMonth}`]: arrayRemove(editingIncome)
      });
      await updateDoc(userRef, {
        [`incomes.${selectedYear}-${selectedMonth}`]: arrayUnion(updatedIncome)
      });
      
      setIncomes(current => current.map(i => i === editingIncome ? updatedIncome : i));
      // Adăugăm XP pentru tranzacție
      await addExperience(user.uid, XP_PER_TRANSACTION);
      toast({
        title: "Successo",
        description: "Incasso modificato con successo, hai guadagnato 10 EXP",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore durante la modifica",
        variant: "destructive",
      });
      console.error("Error editing income:", error);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Incassi</h1>
        <MonthSelector 
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contanti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalCash.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">POS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalPos.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{total.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Media Giornaliera</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{dailyAverage.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dettaglio Incassi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {incomes.length === 0 ? (
              <p className="text-center text-muted-foreground">Nessun incasso per questo mese</p>
            ) : (
              incomes.map((income, index) => (
                <div key={index} className="flex justify-between items-center p-2 border rounded group">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(income.date).toLocaleDateString('it-IT')}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <p>Contanti: €{income.cash}</p>
                      <p>POS: €{income.pos}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-semibold">
                      €{income.total}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button
                        onClick={() => setEditingIncome(income)}
                        className="p-2 hover:bg-gray-100 rounded-full"
                      >
                        <Pencil className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(income)}
                        className="p-2 hover:bg-gray-100 rounded-full"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {editingIncome && (
        <EditIncomeDialog
          income={editingIncome}
          isOpen={!!editingIncome}
          onClose={() => setEditingIncome(null)}
          onSave={handleEdit}
        />
      )}
    </div>
  );
}