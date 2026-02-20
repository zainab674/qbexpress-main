import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Services from "./pages/Services";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Enterprise from "./pages/Enterprise";
import Payroll from "./pages/Payroll";
import TaxServices from "./pages/TaxServices";
import Resources from "./pages/Resources";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";
import ReportGraph from "./pages/ReportGraph";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ClientIntake from "./pages/ClientIntake";
import ClientDashboard from "./pages/ClientDashboard";
import DashboardDetail from "./pages/DashboardDetail";
import { ProtectedRoute } from "./components/ProtectedRoute";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/reports" element={
            <ProtectedRoute>
              <ReportGraph />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <ClientDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/detail/:type" element={
            <ProtectedRoute>
              <DashboardDetail />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Index />} />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/intake" element={<ClientIntake />} />
          <Route path="/intake/:meeting" element={<ClientIntake />} />
          <Route path="/services" element={<Services />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/enterprise" element={<Enterprise />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/tax-services" element={<TaxServices />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/faq" element={<FAQ />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
