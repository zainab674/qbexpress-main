import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, FileText, Video, Download } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useToast } from "@/hooks/use-toast";

const Resources = () => {
  const { toast } = useToast();

  const guides = [
    {
      title: "Small Business Bookkeeping Guide",
      description: "Everything you need to know about setting up and maintaining your books.",
      type: "Guide",
      readTime: "15 min read",
    },
    {
      title: "Understanding Cash vs Accrual Accounting",
      description: "Which accounting method is right for your business?",
      type: "Article",
      readTime: "8 min read",
    },
    {
      title: "Tax Deduction Checklist for Small Businesses",
      description: "Don't miss these common deductions that could save you thousands.",
      type: "Checklist",
      readTime: "5 min read",
    },
    {
      title: "Payroll Compliance 101",
      description: "A guide to staying compliant with federal and state payroll regulations.",
      type: "Guide",
      readTime: "12 min read",
    },
    {
      title: "Financial Statements Explained",
      description: "How to read and understand your P&L, Balance Sheet, and Cash Flow.",
      type: "Article",
      readTime: "10 min read",
    },
    {
      title: "Year-End Closing Checklist",
      description: "Everything you need to do to close out your books for the year.",
      type: "Checklist",
      readTime: "6 min read",
    },
  ];



  const handleRegister = (title: string) => {
    toast({
      title: "Registration Coming Soon",
      description: `Registration for "${title}" will be available shortly.`,
    });
  };

  const handleDownload = (template: string) => {
    toast({
      title: "Download Coming Soon",
      description: `"${template}" will be available for download shortly.`,
    });
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container-wide text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Resources
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Guides, templates, and expert insights to help you manage your finances better.
          </p>
        </div>
      </section>

      {/* Guides & Articles */}
      <section className="section-padding">
        <div className="container-wide">
          <h2 className="text-2xl font-display font-bold text-foreground mb-8">
            Guides & Articles
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guides.map((guide) => (
              <article
                key={guide.title}
                className="group p-6 rounded-2xl bg-card border border-border hover-lift cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                    {guide.type}
                  </span>
                  <span className="text-xs text-muted-foreground">{guide.readTime}</span>
                </div>
                <h3 className="text-lg font-display font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {guide.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {guide.description}
                </p>
                <span className="inline-flex items-center gap-1 text-sm text-primary font-medium">
                  Read more
                  <ArrowRight className="w-4 h-4" />
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>

     

      {/* CTA */}
      <section className="section-padding">
        <div className="container-narrow text-center">
          <h2 className="text-2xl font-display font-bold text-foreground mb-4">
            Need personalized guidance?
          </h2>
          <p className="text-muted-foreground mb-6">
            Our team is here to help you with any questions.
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

export default Resources;
