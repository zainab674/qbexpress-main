import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, TrendingUp, Shield, Clock } from "lucide-react";
import Layout from "@/components/layout/Layout";
import DashboardPreview from "@/components/home/DashboardPreview";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

const Index = () => {

  const features = [
    {
      icon: TrendingUp,
      title: "Automated Reports",
      description: "Real-time financial dashboards and automated monthly reports delivered to your inbox.",
    },
    {
      icon: Shield,
      title: "CPA Reviewed",
      description: "Every transaction is reviewed by certified professionals for accuracy and compliance.",
    },
    {
      icon: Clock,
      title: "Same-Day Updates",
      description: "Your books are updated daily, so you always know where your business stands.",
    },
  ];



  const services = [
    { title: "Bookkeeping", description: "Monthly reconciliation & categorization", highlight: "Full-service" },
    { title: "Invoicing", description: "Create, send, and track invoices", highlight: "Automated" },
    { title: "Payroll", description: "Full-service payroll processing", highlight: "Integrated" },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-accent/5 rounded-full blur-3xl" />

        <div className="container-wide relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium animate-fade-in">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Trusted by 5,000+ businesses
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight animate-slide-up">
                Bookkeeping that{" "}
                <span className="gradient-text">grows with you</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-xl animate-slide-up stagger-1">
                Professional bookkeeping services with transparent pricing.
                Get real-time financial insights, automated reports, and CPA-reviewed accuracy.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 animate-slide-up stagger-2">
                {localStorage.getItem('qb_user') ? (
                  <Link to="/dashboard">
                    <Button
                      variant="hero"
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      Go to Dashboard
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                ) : (
                  <Link to="/intake/consultation">
                    <Button
                      variant="hero"
                      size="lg"
                      className="w-full sm:w-auto"
                    >
                      Get Free Consultation
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-6 pt-4 animate-slide-up stagger-3">
                {[
                  "No setup fees",
                  "Cancel anytime",
                  "First month free",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-success" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column - Dashboard Preview */}
            <div className="relative lg:pl-8">
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>



      {/* Features Section */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Why businesses choose QBXpress
            </h2>
            <p className="text-muted-foreground">
              We combine expert accountants with powerful automation to deliver
              accurate, timely financial insights.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-card border border-border hover-lift cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Preview Section */}
      <section className="section-padding bg-secondary/30">
        <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
              Comprehensive financial services
            </h2>
            <p className="text-muted-foreground">
              Everything you need to manage your finances, all in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {services.map((service) => (
              <div
                key={service.title}
                className="p-6 rounded-2xl bg-card border border-border hover-lift"
              >
                <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-4">
                  {service.highlight}
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

          <div className="text-center mt-8">
            <Link to="/services">
              <Button variant="outline" size="lg">
                View All Services
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding">
        <div className="container-narrow">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-90" />
            <div className="relative z-10 p-8 md:p-12 lg:p-16 text-center">
              <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
                Ready to simplify your bookkeeping?
              </h2>
              <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
                Get started with a free consultation. No commitment, no pressure—just
                a conversation about how we can help your business thrive.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/intake/consultation">
                  <Button
                    size="lg"
                    className="bg-card text-foreground hover:bg-card/90 shadow-xl"
                  >
                    Get Free Consultation
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  >
                    View Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
