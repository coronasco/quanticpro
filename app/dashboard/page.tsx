"use client";
import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthSelector } from "@/components/MonthSelector";
import Loading from "@/components/Loading";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Target, TrendingUp } from "lucide-react";

interface Income {
  cash: number;
  pos: number;
  total: number;
  date: string;
}

interface Expense {
  name: string;
  amount: number;
  category: string;
  date: string;
}

interface DashboardData {
  incomes: Record<string, Income[]>;
  expenses: Record<string, Expense[]>;
  settings: {
    dailyGoal: number;
  };
}

// Actualizăm paleta de culori pentru un design mai modern
const BRAND_COLORS = {
  income: {
    main: '#06D6A0',
    light: '#E8FDF5',
    dark: '#059669'
  },
  expense: {
    main: '#FF686B',
    light: '#FFF1F1',
    dark: '#DC2626'
  },
  profit: {
    main: '#118AB2',
    light: '#EFF6FF',
    dark: '#0369A1'
  }
};

const PIE_COLORS = [
  '#06D6A0',  // Verde mentă
  '#FF686B',  // Coral
  '#118AB2',  // Albastru ocean
  '#FFD93D',  // Galben pastel
  '#845EC2',  // Violet
  '#4B4453',  // Gri închis
  '#B0A8B9'   // Gri deschis
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState(() => 
    String(new Date().getMonth() + 1).padStart(2, '0')
  );

  const dashboardData = useMemo(() => {
    if (!data) return {
      currentMonthIncomes: [],
      currentMonthExpenses: [],
      dailyData: [],
      weekdayData: [],
      pieData: [],
      totalIncome: 0,
      totalExpense: 0,
      profit: 0,
      daysInMonth: 0
    };

    const monthKey = `${selectedYear}-${selectedMonth}`;
    const currentMonthIncomes = data.incomes?.[monthKey] || [];
    const currentMonthExpenses = data.expenses?.[monthKey] || [];
    const daysInMonth = new Date(Number(selectedYear), Number(selectedMonth), 0).getDate();

    // Calculăm totalurile
    const totalIncome = currentMonthIncomes.reduce((sum, i) => sum + i.total, 0);
    const totalExpense = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const profit = totalIncome - totalExpense;

    // Calculăm datele zilnice
    const dailyData = Array.from({ length: daysInMonth }, (_, index) => {
      const day = String(index + 1).padStart(2, '0');
      const dayIncomes = currentMonthIncomes
        .filter(income => new Date(income.date).getDate() === (index + 1))
        .reduce((sum, income) => sum + income.total, 0);
        
      const dayExpenses = currentMonthExpenses
        .filter(expense => new Date(expense.date).getDate() === (index + 1))
        .reduce((sum, expense) => sum + expense.amount, 0);

      return {
        name: day,
        incomes: dayIncomes,
        expenses: dayExpenses,
        profit: dayIncomes - dayExpenses
      };
    });

    // Calculăm datele pentru zile ale săptămânii
    const days = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
    const weekdayData = days.map(day => ({
      name: day,
      amount: currentMonthIncomes
        .filter(income => {
          const date = new Date(income.date);
          const dayIndex = date.getDay();
          return days[dayIndex === 0 ? 6 : dayIndex - 1] === day;
        })
        .reduce((sum, income) => sum + income.total, 0)
    }));

    // Calculăm datele pentru pie chart
    const expensesByCategory = currentMonthExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    const pieData = Object.entries(expensesByCategory).map(([name, value]) => ({
      name,
      value
    }));

    return {
      currentMonthIncomes,
      currentMonthExpenses,
      dailyData,
      weekdayData,
      pieData,
      totalIncome,
      totalExpense,
      profit,
      daysInMonth
    };
  }, [data, selectedYear, selectedMonth]);

  const { weekdayData, pieData, totalIncome, totalExpense, profit, daysInMonth } = dashboardData;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !user) return;

    const fetchData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setData(userDoc.data() as DashboardData);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, mounted, selectedYear, selectedMonth]);

  if (!mounted) return null;
  if (!user) return null;
  if (loading || !data) return <Loading />;

  const dailyGoal = data.settings?.dailyGoal || 600;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <MonthSelector 
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={setSelectedMonth}
          onYearChange={setSelectedYear}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incassi Totali</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalIncome.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Media giornaliera: €{(totalIncome / daysInMonth).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spese Totali</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalExpense.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Media giornaliera: €{(totalExpense / daysInMonth).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profitto</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{profit.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Margine: {totalIncome > 0 ? ((profit / totalIncome) * 100).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Obiettivo</CardTitle>
            <Target className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{dailyGoal.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Progresso: {totalIncome > 0 ? ((totalIncome / (dailyGoal * daysInMonth)) * 100).toFixed(1) : 0}%
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        

        <Card>
          <CardHeader>
            <CardTitle>Distribuzione Spese</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                    startAngle={90}
                    endAngle={450}
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                        stroke="none"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#FFF',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      padding: '12px'
                    }}
                    formatter={(value: number) => `€${value.toFixed(2)}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-3">
              {pieData.map((entry, index) => (
                <div key={entry.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full transition-transform hover:scale-110"
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                    />
                    <span className="text-sm font-medium text-gray-700">{entry.name}</span>
                  </div>
                  <span className="text-sm font-semibold">€{entry.value.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle>Incassi per Giorno della Settimana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekdayData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#6B7280"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis 
                    hide={true}
                  />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: '#FFF',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                    formatter={(value) => [`€${value}`, 'Incassi']}
                  />
                  <Bar 
                    dataKey="amount" 
                    fill={BRAND_COLORS.income.main}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}