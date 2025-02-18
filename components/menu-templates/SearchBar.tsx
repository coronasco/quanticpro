
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  variant: "classic" | "modern" | "vintage" | "futuristic";
  onSearch: (term: string) => void;
}

export function SearchBar({ variant, onSearch }: SearchBarProps) {
  const styles = {
    classic: "border-b border-black/20 focus:border-black/40",
    modern: "bg-slate-100 rounded-full px-6",
    vintage: "border-2 border-double border-amber-900/30 bg-amber-50",
    futuristic: "bg-white/10 backdrop-blur-sm rounded-lg text-white placeholder:text-white/60"
  };

  return (
    <div className="relative max-w-md mx-auto mb-8">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Cerca nel menu..."
        className={`pl-12 ${styles[variant]}`}
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
} 