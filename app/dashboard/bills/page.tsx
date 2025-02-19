"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { format, isAfter, isBefore, addDays } from "date-fns";
import { it } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { Bill, BillGroup } from "@/types/bills";
import AddBillDialog from "@/components/bills/AddBillDialog";
import BillGroupDialog from "@/components/bills/BillGroupDialog";

export default function BillsPage() {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [groups, setGroups] = useState<BillGroup[]>([]);
  const [showAddBill, setShowAddBill] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);

  const updateBillNotification = useCallback(async (billId: string, type: "threeDays" | "oneDay") => {
    if (!user) return;
    
    const updatedBills = bills.map(bill => {
      if (bill.id === billId) {
        return {
          ...bill,
          notified: {
            ...bill.notified,
            threeDays: type === "threeDays" ? true : bill.notified?.threeDays || false,
            oneDay: type === "oneDay" ? true : bill.notified?.oneDay || false
          }
        };
      }
      return bill;
    });

    setBills(updatedBills);
    await updateDoc(doc(db, "users", user.uid), {
      bills: updatedBills
    });
  }, [bills, user]);

  const fetchBills = useCallback(async () => {
    if (!user) return;
    
    try {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setBills(data.bills || []);
        setGroups(data.billGroups || []);
      }
    } catch (error) {
      console.error("Error fetching bills:", error);
      toast({
        title: "Errore",
        description: "Errore durante il recupero delle fatture",
        variant: "destructive",
      });
    }
  }, [user]);

  const checkNotifications = useCallback(() => {
    bills.forEach(bill => {
      if (bill.paid) return;

      const dueDate = new Date(bill.dueDate);
      const today = new Date();
      const threeDaysFromDue = addDays(dueDate, -3);
      const oneDayFromDue = addDays(dueDate, -1);

      if (isAfter(today, threeDaysFromDue) && !bill.notified?.threeDays) {
        toast({
          title: "Promemoria",
          description: `La fattura "${bill.title}" scade tra 3 giorni`,
        });
        updateBillNotification(bill.id, "threeDays");
      }

      if (isAfter(today, oneDayFromDue) && !bill.notified?.oneDay) {
        toast({
          title: "Promemoria",
          description: `La fattura "${bill.title}" scade domani`,
        });
        updateBillNotification(bill.id, "oneDay");
      }
    });
  }, [bills, updateBillNotification]);

  useEffect(() => {
    if (!user) return;
    fetchBills();
    checkNotifications();
  }, [user, fetchBills, checkNotifications]);

  const toggleBillPaid = async (billId: string) => {
    if (!user) return;
    
    const updatedBills = bills.map(bill => {
      if (bill.id === billId) {
        return {
          ...bill,
          paid: !bill.paid,
          updatedAt: new Date().toISOString()
        };
      }
      return bill;
    });

    setBills(updatedBills);
    await updateDoc(doc(db, "users", user.uid), {
      bills: updatedBills
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Promemoria</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddGroup(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Gruppo
          </Button>
          <Button onClick={() => setShowAddBill(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuova Fattura
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {groups.map(group => (
          <Card key={group.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{group.name}</h2>
              {group.description && (
                <p className="text-sm text-muted-foreground">{group.description}</p>
              )}
            </div>
            <div className="space-y-4">
              {bills
                .filter(bill => bill.groupId === group.id)
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .map(bill => (
                  <BillItem 
                    key={bill.id} 
                    bill={bill} 
                    onTogglePaid={toggleBillPaid}
                  />
                ))}
            </div>
          </Card>
        ))}

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Altre Fatture</h2>
          <div className="space-y-4">
            {bills
              .filter(bill => !bill.groupId)
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .map(bill => (
                <BillItem 
                  key={bill.id} 
                  bill={bill} 
                  onTogglePaid={toggleBillPaid}
                />
              ))}
          </div>
        </Card>
      </div>

      <AddBillDialog 
        open={showAddBill}
        onOpenChange={setShowAddBill}
        groups={groups}
        onSuccess={fetchBills}
      />

      <BillGroupDialog
        open={showAddGroup}
        onOpenChange={setShowAddGroup}
        onSuccess={fetchBills}
      />
    </div>
  );
}

function BillItem({ bill, onTogglePaid }: { bill: Bill; onTogglePaid: (id: string) => void }) {
  const dueDate = new Date(bill.dueDate);
  const isOverdue = isBefore(dueDate, new Date()) && !bill.paid;

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-4">
        <Checkbox
          checked={bill.paid}
          onCheckedChange={() => onTogglePaid(bill.id)}
        />
        <div>
          <div className="font-medium">{bill.title}</div>
          <div className="text-sm text-muted-foreground">
            Scadenza: {format(dueDate, "d MMMM yyyy", { locale: it })}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="font-medium">€{bill.amount.toFixed(2)}</div>
        <Badge variant={bill.paid ? "secondary" : isOverdue ? "destructive" : "default"}>
          {bill.paid ? "Pagata" : isOverdue ? "Scaduta" : "Da pagare"}
        </Badge>
      </div>
    </div>
  );
} 