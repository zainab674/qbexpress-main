import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  Building2, 
  Globe, 
  Shield, 
  Users, 
  BarChart3,
  Layers,
  Clock,
  FileCheck
} from "lucide-react";
import Layout from "@/components/layout/Layout";

const Enterprise = () => {

  const features = [
    {
      icon: Building2,
      title: "Multi-Entity Support",
      description: "Manage multiple companies, subsidiaries, and locations from a single platform with consolidated reporting.",
    },
    {
      icon: Globe,
      title: "Multi-Currency",
      description: "Handle international transactions with automatic currency conversion and compliance.",
    },
    {
      icon: Shield,
      title: "SOC 2 Compliant",
      description: "Enterprise-grade security with SOC 2 Type II certification and data encryption.",
    },
    {
      icon: Users,
      title: "Dedicated Team",
      description: "Your own controller and bookkeeping team, available for strategic financial guidance.",
    },
    {
      icon: BarChart3,
      title: "Custom Reporting",
      description: "Build custom dashboards and reports tailored to your specific KPIs and board requirements.",
    },
    {
      icon: Layers,
      title: "ERP Integration",
      description: "Seamless integration with NetSuite, SAP, Oracle, and other enterprise systems.",
    },
   
   
  ];

 

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container-wide">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              Enterprise Solutions
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Outsourced accounting for growing enterprises
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Controller-led financial operations for companies doing $20M+ in revenue. 
              Scale your finance function without scaling headcount.
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
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">
              Enterprise-grade capabilities
            </h2>
            <p className="text-muted-foreground">
              Everything you need to run financial operations at scale.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Use Cases */}
      <section className="section-padding bg-secondary/30">
        <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-display font-bold text-foreground mb-4">
              Built for complex businesses
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                title: "SaaS & Tech",
                description: "ASC 606 revenue recognition, deferred revenue tracking, and MRR/ARR reporting.",
              },
              {
                title: "E-commerce",
                description: "Multi-channel inventory, sales tax automation, and marketplace reconciliation.",
              },
              {
                title: "Professional Services",
                description: "Project-based accounting, utilization tracking, and WIP management.",
              },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-2xl bg-card border border-border">
                <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container-narrow">
          <div className="bg-gradient-to-br from-primary to-accent rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-display font-bold text-primary-foreground mb-4">
              Ready to scale your finance function?
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Schedule a consultation to see how we can support your enterprise.
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

export default Enterprise;
