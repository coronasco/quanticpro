import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { notFound } from "next/navigation";
import { ClassicTemplate } from "@/components/menu-templates/ClassicTemplate";
import { ModernTemplate } from "@/components/menu-templates/ModernTemplate";
import { VintageTemplate } from "@/components/menu-templates/VintageTemplate";
import { FuturisticTemplate } from "@/components/menu-templates/FuturisticTemplate";
import type { Metadata } from "next";

interface SavedMenu {
  slug: string;
  title: string;
  template: string;
}

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

type Template = "classic" | "modern" | "vintage" | "futuristic";

interface MenuData {
  title: string;
  template: Template;
  categories: Category[];
  userId: string;
}

async function getMenuData(slug: string): Promise<MenuData | null> {
  try {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      if (data.savedMenus) {
        const menu = data.savedMenus.find((m: any) => m.slug === slug);
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

// Tipurile pentru Next.js
type PageProps = {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};

// Pagina principală
export default async function Page({ params }: any) {
  const menuData = await getMenuData(params.slug);

  if (!menuData) {
    notFound();
  }

  const TemplateComponent = {
    classic: ClassicTemplate,
    modern: ModernTemplate,
    vintage: VintageTemplate,
    futuristic: FuturisticTemplate,
  }[menuData.template] || ClassicTemplate;

  return <TemplateComponent title={menuData.title} categories={menuData.categories} />;
}

// Metadata
export async function generateMetadata({ params }: any): Promise<Metadata> {
  const menuData = await getMenuData(params.slug);
  
  return {
    title: menuData ? `${menuData.title} | QuanticPro` : 'Menu | QuanticPro',
    description: 'View our menu and prices',
  };
}