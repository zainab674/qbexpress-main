import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem('qb_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    };
    checkUser();
    // Listen for storage events in case login happens in another tab
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('qb_user');
    setUser(null);
    window.location.reload();
  };

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: "/services", label: "Services" },
    { path: "/pricing", label: "Pricing" },
    ...(user ? [{ path: "/dashboard", label: "Dashboard" }] : []),
    { path: "/reports", label: "Reports" },
    { path: "/enterprise", label: "Enterprise" },
    { path: "/payroll", label: "Payroll" },
    { path: "/about", label: "About" },
  ];

  const moreLinks = [
    { path: "/tax-services", label: "Tax Services" },
    { path: "/resources", label: "Resources" },
    { path: "/faq", label: "FAQ" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? "bg-card/95 backdrop-blur-md shadow-md py-3"
          : "bg-transparent py-5"
          }`}
      >
        <div className="container-wide flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md group-hover:shadow-glow transition-shadow">
              <span className="text-primary-foreground font-display font-bold text-lg">QB</span>
            </div>
            <span className="font-display font-bold text-xl text-foreground">
              QBXpress
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(link.path)
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
              >
                {link.label}
              </Link>
            ))}

            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground bg-transparent hover:bg-secondary">
                    More
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-48 gap-1 p-2">
                      {moreLinks.map((link) => (
                        <li key={link.path}>
                          <NavigationMenuLink asChild>
                            <Link
                              to={link.path}
                              className={`block px-3 py-2 rounded-md text-sm transition-colors ${isActive(link.path)
                                ? "text-primary bg-primary/10"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                                }`}
                            >
                              {link.label}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/contact">
              <Button variant="ghost" size="sm">
                Contact
              </Button>
            </Link>
            {!user ? (
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
            ) : (
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Sign Out
              </Button>
            )}
            <Link to="/intake/intro-call">
              <Button variant="hero" size="sm">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-card/98 backdrop-blur-lg border-b border-border shadow-lg animate-fade-in">
            <nav className="container-wide py-4 flex flex-col gap-1">
              {[...navLinks, ...moreLinks].map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(link.path)
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 mt-2 border-t border-border flex flex-col gap-2">
                {!user ? (
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-center">
                      Sign In
                    </Button>
                  </Link>
                ) : (
                  <Button variant="ghost" className="w-full justify-center" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>
                    Sign Out
                  </Button>
                )}

                <Link to="/intake/intro-call" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="hero"
                    className="w-full"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;
