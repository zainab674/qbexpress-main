import { useEffect, useState } from "react";

interface Section {
  id: string;
  label: string;
}

const sections: Section[] = [
  { id: "core-services", label: "Core Services" },
  { id: "payroll", label: "Payroll" },
  { id: "industries", label: "Industries" },
  { id: "cfo-services", label: "CFO Services" },
  { id: "additional", label: "Additional Services" },
  { id: "process", label: "How it Works" },
];

const ServicesSidebar = () => {
  const [activeSection, setActiveSection] = useState<string>("core-services");

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;

      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: "smooth",
      });
    }
  };

  return (
    <aside className="hidden lg:block w-56 shrink-0">
      <div className="sticky top-28">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          On this page
        </h4>
        <nav className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                activeSection === section.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              {section.label}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default ServicesSidebar;