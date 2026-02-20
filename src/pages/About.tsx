import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Layout from "@/components/layout/Layout";

const About = () => {





  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container-wide">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
              Credentials
            </h1>
            <p className="text-lg text-muted-foreground">
              Crediteal of cpa Associated Chartered Accountancy Finalist and Certified Business Accountant (CBA)
            </p>
          </div>
        </div>
      </section>



      {/* Credentials & Expertise */}
      <section className="section-padding">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-display font-bold text-foreground mb-6">
                Credentials
              </h2>
              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20">
                  <h3 className="text-xl font-display font-bold text-primary mb-4">Crediteal</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-foreground font-medium">Crediteal of cpa Associated</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-foreground font-medium">Chartered Accountancy Finalist</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-foreground font-medium">Certified Business Accountant (CBA)</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    <strong>4+ years of experience</strong> in Financial Reporting, Bookkeeping, Management Accounting, Internal and External Audits and Regulatory Compliance across diverse industries including real estate and construction, manufacturing, FMCG, import/export, chemicals, textiles, hospitality and welfare organizations.
                  </p>
                  <p>
                    Skilled in end-to-end accounting operations, IFRS-based reporting, taxation compliance, cash flow management and internal controls, with a proven track record of providing senior management and auditors with accurate, reliable and decision focused financial information.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-display font-bold text-foreground mb-4">Key skills</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "IFRS & IAS Financial Reporting",
                    "Internal & External Audit (ISA)",
                    "Budgeting & Forecasting",
                    "Cash Flow Management",
                    "Risk Assessment & Controls",
                    "Taxation Compliance"
                  ].map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-display font-bold text-foreground mb-4">ERP & Software:</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {["Oracle", "SAP", "NGL", "QuickBooks", "Odoo", "GBM"].map((software) => (
                    <div key={software} className="p-3 text-center rounded-xl border border-border bg-card font-medium text-foreground">
                      {software}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>




      {/* CTA */}
      <section className="section-padding bg-secondary/30">
        <div className="container-narrow text-center">
          <h2 className="text-3xl font-display font-bold text-foreground mb-4">
            Ready to work with us?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Let's discuss how we can help your business thrive.
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

export default About;
