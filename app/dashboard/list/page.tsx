"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import Loading from "@/components/Loading";
import { toast } from "@/hooks/use-toast";
import { Check, Store, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Product {
  id: string;
  name: string;
  price: number;
  store: string;
}

interface ShoppingItem {
  id: string;
  productId: string;
  name: string;
  price?: number;
  store?: string;
  checked: boolean;
}

interface GroupedItems {
  [key: string]: ShoppingItem[];
}

export default function ShoppingListPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProducts(data.products || []);
          setShoppingList(data.shoppingList || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Errore",
          description: "Errore durante il recupero dei dati",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddItem = async (product: Product) => {
    if (!user) return;

    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      productId: product.id,
      name: product.name,
      price: product.price,
      store: product.store,
      checked: false
    };

    try {
      const updatedList = [...shoppingList, newItem];
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        shoppingList: updatedList
      });

      setShoppingList(updatedList);
      setSearchTerm("");
      setOpen(false);

      toast({
        title: "Successo",
        description: "Prodotto aggiunto alla lista",
      });
    } catch (error) {
      console.error("Error adding item:", error);
      toast({
        title: "Errore",
        description: "Errore durante l'aggiunta del prodotto",
        variant: "destructive",
      });
    }
  };

  const handleAddCustomItem = async () => {
    if (!user || !searchTerm.trim()) return;

    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      productId: "custom",
      name: searchTerm.trim(),
      checked: false
    };

    try {
      const updatedList = [...shoppingList, newItem];
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        shoppingList: updatedList
      });

      setShoppingList(updatedList);
      setSearchTerm("");
      setOpen(false);

      toast({
        title: "Successo",
        description: "Prodotto personalizzato aggiunto alla lista",
      });
    } catch (error) {
      console.error("Error adding custom item:", error);
      toast({
        title: "Errore",
        description: "Errore durante l'aggiunta del prodotto",
        variant: "destructive",
      });
    }
  };

  const handleToggleItem = async (itemId: string) => {
    if (!user) return;

    try {
      const updatedList = shoppingList.map(item =>
        item.id === itemId ? { ...item, checked: !item.checked } : item
      );

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        shoppingList: updatedList
      });

      setShoppingList(updatedList);
    } catch (error) {
      console.error("Error updating item:", error);
      toast({
        title: "Errore",
        description: "Errore durante l'aggiornamento del prodotto",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!user) return;

    try {
      const updatedList = shoppingList.filter(item => item.id !== itemId);
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        shoppingList: updatedList
      });

      setShoppingList(updatedList);
      
      toast({
        title: "Successo",
        description: "Prodotto rimosso dalla lista",
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Errore",
        description: "Errore durante la rimozione del prodotto",
        variant: "destructive",
      });
    }
  };

  const groupedItems: GroupedItems = shoppingList.reduce((acc, item) => {
    const store = item.store || "Altro";
    if (!acc[store]) {
      acc[store] = [];
    }
    acc[store].push(item);
    return acc;
  }, {} as GroupedItems);

  const calculateStoreTotal = (items: ShoppingItem[]) => {
    return items
      .filter(item => item.price && !item.checked)
      .reduce((sum, item) => sum + (item.price || 0), 0);
  };

  const totalAmount = Object.values(groupedItems)
    .flat()
    .filter(item => item.price && !item.checked)
    .reduce((sum, item) => sum + (item.price || 0), 0);

  if (loading) return <Loading />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Lista della Spesa</h1>
        <div className="text-sm text-muted-foreground">
          {shoppingList.length} prodotti • €{totalAmount.toFixed(2)}
        </div>
      </div>

      <div className="relative w-full">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              <Store className="mr-2 h-4 w-4" />
              {searchTerm || "Aggiungi un prodotto alla lista..."}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-2 " align="start">
            <input
              className="w-full px-3 py-2 rounded-md bg-muted/50 text-sm focus:outline-none focus:ring-1 focus:ring-ring mb-2"
              placeholder="Cerca un prodotto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="max-h-[300px] overflow-y-auto">
              {filteredProducts.length > 0 ? (
                <div className="space-y-1">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleAddItem(product)}
                      className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Check
                          className={cn(
                            "h-4 w-4",
                            searchTerm === product.name ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <span>{product.name}</span>
                      </div>
                      {product.store && (
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Store className="mr-1 h-3 w-3" />
                          {product.store}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3">
                  <p className="text-sm text-muted-foreground mb-2">
                    Nessun prodotto trovato
                  </p>
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={handleAddCustomItem}
                    className="text-xs"
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Aggiungi &quot;{searchTerm}&quot;
                  </Button>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedItems).map(([store, items]) => (
          <div key={store} className="bg-card rounded-lg border shadow-sm">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Store className="h-4 w-4 text-muted-foreground" />
                {store}
                <span className="text-xs text-muted-foreground">
                  ({items.length})
                </span>
              </div>
              <span className="text-sm font-medium">
                €{calculateStoreTotal(items).toFixed(2)}
              </span>
            </div>
            <div className="divide-y">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="px-4 py-2 flex items-center gap-3 group"
                >
                  <div className="flex-1 flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => handleToggleItem(item.id)}
                      className="h-4 w-4 rounded border-muted"
                    />
                    <span className={cn(
                      "text-sm transition-colors",
                      item.checked && "text-muted-foreground line-through"
                    )}>
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {item.price && (
                      <span className={cn(
                        "text-sm transition-colors",
                        item.checked ? "text-muted-foreground line-through" : "text-foreground"
                      )}>
                        €{item.price.toFixed(2)}
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hidden group-hover:flex transition-opacity"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {shoppingList.length > 0 && (
        <div className="sticky bottom-4 w-full">
          <div className="bg-card border rounded-lg shadow-lg p-4 flex justify-between items-center">
            <span className="text-sm font-medium">Totale Lista</span>
            <span className="text-lg font-semibold">€{totalAmount.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}