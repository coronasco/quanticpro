"use client";
import { useState } from "react";
import { SearchBar } from "./SearchBar";
import { Category } from "./types";

export function VintageTemplate({ title, categories }: { title: string; categories: Category[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = categories.map(category => ({
    ...category,
    items: category.items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return (
    <div className="min-h-screen bg-[#F3E5D0] text-[#462917]">
      <div className="max-w-3xl mx-auto py-16 px-8">
        <div className="border-8 border-double border-[#462917]/30 p-8 bg-[#F9EEE1]">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold uppercase tracking-[0.2em] mb-2">{title}</h1>
            <div className="flex items-center justify-center gap-4">
              <span className="h-px w-12 bg-[#462917]/40" />
              <span className="text-xs uppercase tracking-[0.3em] text-[#462917]/60">Est. 2024</span>
              <span className="h-px w-12 bg-[#462917]/40" />
            </div>
          </div>
          <SearchBar variant="vintage" onSearch={setSearchTerm} />
          <div className="space-y-16">
            {filteredCategories.map((category) => (
              <div key={category.id}>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold uppercase tracking-widest">{category.name}</h2>
                  <div className="mt-2 flex items-center justify-center gap-2">
                    <span className="h-px w-8 bg-[#462917]/40" />
                    <span className="text-[#462917]/40">✦</span>
                    <span className="h-px w-8 bg-[#462917]/40" />
                  </div>
                </div>
                <div className="space-y-6">
                  {category.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="max-w-[60%]">
                        <h3 className="font-medium uppercase tracking-wider">{item.name}</h3>
                        {item.description && (
                          <p className="text-sm italic mt-1 text-[#462917]/70">{item.description}</p>
                        )}
                      </div>
                      <div className="flex items-center flex-1">
                        <span className="border-b border-dotted border-[#462917]/30 flex-grow mx-4" />
                        <span className="font-medium">€{item.price.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 