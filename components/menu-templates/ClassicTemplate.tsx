"use client";
import { useState } from "react";
import { SearchBar } from "./SearchBar";
import { Category } from "./types";
import { ClientOnly } from "@/components/ClientOnly";

export function ClassicTemplate({ title, categories }: { title: string; categories: Category[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = categories.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="min-h-screen bg-[#FFFBF5] text-[#2C1810]">
      <div className="max-w-3xl mx-auto py-12 px-6">
        <h1 className="font-serif text-4xl font-bold text-center mb-12 tracking-tight">{title}</h1>
        <ClientOnly>
          <SearchBar variant="classic" onSearch={setSearchTerm} />
          <div className="space-y-16">
            {filteredCategories.map((category) => (
              <div key={category.id} className="relative">
                <div className="absolute -left-4 h-full w-px bg-[#2C1810]/10" />
                <h2 className="font-serif text-2xl font-semibold mb-8 pl-6">{category.name}</h2>
                <div className="space-y-6 pl-6">
                  {category.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start border-b border-[#2C1810]/10 pb-4">
                      <div className="max-w-[70%]">
                        <h3 className="font-medium font-serif">{item.name}</h3>
                        {item.description && (
                          <p className="text-sm text-[#2C1810]/70 mt-1 font-serif">{item.description}</p>
                        )}
                      </div>
                      <span className="font-medium font-serif">€{item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ClientOnly>
      </div>
    </div>
  );
} 