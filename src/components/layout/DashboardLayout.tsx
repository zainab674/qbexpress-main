import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardHeader } from "./DashboardHeader";
import Header from "./Header";

interface DashboardLayoutProps {
    children: React.ReactNode;
    title?: string;
    onReportSelect?: (report: any) => void;
    headerActions?: React.ReactNode;
}

const DashboardLayout = ({ children, title = "Business overview", onReportSelect, headerActions }: DashboardLayoutProps) => {
    return (
        <div className="flex flex-col h-screen overflow-hidden bg-[#f4f5f8]">
            <Header />
            <div className="flex flex-1 mt-24 overflow-hidden h-[calc(100vh-6rem)]">
                <DashboardSidebar onReportSelect={onReportSelect} />
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <DashboardHeader title={title} actions={headerActions} />
                    <main className="flex-1 overflow-y-auto p-6">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;
