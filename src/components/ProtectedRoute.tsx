
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const userStr = localStorage.getItem("qb_user");

    if (!userStr) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
};
