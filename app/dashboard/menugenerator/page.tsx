"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  GripVertical,
  Pencil,
  Trash2,
  QrCode,
  Copy,
  Plus,
  Share,
  Mail,
  Phone,
  Download,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Loading from "@/components/Loading";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import html2canvas from 'html2canvas';
import { ClassicTemplate } from "@/components/menu-templates/ClassicTemplate";
import { ModernTemplate } from "@/components/menu-templates/ModernTemplate";
import { VintageTemplate } from "@/components/menu-templates/VintageTemplate";
import { FuturisticTemplate } from "@/components/menu-templates/FuturisticTemplate";

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
}

interface Category {
  id: string;
  name: string;
  icon?: string;
  items: MenuItem[];
}

interface MenuTemplate {
  id: string;
  name: string;
  preview: string;
  className: string;
}

interface SavedMenu {
  id: string;
  title: string;
  slug: string;
  template: string;
  createdAt: string;
  updatedAt: string;
}

const TEMPLATES: MenuTemplate[] = [
  {
    id: "classic",
    name: "Classico",
    preview: "/templates/classic.png",
    className: "font-serif",
  },
  {
    id: "modern",
    name: "Moderno",
    preview: "/templates/modern.png",
    className: "font-sans",
  },
  {
    id: "vintage",
    name: "Vintage",
    preview: "/templates/vintage.png",
    className: "font-vintage",
  },
  {
    id: "futuristic",
    name: "Futuristico",
    preview: "/templates/futuristic.png",
    className: "font-future",
  },
];

const DEFAULT_CATEGORIES: Category[] = [
  { id: "coffee", name: "Caffetteria", icon: "Coffee", items: [] },
  { id: "aperitivo", name: "Aperitivo", icon: "Wine", items: [] },
  { id: "food", name: "Cucina", icon: "Pizza", items: [] },
];

const PreviewTemplate = ({ template, categories }: { template: MenuTemplate, categories: Category[] }) => {
  const sampleData = {
    title: "Menu Preview",
    categories: categories.slice(0, 1).map(cat => ({
      ...cat,
      items: cat.items.slice(0, 2)
    }))
  };

  const TemplateComponent = {
    classic: ClassicTemplate,
    modern: ModernTemplate,
    vintage: VintageTemplate,
    futuristic: FuturisticTemplate,
  }[template.id] || ClassicTemplate;

  if (!TemplateComponent) return null;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <div className="scale-[0.4] origin-top-left transform-gpu w-[250%] h-[250%]">
        <TemplateComponent {...sampleData} />
      </div>
    </div>
  );
};

export default function MenuGeneratorPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("classic");
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuTitle, setMenuTitle] = useState("Il Nostro Menu");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
  });
  const [editingProduct, setEditingProduct] = useState<MenuItem | null>(null);
  const [showQRSheet, setShowQRSheet] = useState(false);
  const [savedMenus, setSavedMenus] = useState<SavedMenu[]>([]);
  const [menuUrl, setMenuUrl] = useState<string>("");
  const [currentMenuId, setCurrentMenuId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchMenu = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setCategories(data.menuCategories || DEFAULT_CATEGORIES);
          setMenuTitle(data.menuTitle || "Il Nostro Menu");
          setSelectedTemplate(data.menuTemplate || "classic");
        }
      } catch (error) {
        console.error("Error fetching menu:", error);
        toast({
          title: "Errore",
          description: "Errore durante il recupero del menu",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchSavedMenus = async () => {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSavedMenus(data.savedMenus || []);
        }
      } catch (error) {
        console.error("Error fetching saved menus:", error);
      }
    };

    fetchMenu();
    fetchSavedMenus();
  }, [user]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    if (source.droppableId === destination.droppableId) {
      // Reordering within same category
      const category = categories.find(c => c.id === source.droppableId);
      if (!category) return;

      const items = Array.from(category.items);
      const [removed] = items.splice(source.index, 1);
      items.splice(destination.index, 0, removed);

      setCategories(prev =>
        prev.map(c =>
          c.id === source.droppableId ? { ...c, items } : c
        )
      );
    } else {
      // Moving between categories
      const sourceCategory = categories.find(c => c.id === source.droppableId);
      const destCategory = categories.find(c => c.id === destination.droppableId);
      if (!sourceCategory || !destCategory) return;

      const sourceItems = Array.from(sourceCategory.items);
      const destItems = Array.from(destCategory.items);
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);

      setCategories(prev =>
        prev.map(c => {
          if (c.id === source.droppableId) {
            return { ...c, items: sourceItems };
          }
          if (c.id === destination.droppableId) {
            return { ...c, items: destItems };
          }
          return c;
        })
      );
    }
  };

  const generateUniqueSlug = (title: string) => {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    return `${baseSlug}-${Date.now().toString(36)}`;
  };

  const handleAddCategory = async () => {
    if (!user || !newCategoryName.trim()) return;

    const newCategory: Category = {
      id: Date.now().toString(),
      name: newCategoryName.trim(),
      items: [],
    };

    const updatedCategories = [...categories, newCategory];
    
    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        menuCategories: updatedCategories,
      });

      setCategories(updatedCategories);
      setNewCategoryName("");
      setIsAddingCategory(false);
      toast({
        title: "Successo",
        description: "Categoria aggiunta con successo",
      });
    } catch (error) {
      console.error("Error adding category:", error);
      toast({
        title: "Errore",
        description: "Errore durante l'aggiunta della categoria",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!user) return;

    const updatedCategories = categories.filter(c => c.id !== categoryId);
    
    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        menuCategories: updatedCategories,
      });

      setCategories(updatedCategories);
      toast({
        title: "Successo",
        description: "Categoria eliminata con successo",
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      toast({
        title: "Errore",
        description: "Errore durante l'eliminazione della categoria",
        variant: "destructive",
      });
    }
  };

  const handleAddProduct = async () => {
    if (!user || !selectedCategory || !newProduct.name || !newProduct.price) return;

    const product: MenuItem = {
      id: Date.now().toString(),
      name: newProduct.name,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      category: selectedCategory,
    };

    const updatedCategories = categories.map(category => {
      if (category.id === selectedCategory) {
        return {
          ...category,
          items: [...category.items, product],
        };
      }
      return category;
    });

    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        menuCategories: updatedCategories,
      });

      setCategories(updatedCategories);
      setNewProduct({ name: "", description: "", price: "" });
      setIsAddingProduct(false);
      toast({
        title: "Successo",
        description: "Prodotto aggiunto con successo",
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

  const handleEditProduct = async () => {
    if (!user || !editingProduct) return;

    const updatedCategories = categories.map(category => {
      if (category.id === editingProduct.category) {
        return {
          ...category,
          items: category.items.map(item =>
            item.id === editingProduct.id ? editingProduct : item
          ),
        };
      }
      return category;
    });

    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        menuCategories: updatedCategories,
      });

      setCategories(updatedCategories);
      setEditingProduct(null);
      toast({
        title: "Successo",
        description: "Prodotto aggiornato con successo",
      });
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Errore",
        description: "Errore durante l'aggiornamento del prodotto",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async (categoryId: string, productId: string) => {
    if (!user) return;

    const updatedCategories = categories.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          items: category.items.filter(item => item.id !== productId),
        };
      }
      return category;
    });

    try {
      const docRef = doc(db, "users", user.uid);
      await updateDoc(docRef, {
        menuCategories: updatedCategories,
      });

      setCategories(updatedCategories);
      toast({
        title: "Successo",
        description: "Prodotto eliminato con successo",
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Errore",
        description: "Errore durante l'eliminazione del prodotto",
        variant: "destructive",
      });
    }
  };

  const saveMenu = async () => {
    if (!user) return;

    const timestamp = new Date().toISOString();
    const newSlug = currentMenuId ? savedMenus.find(m => m.id === currentMenuId)?.slug : generateUniqueSlug(menuTitle);

    const updatedMenu: SavedMenu = {
      id: currentMenuId || Date.now().toString(),
      title: menuTitle,
      slug: newSlug || generateUniqueSlug(menuTitle),
      template: selectedTemplate,
      createdAt: currentMenuId ? savedMenus.find(m => m.id === currentMenuId)?.createdAt || timestamp : timestamp,
      updatedAt: timestamp,
    };

    try {
      const docRef = doc(db, "users", user.uid);
      const updatedMenus = currentMenuId 
        ? savedMenus.map(menu => menu.id === currentMenuId ? updatedMenu : menu)
        : [updatedMenu];

      await updateDoc(docRef, {
        menuCategories: categories,
        menuTitle,
        menuTemplate: selectedTemplate,
        savedMenus: updatedMenus,
      });

      setSavedMenus(updatedMenus);
      setCurrentMenuId(updatedMenu.id);
      const newUrl = `${window.location.origin}/menu/${updatedMenu.slug}`;
      setMenuUrl(newUrl);
      setShowQRSheet(true);

      toast({
        title: "Successo",
        description: "Menu salvato con successo",
      });
    } catch (error) {
      console.error("Error saving menu:", error);
      toast({
        title: "Errore",
        description: "Errore durante il salvataggio del menu",
        variant: "destructive",
      });
    }
  };

  const shareViaEmail = (menuUrl: string, menuTitle: string) => {
    const subject = encodeURIComponent(`Menu - ${menuTitle}`);
    const body = encodeURIComponent(`Ecco il nostro menu: ${menuUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareViaWhatsApp = (menuUrl: string) => {
    const text = encodeURIComponent(`Ecco il nostro menu: ${menuUrl}`);
    window.open(`https://wa.me/?text=${text}`);
  };

  const saveQRCode = async (menuSlug: string) => {
    const qrElement = document.querySelector(`[data-qr="${menuSlug}"]`) as HTMLDivElement;
    if (!qrElement) return;

    try {
      const canvas = await html2canvas(qrElement);
      const image = canvas.toDataURL('image/png');
      
      const link = document.createElement('a');
      link.download = `menu-qr-${menuSlug}.png`;
      link.href = image;
      link.click();
    } catch (error) {
      console.error('Error saving QR code:', error);
      toast({
        title: "Errore",
        description: "Errore durante il salvataggio del QR code",
        variant: "destructive",
      });
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Input
              value={menuTitle}
              onChange={(e) => setMenuTitle(e.target.value)}
              className="text-2xl font-semibold tracking-tight w-auto min-w-[300px]"
            />
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => setShowQRSheet(true)}>
              <QrCode className="mr-2 h-4 w-4" />
              Genera QR Code
            </Button>
            <Button onClick={saveMenu}>Salva Menu</Button>
          </div>
        </div>

        <Tabs defaultValue="design" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="content">Contenuto</TabsTrigger>
            <TabsTrigger value="preview">Anteprima</TabsTrigger>
          </TabsList>

          <TabsContent value="design" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {TEMPLATES.map((template) => (
                <div
                  key={template.id}
                  className={cn(
                    "relative aspect-[3/4] border rounded-lg overflow-hidden cursor-pointer transition-all h-[300px]",
                    selectedTemplate === template.id
                      ? "ring-2 ring-primary"
                      : "hover:border-primary"
                  )}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <PreviewTemplate template={template} categories={categories} />
                  <div className="absolute bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm p-2">
                    <p className="text-sm font-medium text-center">
                      {template.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Categorie</h2>
              <Button onClick={() => setIsAddingCategory(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuova Categoria
              </Button>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              {categories.map((category) => (
                <Droppable key={category.id} droppableId={category.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="bg-card rounded-lg border p-4 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{category.name}</h3>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCategory(category.id);
                              setIsAddingProduct(true);
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Aggiungi Prodotto
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCategory(category.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {category.items.map((item, index) => (
                          <Draggable
                            key={item.id}
                            draggableId={item.id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="flex items-center gap-2 bg-background p-3 rounded-md border group"
                              >
                                <div {...provided.dragHandleProps}>
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium">{item.name}</div>
                                  {item.description && (
                                    <div className="text-sm text-muted-foreground">
                                      {item.description}
                                    </div>
                                  )}
                                </div>
                                <div className="font-medium">
                                  €{item.price.toFixed(2)}
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setEditingProduct(item)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteProduct(category.id, item.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </DragDropContext>
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            <div className="bg-white rounded-lg border shadow-lg p-8">
              <h2 className="text-3xl font-bold text-center mb-8">{menuTitle}</h2>
              {categories.map((category) => (
                <div key={category.id} className="mb-8 last:mb-0">
                  <h3 className="text-xl font-semibold mb-4">{category.name}</h3>
                  <div className="space-y-4">
                    {category.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-muted-foreground">
                              {item.description}
                            </div>
                          )}
                        </div>
                        <div className="font-medium">€{item.price.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuova Categoria</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Nome categoria"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleAddCategory}>Aggiungi</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuovo Prodotto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Nome prodotto"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Input
                  placeholder="Descrizione (opzionale)"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Prezzo"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleAddProduct}>Aggiungi</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={editingProduct !== null} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifica Prodotto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Input
                  placeholder="Nome prodotto"
                  value={editingProduct?.name || ""}
                  onChange={(e) => setEditingProduct(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>
              <div>
                <Input
                  placeholder="Descrizione (opzionale)"
                  value={editingProduct?.description || ""}
                  onChange={(e) => setEditingProduct(prev => prev ? { ...prev, description: e.target.value } : null)}
                />
              </div>
              <div>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Prezzo"
                  value={editingProduct?.price || ""}
                  onChange={(e) => setEditingProduct(prev => prev ? { ...prev, price: parseFloat(e.target.value) } : null)}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleEditProduct}>Salva</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Sheet open={showQRSheet} onOpenChange={setShowQRSheet}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>QR Code Menu</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col items-center justify-center space-y-4 pt-8">
              <div className="cursor-pointer" data-qr={currentMenuId}>
                <QRCodeSVG 
                  value={`${window.location.origin}/menu/${currentMenuId}`}
                  size={200}
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Scansiona questo codice QR per visualizzare il menu
              </p>
              <div className="flex items-center gap-2">
                <Input value={menuUrl} readOnly />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard.writeText(menuUrl);
                    toast({
                      title: "Copiato",
                      description: "Link copiato negli appunti",
                    });
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="max-w-5xl mx-auto bg-slate-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-6">Il tuo Menu</h2>
        <div className="">
          {savedMenus.map((menu) => (
            <div
              key={menu.id}
              className="bg-card rounded-lg border p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{menu.title}</h3>
                <span className="text-sm text-muted-foreground">
                  {new Date(menu.updatedAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="cursor-pointer" data-qr={menu.slug}>
                    <QRCodeSVG 
                      value={`${window.location.origin}/menu/${menu.slug}`}
                      size={80}
                    />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="custom"
                        size="icon"
                        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onMouseEnter={(e) => {
                          const button = e.currentTarget;
                          button.click();
                        }}
                      >
                        <Share className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => shareViaEmail(`${window.location.origin}/menu/${menu.slug}`, menu.title)}>
                        <Mail className="mr-2 h-4 w-4" />
                        Condividi via Email
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => shareViaWhatsApp(`${window.location.origin}/menu/${menu.slug}`)}>
                        <Phone className="mr-2 h-4 w-4" />
                        Condividi su WhatsApp
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => saveQRCode(menu.slug)}>
                        <Download className="mr-2 h-4 w-4" />
                        Salva QR Code
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      value={`${window.location.origin}/menu/${menu.slug}`}
                      readOnly
                      className="text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/menu/${menu.slug}`);
                        toast({
                          title: "Copiato",
                          description: "Link copiato negli appunti",
                        });
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => window.open(`/menu/${menu.slug}`, '_blank')}
                    >
                      Visualizza Menu
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}