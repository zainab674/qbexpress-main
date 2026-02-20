import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Calendar, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConsultationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ConsultationModal = ({ open, onOpenChange }: ConsultationModalProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    teamSize: "",
    revenue: "",
    industry: "",
    accountingSoftware: "",
  });

  const teamSizeOptions = [
    "Just me (Solo)",
    "2-5 employees",
    "6-10 employees",
    "11-25 employees",
    "26-50 employees",
    "51-100 employees",
    "100+ employees",
  ];

  const revenueOptions = [
    "Pre-revenue / Just starting",
    "Under $100K",
    "$100K - $500K",
    "$500K - $1M",
    "$1M - $5M",
    "$5M - $10M",
    "$10M+",
  ];

  const industryOptions = [
    "E-commerce / Retail",
    "Real Estate / Property Management",
    "Construction",
    "Restaurant / Food Service",
    "Healthcare / Med Tech",
    "Technology / SaaS",
    "Professional Services",
    "Manufacturing",
    "Architecture / Design",
    "Wealth Advisory / Finance",
    "MSP / IT Services",
    "Other",
  ];

  const accountingSoftwareOptions = [
    "QuickBooks Online",
    "QuickBooks Desktop",
    "Xero",
    "FreshBooks",
    "Wave",
    "Sage",
    "NetSuite",
    "None / Spreadsheets",
    "Other",
  ];

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step === 1 && (!formData.name || !formData.email)) {
      toast({
        title: "Please fill in required fields",
        description: "Name and email are required.",
        variant: "destructive",
      });
      return;
    }
    if (step === 2 && (!formData.teamSize || !formData.revenue)) {
      toast({
        title: "Please fill in required fields",
        description: "Team size and revenue are required.",
        variant: "destructive",
      });
      return;
    }
    if (step === 3 && (!formData.industry || !formData.accountingSoftware)) {
      toast({
        title: "Please fill in required fields",
        description: "Industry and accounting software are required.",
        variant: "destructive",
      });
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate booking submission
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setStep(5); // Success step
  };

  const resetForm = () => {
    setStep(1);
    setFormData({
      name: "",
      email: "",
      phone: "",
      teamSize: "",
      revenue: "",
      industry: "",
      accountingSoftware: "",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">
            {step === 5 ? "Meeting Booked!" : "Get Free Consultation"}
          </DialogTitle>
          <DialogDescription>
            {step === 5
              ? "We'll be in touch shortly."
              : `Step ${step} of 4 - ${
                  step === 1
                    ? "Contact Info"
                    : step === 2
                    ? "Business Size"
                    : step === 3
                    ? "Industry Details"
                    : "Book Meeting"
                }`}
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        {step < 5 && (
          <div className="flex gap-2 mb-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 flex-1 rounded-full transition-colors ${
                  s <= step ? "bg-primary" : "bg-secondary"
                }`}
              />
            ))}
          </div>
        )}

        {/* Step 1: Contact Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="John Smith"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="john@company.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        )}

        {/* Step 2: Team Size & Revenue */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Team Size *</Label>
              <Select
                value={formData.teamSize}
                onValueChange={(value) => handleChange("teamSize", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team size" />
                </SelectTrigger>
                <SelectContent>
                  {teamSizeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Annual Revenue *</Label>
              <Select
                value={formData.revenue}
                onValueChange={(value) => handleChange("revenue", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select revenue range" />
                </SelectTrigger>
                <SelectContent>
                  {revenueOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Step 3: Industry & Software */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Industry *</Label>
              <Select
                value={formData.industry}
                onValueChange={(value) => handleChange("industry", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent>
                  {industryOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Current Accounting Software *</Label>
              <Select
                value={formData.accountingSoftware}
                onValueChange={(value) =>
                  handleChange("accountingSoftware", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select software" />
                </SelectTrigger>
                <SelectContent>
                  {accountingSoftwareOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Step 4: Book Meeting */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
              <h4 className="font-medium text-foreground">Your Information</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><span className="text-foreground">Name:</span> {formData.name}</p>
                <p><span className="text-foreground">Email:</span> {formData.email}</p>
                {formData.phone && <p><span className="text-foreground">Phone:</span> {formData.phone}</p>}
                <p><span className="text-foreground">Team Size:</span> {formData.teamSize}</p>
                <p><span className="text-foreground">Revenue:</span> {formData.revenue}</p>
                <p><span className="text-foreground">Industry:</span> {formData.industry}</p>
                <p><span className="text-foreground">Software:</span> {formData.accountingSoftware}</p>
              </div>
            </div>
            <div className="bg-primary/10 rounded-xl p-4 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-primary" />
              <div>
                <p className="font-medium text-foreground">30-Minute Free Consultation</p>
                <p className="text-sm text-muted-foreground">We'll reach out within 24 hours to schedule your call</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Success */}
        {step === 5 && (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h3 className="text-xl font-display font-semibold text-foreground mb-2">
              Thank You, {formData.name}!
            </h3>
            <p className="text-muted-foreground mb-6">
              We've received your consultation request. Our team will contact you at{" "}
              <span className="text-foreground">{formData.email}</span> within 24 hours to schedule your free consultation.
            </p>
            <Button onClick={resetForm} variant="hero">
              Done
            </Button>
          </div>
        )}

        {/* Navigation Buttons */}
        {step < 5 && (
          <div className="flex gap-3 mt-4">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
            )}
            {step < 4 ? (
              <Button variant="hero" onClick={handleNext} className="flex-1">
                Continue
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="hero"
                onClick={handleSubmit}
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Booking..." : "Book Meeting"}
                <Calendar className="w-4 h-4" />
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ConsultationModal;
