"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Loading from "@/components/Loading";
import { toast } from "@/hooks/use-toast";
import { PlusCircle, Store, Pencil, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addExperience } from "@/lib/levelSystem";

const XP_PER_TRANSACTION = 20; // XP acordat pentru fiecare produs adăugat

interface Product {
  id: string;
  name: string;
  price: number;
  vat: number;
  store: string;
  createdAt: string;
}

interface ProductGroup {
  name: string;
  products: Product[];
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
  stores: string[];
}

export default function ProductsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [productGroups, setProductGroups] = useState<Record<string, ProductGroup>>({});
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    vat: "",
    store: ""
  });
  const [editingGroup, setEditingGroup] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    price: "",
    vat: "",
    store: ""
  });
  const [selectedVariant, setSelectedVariant] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    
    const fetchProducts = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProducts(data.products || []);
          organizeProductGroups(data.products || []);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Errore",
          description: "Errore durante il recupero dei prodotti",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user]);

  const organizeProductGroups = (products: Product[]) => {
    const groups: Record<string, ProductGroup> = {};
    
    products.forEach(product => {
      const normalizedName = product.name.toLowerCase().trim();
      
      if (!groups[normalizedName]) {
        groups[normalizedName] = {
          name: product.name,
          products: [],
          averagePrice: 0,
          lowestPrice: Infinity,
          highestPrice: 0,
          stores: []
        };
      }
      
      groups[normalizedName].products.push(product);
      groups[normalizedName].stores = [...new Set([...groups[normalizedName].stores, product.store])];
      
      // Actualizăm statisticile
      const prices = groups[normalizedName].products.map(p => p.price);
      groups[normalizedName].averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      groups[normalizedName].lowestPrice = Math.min(...prices);
      groups[normalizedName].highestPrice = Math.max(...prices);
    });

    setProductGroups(groups);
  };

  const handleAddProduct = async () => {
    if (!user) return;
    
    try {
      const productData: Product = {
        id: Date.now().toString(),
        name: newProduct.name.trim(),
        price: parseFloat(newProduct.price),
        vat: parseFloat(newProduct.vat),
        store: newProduct.store.trim(),
        createdAt: new Date().toISOString()
      };

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        products: arrayUnion(productData)
      });

      setProducts(prev => [...prev, productData]);
      organizeProductGroups([...products, productData]);
      
      setNewProduct({ name: "", price: "", vat: "", store: "" });

      // Adăugăm XP pentru tranzacție
      await addExperience(user.uid, XP_PER_TRANSACTION);
      
      toast({
        title: "Successo",
        description: "Prodotto aggiunto con successo, hai guadagnato 20 EXP",
        variant: "success",
      });
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Errore",
        description: "Errore durante l'aggiunta del prodotto",
        variant: "destructive",
      });
    }
  };

  const handleEditGroup = (group: ProductGroup) => {
    setEditingGroup(group.name);
    // Setăm prima variantă ca fiind selectată implicit
    const firstProduct = group.products[0];
    setSelectedVariant(firstProduct.id);
    setEditForm({
      name: group.name,
      price: firstProduct.price.toString(),
      vat: firstProduct.vat.toString(),
      store: firstProduct.store
    });
  };

  const handleVariantChange = (productId: string, group: ProductGroup) => {
    const selectedProduct = group.products.find(p => p.id === productId);
    if (selectedProduct) {
      setSelectedVariant(productId);
      setEditForm({
        name: group.name,
        price: selectedProduct.price.toString(),
        vat: selectedProduct.vat.toString(),
        store: selectedProduct.store
      });
    }
  };

  const handleUpdateGroup = async () => {
    if (!user || !editingGroup) return;
    
    try {
      // Actualizăm doar produsul selectat
      const updatedProducts = products.map(product => {
        if (product.id === selectedVariant) {
          return {
            ...product,
            name: editForm.name.trim(),
            price: parseFloat(editForm.price),
            vat: parseFloat(editForm.vat),
            store: editForm.store.trim()
          };
        }
        return product;
      });

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        products: updatedProducts
      });

      setProducts(updatedProducts);
      organizeProductGroups(updatedProducts);
      setEditingGroup(null);
      setSelectedVariant("");
      
      toast({
        title: "Successo",
        description: "Variante aggiornata con successo",
        variant: "success",
      });
    } catch (error) {
      console.error("Error updating variant:", error);
      toast({
        title: "Errore",
        description: "Errore durante l'aggiornamento della variante",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingGroup(null);
    setEditForm({
      name: "",
      price: "",
      vat: "",
      store: ""
    });
  };

  const handleDeleteGroup = async (groupName: string) => {
    if (!user) return;
    
    try {
      const updatedProducts = products.filter(
        product => product.name.toLowerCase().trim() !== groupName.toLowerCase()
      );
      
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        products: updatedProducts
      });

      setProducts(updatedProducts);
      organizeProductGroups(updatedProducts);
      
      toast({
        title: "Successo",
        description: "Gruppo eliminato con successo",
        variant: "success",
      });
    } catch (error) {
      console.error("Error deleting group:", error);
      toast({
        title: "Errore",
        description: "Errore durante l'eliminazione del gruppo",
        variant: "destructive",
      });
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Prodotti</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aggiungi Prodotto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Prodotto</Label>
              <Input
                id="name"
                value={newProduct.name}
                onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                placeholder="es. Latte"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Prezzo</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={newProduct.price}
                onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vat">IVA (%)</Label>
              <Input
                id="vat"
                type="number"
                value={newProduct.vat}
                onChange={(e) => setNewProduct(prev => ({ ...prev, vat: e.target.value }))}
                placeholder="22"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store">Negozio</Label>
              <Input
                id="store"
                value={newProduct.store}
                onChange={(e) => setNewProduct(prev => ({ ...prev, store: e.target.value }))}
                placeholder="es. Conad"
              />
            </div>
          </div>
          <Button 
            className="mt-4"
            onClick={handleAddProduct}
            disabled={!newProduct.name || !newProduct.price || !newProduct.vat || !newProduct.store}
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            Aggiungi
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.values(productGroups).map((group) => (
          <Card key={group.name} className="group relative">
            {editingGroup === group.name ? (
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Tabs 
                    value={selectedVariant} 
                    onValueChange={(value) => handleVariantChange(value, group)}
                    className="w-full"
                  >
                    <TabsList className="w-full flex-wrap h-auto gap-2 justify-start bg-muted/50 p-2">
                      {group.products.map((product) => (
                        <TabsTrigger 
                          key={product.id} 
                          value={product.id}
                          className="gap-2 data-[state=active]:bg-background"
                        >
                          <Store className="h-4 w-4" />
                          {product.store}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    <TabsContent value={selectedVariant}>
                      <div className="space-y-4 mt-4">
                        <div>
                          <Label htmlFor="edit-name">Nome Prodotto</Label>
                          <Input
                            id="edit-name"
                            value={editForm.name}
                            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-price">Prezzo</Label>
                          <Input
                            id="edit-price"
                            type="number"
                            step="0.01"
                            value={editForm.price}
                            onChange={(e) => setEditForm(prev => ({ ...prev, price: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-vat">IVA (%)</Label>
                          <Input
                            id="edit-vat"
                            type="number"
                            value={editForm.vat}
                            onChange={(e) => setEditForm(prev => ({ ...prev, vat: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-store">Negozio</Label>
                          <Input
                            id="edit-store"
                            value={editForm.store}
                            onChange={(e) => setEditForm(prev => ({ ...prev, store: e.target.value }))}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={handleCancelEdit}>
                      Annulla
                    </Button>
                    <Button onClick={handleUpdateGroup}>
                      Salva
                    </Button>
                  </div>
                </div>
              </CardContent>
            ) : (
              <>
                <div className="absolute right-4 bottom-6 hidden group-hover:flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEditGroup(group)}
                  >
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDeleteGroup(group.name)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{group.name}</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {group.products.length} varianti
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm ">
                      <div>Prezzo medio:</div>
                      <div className="font-medium ml-auto">€{group.averagePrice.toFixed(2)}</div>
                      <div>Prezzo più basso:</div>
                      <div className="font-medium text-green-600 ml-auto">€{group.lowestPrice.toFixed(2)}</div>
                      <div>Prezzo più alto:</div>
                      <div className="font-medium text-red-600 ml-auto">€{group.highestPrice.toFixed(2)}</div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="text-sm font-medium mb-2">Disponibile presso:</div>
                      <div className="flex flex-wrap gap-2">
                        {group.stores.map((store) => (
                          <div 
                            key={store}
                            className="flex items-center gap-1 text-xs bg-secondary px-2 py-1 rounded"
                          >
                            <Store className="w-3 h-3" />
                            {store}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}