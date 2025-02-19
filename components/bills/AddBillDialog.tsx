 "use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { BillGroup } from "@/types/bills";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groups: BillGroup[];
  onSuccess: () => void;
}

export default function AddBillDialog({ open, onOpenChange, groups, onSuccess }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    dueDate: "",
    groupId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const bills = data.bills || [];
        
        const newBill = {
          id: crypto.randomUUID(),
          ...formData,
          amount: parseFloat(formData.amount),
          paid: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          notified: {
            threeDays: false,
            oneDay: false,
          }
        };

        await updateDoc(docRef, {
          bills: [...bills, newBill]
        });

        toast({
          title: "Successo",
          description: "Fattura aggiunta con successo",
        });

        onSuccess();
        onOpenChange(false);
        setFormData({
          title: "",
          amount: "",
          dueDate: "",
          groupId: "",
        });
      }
    } catch (error) {
      console.error("Error adding bill:", error);
      toast({
        title: "Errore",
        description: "Errore durante l'aggiunta della fattura",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuova Fattura</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Titolo"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
          <div>
            <Input
              type="number"
              step="0.01"
              placeholder="Importo"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              required
            />
          </div>
          <div>
            <Input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              required
            />
          </div>
          {groups.length > 0 && (
            <div>
              <Select
                value={formData.groupId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, groupId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleziona gruppo (opzionale)" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map(group => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Aggiunta in corso..." : "Aggiungi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}