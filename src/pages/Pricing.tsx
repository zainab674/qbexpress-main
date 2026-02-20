import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Sparkles, Users, Building2 } from "lucide-react";
import Layout from "@/components/layout/Layout";

const Pricing = () => {

  const packages = [
    {
      name: "Starter",
      description: "For small businesses just getting started",
      highlight: "Perfect for startups",
      icon: Sparkles,
      features: ["Up to 100 transactions", "Monthly reconciliation", "Basic financial reports", "Email support", "QuickBooks Online sync"],
      popular: false,
    },
    {
      name: "Growth",
      description: "For growing businesses with more needs",
      highlight: "Most popular choice",
      icon: Users,
      features: ["Up to 500 transactions", "Weekly reconciliation", "Full financial reports", "Priority support", "AR/AP management", "Dedicated bookkeeper", "CPA review"],
      popular: true,
    },
    {
      name: "Enterprise",
      description: "For established businesses at scale",
      highlight: "Unlimited potential",
      icon: Building2,
      features: ["Unlimited transactions", "Daily reconciliation", "Custom reporting", "24/7 support", "Full AR/AP automation", "Dedicated team", "Controller oversight", "Multi-entity support"],
      popular: false,
    },
  ];

  return (
    <Layout>
      <section className="pt-32 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container-wide text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">Flexible Plans for Every Business</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">Get a customized quote tailored to your business needs. Every company is unique, and so is our approach.</p>
          <Link to="/intake/consultation">
            <Button variant="hero" size="lg">Get Your Custom Quote<ArrowRight className="w-5 h-5" /></Button>
          </Link>
        </div>
      </section>
      <section className="section-padding">
        <div className="container-wide">
          <h2 className="text-2xl font-display font-bold text-foreground text-center mb-8">Choose Your Plan</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {packages.map((pkg) => (
              <div key={pkg.name} className={`relative rounded-2xl p-6 border ${pkg.popular ? "border-primary bg-card shadow-lg shadow-primary/10" : "border-border bg-card"}`}>
                {pkg.popular && <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">Most Popular</div>}
                <div className="mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4"><pkg.icon className="w-6 h-6 text-primary" /></div>
                  <h3 className="text-xl font-display font-semibold text-foreground mb-1">{pkg.name}</h3>
                  <p className="text-sm text-muted-foreground">{pkg.description}</p>
                </div>
                <div className="mb-6 py-4 border-y border-border"><p className="text-sm font-medium text-primary text-center">{pkg.highlight}</p></div>
                <ul className="space-y-3 mb-6">
                  {pkg.features.map((feature) => (<li key={feature} className="flex items-start gap-2 text-sm"><Check className="w-4 h-4 text-success mt-0.5 shrink-0" /><span className="text-foreground">{feature}</span></li>))}
                </ul>
                <Link to="/intake/consultation">
                  <Button variant={pkg.popular ? "hero" : "outline"} className="w-full">Get Custom Quote</Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section-padding">
        <div className="container-narrow text-center">
          <h2 className="text-2xl font-display font-bold text-foreground mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-6">Schedule a free consultation and we'll create a custom plan that fits your business perfectly.</p>
          <Link to="/intake/consultation">
            <Button variant="hero" size="lg">Get Free Consultation<ArrowRight className="w-5 h-5" /></Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Pricing;
