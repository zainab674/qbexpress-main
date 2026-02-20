import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  FileCheck, 
  Calendar, 
  Calculator, 
  Shield,
  Users,
  Building2
} from "lucide-react";
import Layout from "@/components/layout/Layout";

const TaxServices = () => {

  const services = [
    {
      icon: Calendar,
      title: "Year-Round Tax Planning",
      description: "Proactive tax planning strategies to minimize your liability throughout the year.",
    },
    {
      icon: FileCheck,
      title: "Business Tax Returns",
      description: "Expert preparation for partnerships, S-corps, C-corps, and sole proprietorships.",
    },
    {
      icon: Calculator,
      title: "Quarterly Estimates",
      description: "Accurate quarterly tax estimate calculations to avoid penalties.",
    },
    {
      icon: Shield,
      title: "Audit Support",
      description: "Representation and support if you're selected for an IRS or state audit.",
    },
    {
      icon: Users,
      title: "1099 Preparation",
      description: "Complete preparation and filing of 1099-NEC and 1099-MISC forms.",
    },
    {
      icon: Building2,
      title: "Sales Tax Compliance",
      description: "Multi-state sales tax registration, calculation, and filing.",
    },
  ];

  const timeline = [
    { month: "January", task: "Distribute 1099s and W-2s to contractors and employees" },
    { month: "March", task: "First quarter estimated tax payments due" },
    { month: "April", task: "Business tax return filing deadline" },
    { month: "June", task: "Second quarter estimated tax payments due" },
    { month: "September", task: "Third quarter estimated tax payments due" },
    { month: "December", task: "Year-end tax planning and strategy sessions" },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container-wide">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Tax services that save you money
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Year-round tax planning and preparation to minimize your tax burden 
              and keep you compliant. CPA-prepared, always accurate.
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

      {/* Services */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">
              Comprehensive tax solutions
            </h2>
            <p className="text-muted-foreground">
              From planning to filing, we handle every aspect of your business taxes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.title}
                className="p-6 rounded-2xl bg-card border border-border hover-lift"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tax Calendar */}
      <section className="section-padding bg-secondary/30">
        <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">
              Stay on top of tax deadlines
            </h2>
            <p className="text-muted-foreground">
              We track all important dates and remind you well in advance.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-4">
              {timeline.map((item, i) => (
                <div
                  key={item.month}
                  className="flex gap-4 items-start p-4 rounded-xl bg-card border border-border"
                >
                  <div className="w-24 shrink-0">
                    <span className="text-sm font-medium text-primary">{item.month}</span>
                  </div>
                  <p className="text-sm text-foreground">{item.task}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container-narrow">
          <div className="bg-gradient-to-br from-primary to-accent rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-display font-bold text-primary-foreground mb-4">
              Reduce your tax burden
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Our CPAs will review your situation and identify opportunities to save.
            </p>
            <Link to="/intake/consultation">
              <Button 
                size="lg" 
                className="bg-card text-foreground hover:bg-card/90"
              >
                Get Free Consultation
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default TaxServices;
