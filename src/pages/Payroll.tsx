import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Check, 
  DollarSign, 
  FileText, 
  Users, 
  Clock,
  Shield,
  Calculator
} from "lucide-react";
import Layout from "@/components/layout/Layout";

const Payroll = () => {

  const features = [
    {
      icon: DollarSign,
      title: "Full-Cycle Processing",
      description: "From time tracking to direct deposit, we handle every step of payroll processing.",
    },
    {
      icon: FileText,
      title: "Tax Filings",
      description: "Automatic calculation and filing of federal, state, and local payroll taxes.",
    },
    {
      icon: Users,
      title: "Employee & Contractor",
      description: "Support for W-2 employees and 1099 contractors in a single platform.",
    },
    {
      icon: Clock,
      title: "Time Tracking Integration",
      description: "Connect with popular time tracking tools or use our built-in solution.",
    },
    {
      icon: Shield,
      title: "Compliance",
      description: "Stay compliant with federal and state labor laws and reporting requirements.",
    },
    {
      icon: Calculator,
      title: "Benefits Administration",
      description: "Deduction management for health insurance, retirement plans, and more.",
    },
  ];

  const included = [
    "Unlimited pay runs",
    "Direct deposit",
    "Employee self-service portal",
    "PTO tracking",
    "Garnishment processing",
    "New hire reporting",
    "Year-end W-2s and 1099s",
    "Workers' comp integration",
    "Multi-state payroll",
    "Dedicated support specialist",
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container-wide">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Payroll that just works
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Full-service payroll processing for employees and contractors. 
              Automatic tax calculations, filings, and compliance—so you never miss a beat.
            </p>
            <Link to="/intake/consultation">
              <Button variant="hero" size="lg">
                Get Free Consultation
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-card border border-border hover-lift"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="section-padding bg-secondary/30">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-display font-bold text-foreground mb-4">
                Everything included
              </h2>
              <p className="text-muted-foreground mb-8">
                One flat fee covers all payroll services. No hidden charges for tax filings 
                or year-end processing.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {included.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-success shrink-0" />
                    <span className="text-sm text-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-8">
              <h3 className="text-xl font-display font-semibold text-foreground mb-6">
                Simple Pricing
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-border">
                  <span className="text-muted-foreground">Base fee</span>
                  <span className="font-medium text-foreground">$40/month</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-border">
                  <span className="text-muted-foreground">Per employee</span>
                  <span className="font-medium text-foreground">$6/month</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-border">
                  <span className="text-muted-foreground">Per contractor</span>
                  <span className="font-medium text-foreground">$4/month</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-medium text-foreground">Example: 10 employees</span>
                  <span className="text-xl font-display font-bold text-primary">$100/mo</span>
                </div>
              </div>
              <Link to="/intake/consultation">
                <Button 
                  variant="hero" 
                  className="w-full mt-6"
                >
                  Get a Quote
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container-narrow text-center">
          <h2 className="text-3xl font-display font-bold text-foreground mb-4">
            Ready to simplify payroll?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Switch to QBXpress payroll and never worry about payroll taxes again.
          </p>
          <Link to="/intake/consultation">
            <Button variant="hero" size="lg">
              Get Free Consultation
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Payroll;
