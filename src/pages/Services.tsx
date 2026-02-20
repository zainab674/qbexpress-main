import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  BookOpen,
  FileText,
  Calculator,
  CreditCard,
  PieChart,
  Receipt,
  Building2,
  HardHat,
  UtensilsCrossed,
  ShoppingCart,
  Home,
  Server,
  Package,
  Landmark,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  LineChart,
  HeartPulse,
  DollarSign,
  Briefcase,
  Palette,
  Coins,
  Activity,
  Wrench,
  Rocket,
  FileCheck,
  Scale,
  ChevronLeft,
  ChevronRight,
  Search,
  Shield,
  ClipboardCheck,
  History,
  CheckCircle2,
  ListTodo,
  FileSearch,
  Settings,
  Factory,
  Ship,
  FlaskConical,
  Ruler,
  Heart
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import Footer from "@/components/layout/Footer";

const Services = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const sidebarLinks = [
    { id: "hero", label: "Overview", icon: Home },
    { id: "accounting", label: "Accounting", icon: BookOpen },
    { id: "reporting", label: "Financial Reporting", icon: FileText },
    { id: "budgeting", label: "Budgeting", icon: TrendingUp },
    { id: "reconciliations", label: "Reconciliations", icon: History },
    { id: "payables", label: "Payables & Receivables", icon: DollarSign },
    { id: "audit", label: "Audit Support", icon: FileSearch },
    { id: "controls", label: "Internal Controls", icon: Shield },
    { id: "additional", label: "Value-Added", icon: Briefcase },
    { id: "industries", label: "Industries", icon: Building2 },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  const filteredLinks = sidebarLinks.filter(link =>
    link.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allServices = [
    {
      id: "accounting",
      title: "Accounting & Bookkeeping Services",
      features: [
        "Complete bookkeeping from scratch, including chart of accounts setup and system structuring",
        "Review, correction, and rectification of previously maintained books",
        "Cleanup of inaccurate, incomplete, or non-compliant accounting records",
        "Day-to-day transaction recording and classification",
        "Maintenance of general ledger and subsidiary ledgers",
      ],
    },
    {
      id: "reporting",
      title: "Financial Statements & Reporting",
      features: [
        "Preparation of complete sets of financial statements, including:",
        "Statement of Financial Position (SOFP)",
        "Statement of Profit or Loss and Other Comprehensive Income (SOPL & OCI)",
        "Statement of Changes in Equity (SOCE)",
        "Statement of Cash Flows (SOCF)",
        "Notes to the Financial Statements",
        "Management accounts and periodic financial reports",
        "Prepared in accordance with: IFRS, GAAP, or Entity-specific regulatory or reporting requirements",
      ],
    },
    {
      id: "budgeting",
      title: "Budgeting, Forecasting & Financial Planning",
      features: [
        "Preparation of annual and periodic budgets",
        "Cash flow forecasting and projections",
        "Variance analysis (budget vs actual)",
        "Financial modeling and scenario analysis",
        "Funds requirement and utilization planning",
      ],
    },
    {
      id: "reconciliations",
      title: "Reconciliations & Error Rectification",
      features: [
        "Bank reconciliations",
        "Vendor and customer reconciliations",
        "Intercompany and control account reconciliations",
        "Identification and correction of accounting errors",
        "Suspense and aging analysis resolution",
      ],
    },
    {
      id: "payables",
      title: "Payables & Receivables Management",
      features: [
        "Accounts payable management and vendor aging analysis",
        "Accounts receivable management and customer aging reports",
        "Follow-up, tracking, and reporting of outstanding balances",
        "Credit control and receivable recovery support",
      ],
    },
    {
      id: "cashflow",
      title: "Cash Flow & Working Capital Management",
      features: [
        "Cash flow monitoring and management",
        "Daily, weekly, and monthly cash position reporting",
        "Working capital analysis and optimization",
        "Liquidity planning and short-term funding analysis",
      ],
    },
    {
      id: "management",
      title: "Management & Analytical Reports",
      features: [
        "Utilization and funds usage reports",
        "Cost analysis and profitability reports",
        "Departmental and project-wise financial reporting",
        "Key performance indicators (KPIs) and financial dashboards",
      ],
    },
    {
      id: "audit",
      title: "Audit & Assurance Support Services",
      features: [
        "Preparation and organization of audit-ready documentation",
        "Development of audit files and supporting schedules",
        "Assistance during external and internal audits",
        "Compliance with audit requirements and queries",
        "Documentation of accounting policies and procedures",
      ],
    },
    {
      id: "controls",
      title: "Internal Controls & SOP Development",
      features: [
        "Design and implementation of internal control systems",
        "Development and documentation of Standard Operating Procedures (SOPs)",
        "Review and improvement of existing financial processes",
        "Risk assessment and control gap identification",
      ],
    },
    {
      id: "additional",
      title: "Additional Value-Added Services",
      features: [
        "Accounting system review and improvement",
        "Support in transition to IFRS or revised accounting frameworks",
        "Financial due diligence support",
        "Advisory on accounting treatments and policies",
        "Training and guidance for junior accounting staff",
      ],
    },
  ];

  const industries = [
    { icon: Home, name: "real estate and construction" },
    { icon: Factory, name: "manufacturing" },
    { icon: ShoppingCart, name: "FMCG" },
    { icon: Ship, name: "import/export" },
    { icon: FlaskConical, name: "chemicals" },
    { icon: Ruler, name: "textiles" },
    { icon: UtensilsCrossed, name: "hospitality" },
    { icon: Heart, name: "welfare organizations" },
  ];

  return (
    <Layout showFooter={false}>
      {/* Sidebar - Desktop Only */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-5rem)] z-40 transition-all duration-300 hidden xl:block
          ${isSidebarCollapsed ? "w-20" : "w-64"} 
          bg-card border-r border-border shadow-sm overflow-y-auto`}
      >
        <div className="flex flex-col h-full p-4">

          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-secondary transition-colors ml-4"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            ) : (
              <div className="flex items-center gap-2">
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                Close
              </div>
            )}
          </button>



          <nav className="space-y-">
            {filteredLinks.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all hover:bg-primary/10 group
                  ${isSidebarCollapsed ? "justify-center" : ""}`}
                title={item.label}
              >
                <item.icon className={`w-5 h-5 transition-colors group-hover:text-primary ${isSidebarCollapsed ? "" : "shrink-0"}`} />
                {!isSidebarCollapsed && (
                  <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <div className={`transition-all duration-300 ${isSidebarCollapsed ? "xl:ml-20" : "xl:ml-64"}`}>
        {/* Hero */}
        <section id="hero" className="pt-32 pb-12 bg-gradient-to-b from-primary/5 to-background">
          <div className="container-wide">
            <div className="max-w-4xl">
              <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
                Professional Accounting, Finance & Audit Support Services
              </h1>
              <Link to="/intake/consultation">
                <Button variant="hero" size="lg">
                  Get Free Consultation
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* All Services */}
        {allServices.map((section, idx) => (
          <section
            key={section.id}
            id={section.id}
            className={`section-padding ${idx % 2 === 1 ? "bg-secondary/20" : ""}`}
          >
            <div className="container-wide">
              <div className="mb-10">
                <h2 className="text-3xl font-display font-bold text-foreground mb-4">
                  {section.title}
                </h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {section.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition-all"
                  >
                    <ArrowRight className="w-5 h-5 text-primary shrink-0 mt-1" />
                    <span className="text-foreground leading-relaxed">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* Industry Expertise */}
        <section id="industries" className="section-padding">
          <div className="container-wide">
            <div className="mb-12">
              <h2 className="text-3xl font-display font-bold text-foreground mb-4">
                Industries
              </h2>
              <p className="text-muted-foreground max-w-2xl">
                diverse industries including real estate and construction, manufacturing, FMCG, import/export, chemicals, textiles, hospitality and welfare organizations.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {industries.map((item) => (
                <div key={item.name} className="p-4 rounded-xl border border-border bg-card flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <item.icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-medium text-foreground text-sm">{item.name}</h3>
                </div>
              ))}
            </div>
          </div>
        </section>



        {/* CTA */}
        <section className="section-padding">
          <div className="container-narrow">
            <div className="bg-primary text-white rounded-3xl p-12 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />

              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                Professional Accounting, Finance & Audit Support Services
              </h2>
              <p className="text-primary-foreground/80 mb-10 max-w-xl mx-auto text-lg">
                Crediteal of cpa Associated Chartered Accountancy Finalist and Certified Business Accountant (CBA)
              </p>
              <Link to="/intake/consultation">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 font-bold px-10">
                  Book a Strategy Call
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    </Layout>
  );
};

export default Services;
