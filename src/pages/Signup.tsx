
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { API_ENDPOINTS } from "@/lib/config";

const Signup = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        agreeToTerms: false,
    });
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleCheckboxChange = (checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            agreeToTerms: checked,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        if (!formData.agreeToTerms) {
            toast.error("Please agree to the terms and conditions");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(API_ENDPOINTS.AUTH.SIGNUP, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Account created successfully!");
                setTimeout(() => navigate("/login"), 1000);
            } else {
                toast.error(data.message || "Signup failed");
            }
        } catch (error) {
            console.error("Signup error:", error);
            toast.error("Failed to connect to server");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />
            <main className="flex-grow flex items-center justify-center p-4 py-12">
                <div className="w-full max-w-md animate-slide-up">
                    <Card className="border-slate-200 shadow-xl overflow-hidden">
                        <CardHeader className="space-y-1 text-center bg-white pb-8 pt-10">
                            <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">Create an account</CardTitle>
                            <CardDescription className="text-slate-500">
                                Join our platform and start managing your business
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 bg-white px-8 pb-8">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="name"
                                            name="name"
                                            placeholder="John Doe"
                                            type="text"
                                            className="pl-10"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="email"
                                            name="email"
                                            placeholder="name@example.com"
                                            type="email"
                                            className="pl-10"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="password"
                                            name="password"
                                            type={showPassword ? "text" : "password"}
                                            className="pl-10 pr-10"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            required
                                            minLength={8}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <div className="relative">
                                        <CheckCircle2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            type={showPassword ? "text" : "password"}
                                            className="pl-10 pr-10"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex items-start space-x-2 pt-2">
                                    <Checkbox
                                        id="terms"
                                        checked={formData.agreeToTerms}
                                        onCheckedChange={handleCheckboxChange}
                                    />
                                    <label
                                        htmlFor="terms"
                                        className="text-sm font-medium leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600"
                                    >
                                        I agree to the <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                                    </label>
                                </div>
                                <Button className="w-full mt-4 bg-primary hover:bg-primary/90 text-white font-semibold h-11" type="submit" disabled={isLoading}>
                                    {isLoading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                                            Creating account...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            Get Started <ArrowRight className="h-4 w-4" />
                                        </span>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4 bg-slate-50 border-t border-slate-100 p-8 text-center">
                            <div className="text-sm text-slate-600">
                                Already have an account?{" "}
                                <Link to="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                                    Sign in
                                </Link>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Signup;
