"use client"

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, updateDoc, arrayRemove, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MonthSelector } from "@/components/MonthSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loading from "@/components/Loading";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { addExperience } from "@/lib/levelSystem";

const XP_PER_TRANSACTION = 10;

const EXPENSE_CATEGORIES = [
  'Food & Beverage',
  'Utilita',
  'Affitto',
  'Bollete',
  'Altro'
] as const;

interface Expense {
  name: string;
  amount: number;
  category: string;
  date: string;
}

interface EditExpenseDialogProps {
  expense: Expense;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedExpense: Expense) => void;
}

function EditExpenseDialog({ expense, isOpen, onClose, onSave }: EditExpenseDialogProps) {
  const [name, setName] = useState(expense.name);
  const [amount, setAmount] = useState(expense.amount.toString());
  const [category, setCategory] = useState(expense.category);

  const handleSave = () => {
    onSave({
      ...expense,
      name,
      amount: Number(amount),
      category
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifica Spesa</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Importo</Label>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" />
          </div>
          <div>
            <Label>Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSave}>Salva</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ExpensePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedYear, setSelectedYear] = useState(() => {
    return new Date().getFullYear().toString();
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    return String(new Date().getMonth() + 1).padStart(2, '0');
  });
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const fetchExpenses = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setExpenses(data.expenses?.[`${selectedYear}-${selectedMonth}`] || []);
        }
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [user, selectedYear, selectedMonth, mounted]);

  const handleDelete = async (expense: Expense) => {
    if (!user) return;
    
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        [`expenses.${selectedYear}-${selectedMonth}`]: arrayRemove(expense)
      });
      
      setExpenses(current => current.filter(e => e !== expense));
      toast({
        title: "Successo",
        description: "Spesa eliminata con successo",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore durante l'eliminazione",
        variant: "destructive",
      });
      console.error("Error deleting expense:", error);
    }
  };

  const handleEdit = async (updatedExpense: Expense) => {
    if (!user) return;
    
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        [`expenses.${selectedYear}-${selectedMonth}`]: arrayRemove(editingExpense)
      });
      await updateDoc(userRef, {
        [`expenses.${selectedYear}-${selectedMonth}`]: arrayUnion(updatedExpense)
      });

      // Adăugăm XP pentru tranzacție
      await addExperience(user.uid, XP_PER_TRANSACTION);
      
      setExpenses(current => current.map(e => e === editingExpense ? updatedExpense : e));
      toast({
        title: "Successo",
        description: "Spesa aggiornata con successo, hai guadagnato 10 EXP",
        variant: "success",
      });
      setEditingExpense(null);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore durante l'aggiornamento",
        variant: "destructive",
      });
      console.error("Error updating expense:", error);
    }
  };

  if (!mounted) return null;
  if (!user) return null;
  if (loading) return <Loading />;

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const dailyAverage = totalAmount / new Date(Number(selectedYear), Number(selectedMonth), 0).getDate();

  // Grupăm cheltuielile pe categorii
  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Spese</h1>
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
            <CardTitle className="text-sm font-medium">Totale Spese</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalAmount.toFixed(2)}</div>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categoria Principale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">N° Transazioni</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenses.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dettaglio Spese</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expenses.length === 0 ? (
              <p className="text-center text-muted-foreground">Nessuna spesa per questo mese</p>
            ) : (
              expenses.map((expense, index) => (
                <div key={index} className="flex justify-between items-center py-2 px-4 border rounded group">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(expense.date).toLocaleDateString('it-IT')}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <p>{expense.name}</p>
                      <Badge variant="outline">{expense.category}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-semibold text-red-600">
                      -€{expense.amount.toFixed(2)}
                    </div>
                    <div className="hidden group-hover:flex transition-opacity gap-2 px-4">
                      <button
                        onClick={() => setEditingExpense(expense)}
                        className="p-2 hover:bg-gray-100 rounded-full"
                      >
                        <Pencil className="w-4 h-4 text-gray-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(expense)}
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

      {editingExpense && (
        <EditExpenseDialog
          expense={editingExpense}
          isOpen={!!editingExpense}
          onClose={() => setEditingExpense(null)}
          onSave={handleEdit}
        />
      )}
    </div>
  );
}