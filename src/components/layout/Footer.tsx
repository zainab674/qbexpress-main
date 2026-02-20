import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {

  const footerLinks = {
    services: [
      { label: "Bookkeeping", path: "/services" },
      { label: "Payroll", path: "/payroll" },
      { label: "Tax Services", path: "/tax-services" },
      { label: "Enterprise", path: "/enterprise" },
    ],
    company: [
      { label: "About Us", path: "/about" },
      { label: "Pricing", path: "/pricing" },
      { label: "Resources", path: "/resources" },
      { label: "FAQ", path: "/faq" },
    ],
    support: [
      { label: "Contact", path: "/contact" },
      { label: "Help Center", path: "/faq" },
    ],
  };

  return (
    <footer className="bg-foreground text-background">
      {/* Main Footer */}
      <div className="container-wide section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-lg">QB</span>
              </div>
              <span className="font-display font-bold text-xl text-background">
                QBXpress
              </span>
            </Link>
            <p className="text-background/70 text-sm leading-relaxed mb-6 max-w-sm">
              Professional bookkeeping services designed for growing businesses.
              Transparent pricing, expert support, and automated financial insights.
            </p>
            <div className="space-y-3">
              <a href="tel:1-917-946-7716" className="flex items-center gap-3 text-background/70 hover:text-background transition-colors text-sm">
                <Phone className="w-4 h-4" />
                917-946-7716
              </a>
              <a href="mailto:sales@qbxpress.com" className="flex items-center gap-3 text-background/70 hover:text-background transition-colors text-sm">
                <Mail className="w-4 h-4" />
                sales@qbxpress.com
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-semibold text-background mb-4">Services</h4>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-background/70 hover:text-background transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-display font-semibold text-background mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-background/70 hover:text-background transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-display font-semibold text-background mb-4">Support</h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-background/70 hover:text-background transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/10">
        <div className="container-wide py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/50 text-sm">
            © 2018 QBXpress. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-background/50 hover:text-background transition-colors text-sm">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-background/50 hover:text-background transition-colors text-sm">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
