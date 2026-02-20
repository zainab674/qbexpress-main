import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Layout from "@/components/layout/Layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {

  const generalFAQs = [
    {
      question: "What is QBXpress?",
      answer: "QBXpress is a professional bookkeeping service that combines expert accountants with automation to provide accurate, timely financial management for businesses of all sizes. We handle everything from daily transaction categorization to monthly financial reporting.",
    },
    {
      question: "How is QBXpress different from other bookkeeping services?",
      answer: "We combine the best of both worlds: cutting-edge automation for efficiency and expert human oversight for accuracy. Every set of books is reviewed by a CPA, and you get real-time access to your financial data through our dashboard. Plus, our transparent pricing means no surprises.",
    },
    {
      question: "What accounting software do you support?",
      answer: "We work with all major accounting platforms including QuickBooks Online, QuickBooks Desktop, Xero, FreshBooks, and Wave. We can also help you migrate to a new platform if needed.",
    },
    {
      question: "How long does it take to get started?",
      answer: "Most clients are fully onboarded within 5-10 business days. This includes connecting your accounts, reviewing your historical transactions, and setting up your reporting preferences.",
    },
  ];

  const pricingFAQs = [
    {
      question: "How does your pricing work?",
      answer: "We offer both monthly packages and pay-per-use pricing. Packages start at $150/month and include a set number of transactions. For businesses that prefer flexibility, our pay-per-use model charges $0.70 per transaction for bookkeeping and $1.25-$2.50 per invoice for AR services.",
    },
    {
      question: "Are there any setup fees?",
      answer: "No setup fees! We believe in transparent pricing with no hidden costs. The price you see is the price you pay.",
    },
    {
      question: "Do you offer a free trial?",
      answer: "Yes! New clients receive their first month of bookkeeping services free. No credit card required, no commitment. Try us out and see if we're a good fit.",
    },
    {
      question: "Can I change my plan later?",
      answer: "Absolutely. You can upgrade, downgrade, or switch between monthly packages and pay-per-use at any time. We're flexible because your business needs might change.",
    },
  ];

  const serviceFAQs = [
    {
      question: "What's included in bookkeeping services?",
      answer: "Our bookkeeping services include daily transaction categorization, bank and credit card reconciliation, monthly financial statements (P&L, Balance Sheet, Cash Flow), and CPA review. You also get access to our real-time dashboard.",
    },
    {
      question: "Do you handle accounts receivable and payable?",
      answer: "Yes! Our AR services include invoice creation, delivery, payment tracking, and collections. AP services include bill entry, approval workflows, and payment processing. These can be added to any bookkeeping package.",
    },
    {
      question: "Can you help with tax preparation?",
      answer: "We provide tax-ready books year-round and can coordinate with your CPA during tax season. We also offer tax preparation services for an additional fee, including business returns and 1099 filing.",
    },
    {
      question: "Do you offer payroll services?",
      answer: "Yes! We offer full-service payroll including tax calculations and filings, direct deposit, and year-end W-2 and 1099 preparation. Payroll starts at $40/month plus $6 per employee.",
    },
  ];

  const supportFAQs = [
    {
      question: "How do I contact support?",
      answer: "You can reach our support team by phone at 1-800-555-0123 (Mon-Fri, 9am-6pm EST), by email at support@qbxpress.com, or through the chat feature in your dashboard. Most inquiries are answered within 4 hours.",
    },
    {
      question: "Will I have a dedicated bookkeeper?",
      answer: "Yes! Every client is assigned a dedicated bookkeeper who knows your business. For Growth and Enterprise plans, you'll also have access to a CPA for strategic guidance.",
    },
    {
      question: "How often will I receive reports?",
      answer: "Standard reporting is monthly, but we can accommodate weekly or even daily reporting for businesses that need more frequent updates. Real-time data is always available in your dashboard.",
    },
  ];

  const faqSections = [
    { title: "General Questions", items: generalFAQs },
    { title: "Pricing & Plans", items: pricingFAQs },
    { title: "Services", items: serviceFAQs },
    { title: "Support", items: supportFAQs },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container-wide text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about QBXpress. Can't find what you're looking for? 
            Contact our team.
          </p>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="section-padding">
        <div className="container-wide max-w-3xl">
          {faqSections.map((section, sectionIndex) => (
            <div key={section.title} className="mb-12 last:mb-0">
              <h2 className="text-xl font-display font-semibold text-foreground mb-4">
                {section.title}
              </h2>
              <Accordion type="single" collapsible className="space-y-3">
                {section.items.map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`${sectionIndex}-${i}`}
                    className="bg-card rounded-xl border border-border px-6 data-[state=open]:shadow-md transition-shadow"
                  >
                    <AccordionTrigger className="text-left text-foreground hover:text-primary hover:no-underline py-4">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-secondary/30">
        <div className="container-narrow text-center">
          <h2 className="text-2xl font-display font-bold text-foreground mb-4">
            Still have questions?
          </h2>
          <p className="text-muted-foreground mb-6">
            Our team is happy to help you with any questions you might have.
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

export default FAQ;
