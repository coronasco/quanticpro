"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getMonthName } from "@/lib/dateFormat";

interface MonthSelectorProps {
  selectedMonth: string;
  selectedYear: string;
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
}

export function MonthSelector({ selectedMonth, selectedYear, onMonthChange, onYearChange }: MonthSelectorProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));
  
  const months = Array.from({ length: 12 }, (_, i) => {
    return {
      value: String(i + 1).padStart(2, '0'),
      label: getMonthName(i)
    };
  });

  return (
    <div className="flex gap-2">
      <Select value={selectedYear} onValueChange={onYearChange}>
        <SelectTrigger className="w-[80px]">
          <SelectValue placeholder="Anno" />
        </SelectTrigger>
        <SelectContent>
          {years.map((year) => (
            <SelectItem key={year} value={year}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedMonth} onValueChange={onMonthChange}>
        <SelectTrigger className="w-[80px]">
          <SelectValue placeholder="Mese" />
        </SelectTrigger>
        <SelectContent>
          {months.map((month) => (
            <SelectItem key={month.value} value={month.value}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 