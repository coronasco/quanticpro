"use client";
import { useState } from "react";
import { SearchBar } from "./SearchBar";
import { Category } from "./types";

export function ModernTemplate({ title, categories }: { title: string; categories: Category[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = categories.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto py-16 px-6">
        <h1 className="text-5xl font-bold text-center mb-12 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          {title}
        </h1>
        <SearchBar variant="modern" onSearch={setSearchTerm} />
        <div className="grid md:grid-cols-2 gap-8">
          {filteredCategories.map((category) => (
            <div key={category.id} className="bg-white rounded-2xl p-8 shadow-[0_9px_30px_rgb(0,0,0,0.04)]">
              <h2 className="text-xl font-bold mb-6 text-gray-900">{category.name}</h2>
              <div className="space-y-6">
                {category.items.map((item) => (
                  <div
                    key={item.id}
                    className="group hover:bg-slate-50 -mx-4 p-4 rounded-xl transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        )}
                      </div>
                      <span className="font-medium text-gray-900 ml-4">€{item.price.toFixed(2)}</span>
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