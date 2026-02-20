import { useEffect, useState } from "react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from "recharts";

const DashboardPreview = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const revenueData = [
    { month: "Jan", revenue: 4200, expenses: 2400 },
    { month: "Feb", revenue: 5100, expenses: 2800 },
    { month: "Mar", revenue: 4800, expenses: 2600 },
    { month: "Apr", revenue: 6200, expenses: 3100 },
    { month: "May", revenue: 7100, expenses: 3400 },
    { month: "Jun", revenue: 6800, expenses: 3200 },
    { month: "Jul", revenue: 7800, expenses: 3600 },
  ];

  const expenseCategories = [
    { name: "Payroll", value: 45, color: "hsl(200, 80%, 40%)" },
    { name: "Operations", value: 25, color: "hsl(175, 70%, 45%)" },
    { name: "Marketing", value: 15, color: "hsl(155, 70%, 45%)" },
    { name: "Other", value: 15, color: "hsl(40, 95%, 55%)" },
  ];

  const invoiceData = [
    { status: "Paid", count: 24 },
    { status: "Pending", count: 8 },
    { status: "Overdue", count: 3 },
  ];

  return (
    <div className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
        {/* Window Chrome */}
        <div className="bg-secondary/50 px-4 py-3 flex items-center gap-2 border-b border-border">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive/60" />
            <div className="w-3 h-3 rounded-full bg-warning/60" />
            <div className="w-3 h-3 rounded-full bg-success/60" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-muted rounded-md px-4 py-1 text-xs text-muted-foreground">
              dashboard.qbxpress.com
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-4 md:p-6 bg-gradient-to-br from-card to-secondary/20">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            {[
              { label: "Revenue", value: "$78,400", change: "+12%", positive: true },
              { label: "Expenses", value: "$32,100", change: "+5%", positive: false },
              { label: "Net Profit", value: "$46,300", change: "+18%", positive: true },
              { label: "Invoices", value: "35", change: "8 pending", positive: null },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`bg-card rounded-xl p-3 md:p-4 border border-border shadow-sm transition-all duration-500 ${
                  isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                }`}
                style={{ transitionDelay: `${i * 100 + 200}ms` }}
              >
                <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-lg md:text-xl font-display font-bold text-foreground">{stat.value}</p>
                {stat.positive !== null ? (
                  <span className={`text-xs font-medium ${stat.positive ? "text-success" : "text-destructive"}`}>
                    {stat.change}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">{stat.change}</span>
                )}
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Revenue Chart */}
            <div className="md:col-span-2 bg-card rounded-xl p-4 border border-border">
              <h4 className="text-sm font-medium text-foreground mb-3">Revenue vs Expenses</h4>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(200, 80%, 40%)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(200, 80%, 40%)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(175, 70%, 45%)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(175, 70%, 45%)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'hsl(215, 15%, 50%)' }} />
                    <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 15%, 50%)' }} />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'hsl(0, 0%, 100%)', 
                        border: '1px solid hsl(210, 20%, 90%)',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }} 
                    />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(200, 80%, 40%)" fillOpacity={1} fill="url(#colorRevenue)" />
                    <Area type="monotone" dataKey="expenses" stroke="hsl(175, 70%, 45%)" fillOpacity={1} fill="url(#colorExpenses)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expense Breakdown */}
            <div className="bg-card rounded-xl p-4 border border-border">
              <h4 className="text-sm font-medium text-foreground mb-3">Expenses by Category</h4>
              <div className="h-32 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      dataKey="value"
                      stroke="none"
                    >
                      {expenseCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        background: 'hsl(0, 0%, 100%)', 
                        border: '1px solid hsl(210, 20%, 90%)',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {expenseCategories.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-1 text-xs">
                    <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                    <span className="text-muted-foreground">{cat.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPreview;
