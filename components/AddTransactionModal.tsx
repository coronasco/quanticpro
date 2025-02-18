"use client"; // Required for client-side interactivity

import { useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useAuth } from "@/context/AuthContext";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "@/hooks/use-toast";
import { addExperience } from "@/lib/levelSystem";

const EXPENSE_CATEGORIES = [
  'Food & Beverage',
  'Utilita',
  'Affitto',
  'Bollete',
  'Altro'
] as const;

const getMonthKey = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const XP_PER_TRANSACTION = 20;

const AddTransactionModal = () => {
  const { user } = useAuth();
  // Income state
  const [cashIncome, setCashIncome] = useState("");
  const [posIncome, setPosIncome] = useState("");
  
  // Expense state
  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState<string>(EXPENSE_CATEGORIES[0]);

  const handleAddIncome = async () => {
    if (!user) return;
    
    const cash = Number(cashIncome);
    const pos = Number(posIncome);
    
    if (isNaN(cash) || isNaN(pos)) {
      toast({
        title: "Errore",
        description: "Inserisci importi validi",
        variant: "destructive",
      });
      return;
    }

    const now = new Date();
    const monthKey = getMonthKey(now);
    const income = {
      cash,
      pos,
      total: cash + pos,
      date: now.toISOString()
    };

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        [`incomes.${monthKey}`]: arrayUnion(income)
      });
      
      // Adăugăm XP pentru tranzacție
      await addExperience(user.uid, XP_PER_TRANSACTION);
      
      toast({
        title: "Successo",
        description: "Incasso aggiunto con successo, hai guadagnato 20 EXP",
        variant: "success",
      });
      
      setCashIncome("");
      setPosIncome("");
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore durante il salvataggio",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  const handleAddExpense = async () => {
    if (!user) return;
    
    const amount = Number(expenseAmount);
    
    if (!expenseName || isNaN(amount) || amount <= 0) {
      toast({
        title: "Errore",
        description: "Inserisci tutti i campi correttamente",
        variant: "destructive",
      });
      return;
    }

    const now = new Date();
    const monthKey = getMonthKey(now);
    const expense = {
      name: expenseName,
      amount,
      category: expenseCategory,
      date: now.toISOString()
    };

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        [`expenses.${monthKey}`]: arrayUnion(expense)
      });
      
      // Adăugăm XP pentru tranzacție
      await addExperience(user.uid, XP_PER_TRANSACTION);
      
      toast({
        title: "Successo",
        description: "Spesa aggiunta con successo, hai guadagnato 20 EXP",
        variant: "success",
      });
      
      setExpenseName("");
      setExpenseAmount("");
      setExpenseCategory(EXPENSE_CATEGORIES[0]);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore durante il salvataggio",
        variant: "destructive",
      });
      console.error(error);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="custom" size="icon">
          <Plus className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aggiungi Transazione</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="income">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="income">Incasso</TabsTrigger>
            <TabsTrigger value="expense">Spesa</TabsTrigger>
          </TabsList>
          <TabsContent value="income">
            <div className="space-y-4">
              <div>
                <Label htmlFor="cash">Contanti</Label>
                <Input
                  id="cash"
                  type="number"
                  value={cashIncome}
                  onChange={(e) => setCashIncome(e.target.value)}
                  placeholder="Importo in contanti"
                />
              </div>
              <div>
                <Label htmlFor="pos">POS</Label>
                <Input
                  id="pos"
                  type="number"
                  value={posIncome}
                  onChange={(e) => setPosIncome(e.target.value)}
                  placeholder="Importo POS"
                />
              </div>
              <div className="pt-2 text-right text-sm text-muted-foreground">
                Totale: €{(Number(cashIncome) || 0) + (Number(posIncome) || 0)}
              </div>
              <Button onClick={handleAddIncome}>
                Aggiungi Incasso
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="expense">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={expenseName}
                  onChange={(e) => setExpenseName(e.target.value)}
                  placeholder="Nome della spesa"
                />
              </div>
              <div>
                <Label htmlFor="amount">Importo</Label>
                <Input
                  id="amount"
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="Importo"
                />
              </div>
              <div>
                <Label>Categoria</Label>
                <Select value={expenseCategory} onValueChange={setExpenseCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddExpense}>
                Aggiungi Spesa
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionModal;