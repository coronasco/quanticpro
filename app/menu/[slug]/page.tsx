import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { notFound } from "next/navigation";
import { ClassicTemplate } from "@/components/menu-templates/ClassicTemplate";
import { ModernTemplate } from "@/components/menu-templates/ModernTemplate";
import { VintageTemplate } from "@/components/menu-templates/VintageTemplate";
import { FuturisticTemplate } from "@/components/menu-templates/FuturisticTemplate";
import type { Metadata } from 'next';

// Definim tipurile
type MenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
}

type Category = {
  id: string;
  name: string;
  icon?: string;
  items: MenuItem[];
}

type MenuData = {
  title: string;
  template: string;
  categories: Category[];
  userId: string;
}

// Funcția pentru a obține datele meniului
async function getMenuData(slug: string): Promise<MenuData | null> {
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (data.savedMenus) {
        const menu = data.savedMenus.find((m: { slug: string }) => m.slug === slug);
        if (menu) {
          return {
            title: menu.title,
            template: menu.template,
            categories: data.menuCategories || [],
            userId: doc.id
          };
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching menu:", error);
    return null;
  }
}

// Componenta principală
export default async function MenuPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params;
  const menuData = await getMenuData(slug);

  if (!menuData) {
    notFound();
  }

  const templates = {
    classic: ClassicTemplate,
    modern: ModernTemplate,
    vintage: VintageTemplate,
    futuristic: FuturisticTemplate,
  } as const;

  const TemplateComponent = templates[menuData.template as keyof typeof templates] || ClassicTemplate;

  return <TemplateComponent title={menuData.title} categories={menuData.categories} />;
}

// Metadata
export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params;
  const menuData = await getMenuData(slug);
  
  return {
    title: menuData ? `${menuData.title} | QuanticPro` : 'Menu | QuanticPro',
    description: 'View our menu and prices',
  };
}