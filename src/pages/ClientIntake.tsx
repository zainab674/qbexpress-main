import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowRight, CheckCircle2, Calendar as CalendarIcon, Clock, ChevronRight } from "lucide-react";
import { useParams } from "react-router-dom";
import Cal, { getCalApi } from "@calcom/embed-react";
import { format, isSameDay, parseISO, addDays } from "date-fns";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { API_ENDPOINTS } from "@/lib/config";

const formSchema = z.object({
    accountingSystem: z.string().min(1, { message: "Please select an accounting system" }),
    bankName: z.string().min(2, { message: "Bank name is required" }),
    firstName: z.string().min(2, { message: "First name is required" }),
    lastName: z.string().min(2, { message: "Last name is required" }),
    email: z.string().email({ message: "Invalid email address" }),
    phoneNumber: z.string().min(5, { message: "Phone number is required" }),
    address: z.string().min(5, { message: "Address is required" }),
    country: z.string().min(1, { message: "Please select a country" }),
    teamSize: z.string().min(1, { message: "Please select your team size" }),
    revenue: z.string().min(1, { message: "Average revenue is required" }),
    industry: z.string().min(1, { message: "Please select an industry" }),
    importantThing: z.string().min(10, { message: "Please tell us what matters most to you" }),
    meetingSlot: z.string().optional(),
});

const ClientIntake = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [nextSlot, setNextSlot] = useState<string | null>(null);
    const [allSlots, setAllSlots] = useState<Record<string, any[]>>({});
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const { meeting } = useParams();
    const isMeetingView = !!meeting;

    useEffect(() => {
        if (isMeetingView) {
            (async function () {
                const cal = await getCalApi({ "namespace": "teamteam" });
                cal("ui", { "styles": { "branding": { "brandColor": "#0f172a" } }, "hideEventTypeDetails": false, "layout": "month_view" });
            })();

            const fetchAllSlots = async () => {
                setIsLoadingSlots(true);
                try {
                    const now = new Date();
                    const end = addDays(now, 30);

                    const startStr = now.toISOString();
                    const endStr = end.toISOString();

                    const response = await fetch(`https://api.cal.com/v2/slots/available?eventTypeId=3224126&startTime=${startStr}&endTime=${endStr}`, {
                        headers: {
                            'Authorization': 'Bearer cal_live_ef6ce8f07e9d785f3c9e64cb640f13ce'
                        }
                    });

                    if (response.ok) {
                        const result = await response.json();
                        if (result.status === 'success' && result.data?.slots) {
                            setAllSlots(result.data.slots);

                            const dates = Object.keys(result.data.slots).sort();
                            if (dates.length > 0) {
                                // Set initial selected date to the first available date
                                setSelectedDate(parseISO(dates[0]));

                                const firstDateSlots = result.data.slots[dates[0]];
                                if (firstDateSlots && firstDateSlots.length > 0) {
                                    const nextTime = new Date(firstDateSlots[0].time);
                                    setNextSlot(nextTime.toLocaleString('en-US', {
                                        weekday: 'long',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit',
                                    }));
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error("Error fetching slots:", error);
                    toast.error("Failed to load available meeting times.");
                } finally {
                    setIsLoadingSlots(false);
                }
            };

            fetchAllSlots();
        }
    }, [isMeetingView]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            accountingSystem: "",
            bankName: "",
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            address: "",
            country: "",
            teamSize: "",
            revenue: "",
            industry: "",
            importantThing: "",
            meetingSlot: "",
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (isMeetingView && !selectedSlot) {
            toast.error("Please select a meeting time slot before submitting.");
            return;
        }

        setIsSubmitting(true);
        try {
            // Get user from localStorage
            const userStr = localStorage.getItem('qb_user');
            const userId = userStr ? JSON.parse(userStr).id : undefined;

            // 1. Submit to local backend
            const payload = {
                ...values,
                meetingSlot: selectedSlot,
                meetingDate: selectedDate ? selectedDate.toISOString() : undefined,
                userId: userId
            };

            const backendResponse = await fetch(API_ENDPOINTS.INTAKE, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!backendResponse.ok) {
                const data = await backendResponse.json();
                throw new Error(data.message || "Failed to save information to our database.");
            }

            // 2. If in meeting view, create the booking in Cal.com
            if (isMeetingView && selectedSlot) {
                const calResponse = await fetch('https://api.cal.com/v2/bookings', {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer cal_live_ef6ce8f07e9d785f3c9e64cb640f13ce',
                        'Content-Type': 'application/json',
                        'cal-api-version': '2024-08-13'
                    },
                    body: JSON.stringify({
                        start: selectedSlot,
                        eventTypeId: 3224126,
                        attendee: {
                            name: `${values.firstName} ${values.lastName}`,
                            email: values.email,
                            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                            language: "en"
                        },
                        metadata: {
                            phoneNumber: values.phoneNumber,
                            businessName: values.bankName,
                            importantThing: values.importantThing,
                            address: values.address
                        }
                    })
                });

                if (!calResponse.ok) {
                    const errorData = await calResponse.json();
                    console.error("Cal.com Booking Error:", errorData);
                    toast.warning("Information saved, but we couldn't confirm the meeting on Cal.com. Our team will contact you to reschedule.");
                } else {
                    toast.success("Meeting scheduled and information saved!");
                }
            } else {
                toast.success("Information submitted successfully!");
            }

            setIsSuccess(true);
        } catch (error: any) {
            console.error("Submission error:", error);
            toast.error(error.message || "Failed to submit form. Please check your connection.");
        } finally {
            setIsSubmitting(false);
        }
    }

    const getSlotsForDate = (date?: Date) => {
        if (!date) return [];
        const dateKey = format(date, 'yyyy-MM-dd');
        return allSlots[dateKey] || [];
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex flex-col bg-slate-50">
                <Header />
                <main className="flex-grow flex items-center justify-center p-4">
                    <Card className="w-full max-w-md border-none shadow-xl bg-white/80 backdrop-blur-md animate-scale-in">
                        <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-4">
                            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800">Submission Received!</h2>
                            <p className="text-slate-600">
                                Thank you, {form.getValues("firstName")}. We have received your information and will be in touch shortly.
                            </p>
                            <Button onClick={() => setIsSuccess(false)} variant="outline" className="mt-4">
                                Submit Another Response
                            </Button>
                        </CardContent>
                    </Card>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <Header />
            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto animate-slide-up">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 mb-4">
                            Let's Get to Know Your Business
                        </h1>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                            Please fill out the form below so we can better understand your needs and how QBExpress can empower you.
                        </p>
                    </div>



                    <Card className="border-slate-200 shadow-xl overflow-hidden glass-card">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-8 space-y-1">
                            <CardTitle className="text-xl font-semibold text-slate-800">Business Details</CardTitle>
                            <CardDescription>Tell us about your operations and goals.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* First Name */}
                                        <FormField
                                            control={form.control}
                                            name="firstName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>First Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="John" {...field} className="bg-white/50" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Last Name */}
                                        <FormField
                                            control={form.control}
                                            name="lastName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Last Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Doe" {...field} className="bg-white/50" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Email */}
                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email Address</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="john@company.com" {...field} className="bg-white/50" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Phone Number */}
                                        <FormField
                                            control={form.control}
                                            name="phoneNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Phone Number</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="+1 (555) 000-0000" {...field} className="bg-white/50" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Address */}
                                    <FormField
                                        control={form.control}
                                        name="address"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Business Address</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="123 Business St, Suite 100" {...field} className="bg-white/50" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {/* Industry */}
                                    <FormField
                                        control={form.control}
                                        name="industry"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Industry</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-white/50">
                                                            <SelectValue placeholder="Select industry" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="ecommerce_retail">E-commerce / Retail</SelectItem>
                                                        <SelectItem value="real_estate">Real Estate / Property Management</SelectItem>
                                                        <SelectItem value="construction">Construction</SelectItem>
                                                        <SelectItem value="restaurant">Restaurant / Food Service</SelectItem>
                                                        <SelectItem value="healthcare">Healthcare / Med Tech</SelectItem>
                                                        <SelectItem value="technology_saas">Technology / SaaS</SelectItem>
                                                        <SelectItem value="professional_services">Professional Services</SelectItem>
                                                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                                                        <SelectItem value="architecture_design">Architecture / Design</SelectItem>
                                                        <SelectItem value="wealth_finance">Wealth Advisory / Finance</SelectItem>
                                                        <SelectItem value="msp_it">MSP / IT Services</SelectItem>
                                                        <SelectItem value="other">Other</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Accounting System */}
                                        <FormField
                                            control={form.control}
                                            name="accountingSystem"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Which accounting system do you use?</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-white/50">
                                                                <SelectValue placeholder="Select system" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="quickbooks">Quickbooks</SelectItem>
                                                            <SelectItem value="xero">Xero</SelectItem>
                                                            <SelectItem value="sage">Sage</SelectItem>
                                                            <SelectItem value="freshbooks">Freshbooks</SelectItem>
                                                            <SelectItem value="zoho">Zoho</SelectItem>
                                                            <SelectItem value="not_listed">Not listed</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Team Size */}
                                        <FormField
                                            control={form.control}
                                            name="teamSize"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>How big is your team?</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-white/50">
                                                                <SelectValue placeholder="Select size (partners & founders)" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="1-5">1-5</SelectItem>
                                                            <SelectItem value="6-20">6-20</SelectItem>
                                                            <SelectItem value="21-50">21-50</SelectItem>
                                                            <SelectItem value="51-200">51-200</SelectItem>
                                                            <SelectItem value="200+">200+</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Revenue */}
                                        <FormField
                                            control={form.control}
                                            name="revenue"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>What is your average revenue?</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. $500,000" {...field} className="bg-white/50" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        {/* Bank Details */}
                                        <FormField
                                            control={form.control}
                                            name="bankName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>What bank do you use?</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. Chase, HSBC" {...field} className="bg-white/50" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="country"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Business Bank Account Country</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-white/50">
                                                                <SelectValue placeholder="Select country" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="usa">USA</SelectItem>
                                                            <SelectItem value="canada">Canada</SelectItem>
                                                            <SelectItem value="au_nz">Australia / New Zealand</SelectItem>
                                                            <SelectItem value="uk">UK</SelectItem>
                                                            <SelectItem value="europe">Europe</SelectItem>
                                                            <SelectItem value="asia">Asia</SelectItem>
                                                            <SelectItem value="rest_world">Rest of the World</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* TextArea */}
                                    <FormField
                                        control={form.control}
                                        name="importantThing"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>What's the single most important thing you want QBExpress to empower your clients with?</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Tell us about your goals..."
                                                        className="min-h-[100px] bg-white/50 resize-y"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    {isMeetingView && (
                                        <Card className="mb-10 border-blue-200 bg-blue-50/10 overflow-hidden animate-fade-in shadow-lg">
                                            <CardHeader className="pb-6 border-b border-blue-100 bg-blue-50/50">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-xl flex items-center gap-2 text-blue-900">
                                                        <CalendarIcon className="h-5 w-5 text-blue-600" />
                                                        Schedule Your Consultation
                                                    </CardTitle>
                                                    <div className="flex items-center gap-2 text-sm font-medium text-blue-600 bg-blue-100/50 px-3 py-1 rounded-full">
                                                        <span className="relative flex h-2 w-2">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                                        </span>
                                                        Live Availability
                                                    </div>
                                                </div>
                                                <CardDescription className="text-slate-600">
                                                    Select a convenient date and time for your meeting with our team.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-0">
                                                <div className="flex flex-col md:flex-row min-h-[400px]">
                                                    {/* Left: Date Selection */}
                                                    <div className="flex-1 p-6 border-b md:border-b-0 md:border-r border-slate-100 bg-white">
                                                        <div className="mb-4 flex items-center justify-between">
                                                            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                                                <CalendarIcon className="h-4 w-4 text-primary" />
                                                                1. Select Date
                                                            </h3>
                                                            {selectedDate && (
                                                                <span className="text-xs font-medium text-primary">
                                                                    {format(selectedDate, 'MMMM yyyy')}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <Calendar
                                                            mode="single"
                                                            selected={selectedDate}
                                                            onSelect={(date) => {
                                                                setSelectedDate(date);
                                                                setSelectedSlot(null); // Reset slot when date changes
                                                            }}
                                                            className="rounded-md border shadow-sm mx-auto pointer-events-auto"
                                                            disabled={(date) => {
                                                                const dateKey = format(date, 'yyyy-MM-dd');
                                                                const hasSlots = allSlots[dateKey] && allSlots[dateKey].length > 0;
                                                                return !hasSlots || date < new Date(new Date().setHours(0, 0, 0, 0));
                                                            }}
                                                        />
                                                    </div>

                                                    {/* Right: Time Selection */}
                                                    <div className="flex-1 p-6 bg-slate-50/50">
                                                        <div className="mb-4">
                                                            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                                                                <Clock className="h-4 w-4 text-primary" />
                                                                2. Available Times
                                                            </h3>
                                                            {selectedDate && (
                                                                <p className="text-xs text-slate-500 mt-1">
                                                                    For support on {format(selectedDate, 'EEEE, MMMM do')}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {isLoadingSlots ? (
                                                            <div className="flex flex-col items-center justify-center h-[300px] space-y-3">
                                                                <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                                                                <p className="text-sm text-slate-500 font-medium">Loading slots...</p>
                                                            </div>
                                                        ) : selectedDate ? (
                                                            <ScrollArea className="h-[320px] pr-2">
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                                    {getSlotsForDate(selectedDate).length > 0 ? (
                                                                        getSlotsForDate(selectedDate).map((slot) => {
                                                                            const time = format(parseISO(slot.time), 'h:mm a');
                                                                            const isSelected = selectedSlot === slot.time;
                                                                            return (
                                                                                <Button
                                                                                    key={slot.time}
                                                                                    type="button"
                                                                                    variant={isSelected ? "default" : "outline"}
                                                                                    className={cn(
                                                                                        "justify-center font-medium h-12 transition-all duration-200 border-slate-200",
                                                                                        isSelected ? "bg-primary text-primary-foreground shadow-md scale-[1.02]" : "hover:border-primary/50 hover:bg-primary/5 bg-white"
                                                                                    )}
                                                                                    onClick={() => setSelectedSlot(slot.time)}
                                                                                >
                                                                                    {time}
                                                                                </Button>
                                                                            );
                                                                        })
                                                                    ) : (
                                                                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center text-slate-400">
                                                                            <CalendarIcon className="h-8 w-8 mb-2 opacity-20" />
                                                                            <p className="text-sm">No available slots for this day</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </ScrollArea>
                                                        ) : (
                                                            <div className="h-[320px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-white/50 text-slate-400">
                                                                <ChevronRight className="h-8 w-8 mb-2 opacity-20" />
                                                                <p className="text-sm font-medium">Select a date to see available times</p>
                                                            </div>
                                                        )}

                                                        {selectedSlot && (
                                                            <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-lg animate-fade-in">
                                                                <p className="text-xs text-green-700 font-semibold uppercase tracking-wider mb-1">Appointment Selection</p>
                                                                <p className="text-sm text-green-800 flex items-center gap-2">
                                                                    <CheckCircle2 className="h-4 w-4" />
                                                                    {format(parseISO(selectedSlot), 'EEEE, MMM do')} at {format(parseISO(selectedSlot), 'h:mm a')}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    <Button
                                        type="submit"
                                        className="w-full bg-primary hover:bg-primary/90 hover-lift text-lg h-12 mt-4"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center gap-2">
                                                Processing...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                Submit Information <ArrowRight className="h-4 w-4" />
                                            </span>
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>


                </div>
            </main >
            <Footer />
        </div >
    );
};

export default ClientIntake;
