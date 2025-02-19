import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { notFound } from "next/navigation";
import { ClassicTemplate } from "@/components/menu-templates/ClassicTemplate";
import { ModernTemplate } from "@/components/menu-templates/ModernTemplate";
import { VintageTemplate } from "@/components/menu-templates/VintageTemplate";
import { FuturisticTemplate } from "@/components/menu-templates/FuturisticTemplate";
import { Metadata } from 'next';

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

interface MenuData {
  title: string;
  template: string;
  categories: Category[];
  userId: string;
}

interface PageProps {
  params: { slug: string };
}

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

export default async function MenuPage({ params }: PageProps) {
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

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const menuData = await getMenuData(params.slug);
  
  return {
    title: menuData ? `${menuData.title} | QuanticPro` : 'Menu | QuanticPro',
    description: 'View our menu and prices',
  };
}