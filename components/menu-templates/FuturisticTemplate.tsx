"use client";
import { useState } from "react";
import { SearchBar } from "./SearchBar";
import { Category } from "./types";

export function FuturisticTemplate({ title, categories }: { title: string; categories: Category[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = categories.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="min-h-screen bg-[#0A0118] text-white">
      <div 
        className="inset-0 bg-[radial-gradient(circle_at_50%_-20%,#3B0764,#0A0118)] opacity-50"
        style={{ maskImage: 'radial-gradient(circle at 50% 0%, black, transparent 70%)' }}
      />
      <div className="relative max-w-4xl mx-auto py-16 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
        <h1 className="text-6xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-400">
          {title}
        </h1>
        <SearchBar variant="futuristic" onSearch={setSearchTerm} />
        <div className="space-y-12">
          {filteredCategories.map((category) => (
            <div key={category.id} className="backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold mb-8 text-violet-400">{category.name}</h2>
              <div className="grid gap-4">
                {category.items.map((item) => (
                  <div
                    key={item.id}
                    className="group bg-white/5 p-6 rounded-xl hover:bg-white/10 transition-all border border-white/5 hover:border-violet-500/30"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-lg group-hover:text-violet-400 transition-colors">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-white/60 mt-1">{item.description}</p>
                        )}
                      </div>
                      <span className="font-medium text-fuchsia-400">€{item.price.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 